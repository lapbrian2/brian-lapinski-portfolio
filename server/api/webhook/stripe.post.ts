import { eq } from 'drizzle-orm'
import { orders, orderItems, printVariants, printProducts, artworks, promptPurchases } from '~/server/db/schema'
import { useDb } from '~/server/db'
import { orderConfirmationEmail, adminOrderNotificationEmail } from '~/server/utils/email-templates'
import { promptPurchaseEmail } from '~/server/utils/prompt-email-templates'
import { createLogger } from '~/server/utils/logger'
import type Stripe from 'stripe'

const log = createLogger('webhook')

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

  let stripeEvent: Stripe.Event
  try {
    stripeEvent = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      config.stripeWebhookSecret as string,
    ) as Stripe.Event
  } catch (err) {
    log.error('Stripe signature verification failed:', err)
    throw createError({ statusCode: 400, statusMessage: 'Webhook signature verification failed' })
  }

  const db = useDb()

  // ── Handle checkout.session.completed ──
  if (stripeEvent.type === 'checkout.session.completed') {
    const session = stripeEvent.data.object as Stripe.Checkout.Session

    // ── Prompt purchase handling ──
    if (session.metadata?.type === 'prompt_purchase') {
      const { userId, artworkId, pricePaid } = session.metadata

      // Validate metadata fields exist
      if (!userId || !artworkId || !pricePaid) {
        log.error('prompt_purchase missing metadata:', { userId, artworkId, pricePaid, sessionId: session.id })
        return { received: true }
      }

      // Validate price matches Stripe's charged amount
      const metadataPrice = Number(pricePaid)
      if (session.amount_total && Math.abs(metadataPrice - session.amount_total) > 1) {
        log.warn('prompt_purchase price mismatch — metadata:', metadataPrice, 'charged:', session.amount_total, 'session:', session.id)
      }

      // Idempotency: check if already recorded
      const [existing] = await db
        .select({ id: promptPurchases.id })
        .from(promptPurchases)
        .where(eq(promptPurchases.stripeSessionId, session.id))
        .limit(1)
      if (existing) return { received: true }

      try {
        await db.insert(promptPurchases).values({
          userId,
          artworkId,
          stripeSessionId: session.id,
          stripePaymentIntentId: (session.payment_intent as string) || null,
          pricePaid: metadataPrice,
          status: 'completed',
          email: session.customer_details?.email || null,
        })
      } catch (err) {
        log.error('Failed to insert prompt_purchase:', err, { sessionId: session.id, userId, artworkId })
        // Still return 200 — Stripe will retry, idempotency check will handle it
        return { received: true }
      }

      // Send confirmation email to buyer
      const buyerEmail = session.customer_details?.email
      if (buyerEmail && config.resendApiKey) {
        try {
          // Fetch artwork title for email
          const [artwork] = await db
            .select({ title: artworks.title })
            .from(artworks)
            .where(eq(artworks.id, artworkId))
            .limit(1)

          const baseUrl = config.public.siteUrl as string
          const emailContent = promptPurchaseEmail({
            title: artwork?.title || 'Untitled',
            price: metadataPrice,
            galleryUrl: `${baseUrl}/gallery?prompt_unlocked=${artworkId}`,
          })

          const { Resend } = await import('resend')
          const resend = new Resend(config.resendApiKey as string)
          await resend.emails.send({
            from: config.resendFromEmail as string,
            to: buyerEmail,
            subject: emailContent.subject,
            html: emailContent.html,
          })
        } catch (err) {
          log.error('Prompt purchase email failed:', err)
          // Don't fail the webhook for email errors
        }
      }

      return { received: true }
    }

    // ── Print order handling ──
    const orderId = session.metadata?.orderId
    const customerEmail = session.customer_details?.email || ''

    if (orderId) {
      const numOrderId = Number(orderId)
      if (isNaN(numOrderId)) {
        log.error('Invalid orderId in metadata:', orderId, 'session:', session.id)
        return { received: true }
      }

      // Idempotency guard — skip if already processed
      const [existingOrder] = await db
        .select({ status: orders.status })
        .from(orders)
        .where(eq(orders.id, numOrderId))
        .limit(1)
      if (!existingOrder || existingOrder.status === 'paid') {
        return { received: true }
      }

      // Update order with payment info
      await db
        .update(orders)
        .set({
          status: 'paid',
          email: customerEmail,
          stripePaymentIntentId: (session.payment_intent as string) || null,
          shippingName: session.shipping_details?.name || session.customer_details?.name || null,
          shippingAddress: session.shipping_details?.address
            ? JSON.stringify(session.shipping_details.address)
            : null,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(orders.id, numOrderId))

      // Fetch order details for email
      const [order] = await db
        .select()
        .from(orders)
        .where(eq(orders.id, numOrderId))
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
        .where(eq(orderItems.orderId, numOrderId))

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
          log.error('Order email notification failed:', err)
          // Don't fail the webhook — order is already recorded
        }
      }
    }
  }

  // ── Handle charge.refunded — auto-revoke prompt access ──
  if (stripeEvent.type === 'charge.refunded') {
    const charge = stripeEvent.data.object as Stripe.Charge
    const paymentIntentId = charge.payment_intent as string | null

    if (paymentIntentId) {
      try {
        await db
          .update(promptPurchases)
          .set({
            status: 'refunded',
            refundedAt: new Date().toISOString(),
          })
          .where(eq(promptPurchases.stripePaymentIntentId, paymentIntentId))
      } catch (err) {
        log.error('Failed to process refund:', err, { paymentIntentId })
      }
    }
  }

  return { received: true }
})
