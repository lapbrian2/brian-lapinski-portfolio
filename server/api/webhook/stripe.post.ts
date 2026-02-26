import { eq } from 'drizzle-orm'
import { orders, orderItems, printVariants, printProducts, artworks } from '~/server/db/schema'
import { useDb } from '~/server/db'
import { orderConfirmationEmail, adminOrderNotificationEmail } from '~/server/utils/email-templates'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const stripe = new (await import('stripe')).default(config.stripeSecretKey as string)

  // Read raw body for signature verification
  const rawBody = await readRawBody(event)
  if (!rawBody) {
    throw createError({ statusCode: 400, statusMessage: 'Missing request body' })
  }

  const signature = getHeader(event, 'stripe-signature')
  if (!signature) {
    throw createError({ statusCode: 400, statusMessage: 'Missing stripe-signature header' })
  }

  let stripeEvent
  try {
    stripeEvent = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      config.stripeWebhookSecret as string,
    )
  } catch (err: any) {
    throw createError({ statusCode: 400, statusMessage: `Webhook signature verification failed: ${err.message}` })
  }

  const db = useDb()

  if (stripeEvent.type === 'checkout.session.completed') {
    const session = stripeEvent.data.object as any
    const orderId = session.metadata?.orderId
    const customerEmail = session.customer_details?.email || ''

    if (orderId) {
      // Update order with payment info
      await db
        .update(orders)
        .set({
          status: 'paid',
          email: customerEmail,
          stripePaymentIntentId: session.payment_intent || null,
          shippingName: session.shipping_details?.name || session.customer_details?.name || null,
          shippingAddress: session.shipping_details?.address
            ? JSON.stringify(session.shipping_details.address)
            : null,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(orders.id, Number(orderId)))

      // Fetch order details for email
      const [order] = await db
        .select()
        .from(orders)
        .where(eq(orders.id, Number(orderId)))
        .limit(1)

      const items = await db
        .select({
          artworkTitle: artworks.title,
          sizeName: printVariants.sizeName,
          material: printVariants.material,
          quantity: orderItems.quantity,
          unitPrice: orderItems.unitPrice,
        })
        .from(orderItems)
        .innerJoin(printVariants, eq(orderItems.variantId, printVariants.id))
        .innerJoin(printProducts, eq(printVariants.productId, printProducts.id))
        .innerJoin(artworks, eq(printProducts.artworkId, artworks.id))
        .where(eq(orderItems.orderId, Number(orderId)))

      // Send email notifications
      if (config.resendApiKey && order) {
        try {
          const { Resend } = await import('resend')
          const resend = new Resend(config.resendApiKey as string)

          const emailData = {
            orderId: order.id,
            email: customerEmail,
            total: order.total,
            items: items.map((i) => ({
              artworkTitle: i.artworkTitle || 'Untitled',
              sizeName: i.sizeName,
              material: i.material,
              quantity: i.quantity,
              unitPrice: i.unitPrice,
            })),
          }

          // Send confirmation to buyer
          if (customerEmail) {
            const confirmation = orderConfirmationEmail(emailData)
            await resend.emails.send({
              from: config.resendFromEmail as string,
              to: customerEmail,
              subject: confirmation.subject,
              html: confirmation.html,
            })
          }

          // Send notification to admin
          const adminNotif = adminOrderNotificationEmail(emailData)
          await resend.emails.send({
            from: config.resendFromEmail as string,
            to: config.contactNotificationEmail as string,
            subject: adminNotif.subject,
            html: adminNotif.html,
          })
        } catch (err) {
          console.error('Order email notification failed:', err)
          // Don't fail the webhook — order is already recorded
        }
      }
    }
  }

  return { received: true }
})
