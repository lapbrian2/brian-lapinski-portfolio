import { eq } from 'drizzle-orm'
import { promptPurchases } from '~/server/db/schema'
import { useDb } from '~/server/db'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Purchase ID required' })
  }

  const db = useDb()

  // Find the purchase
  const [purchase] = await db
    .select({
      id: promptPurchases.id,
      status: promptPurchases.status,
      stripePaymentIntentId: promptPurchases.stripePaymentIntentId,
    })
    .from(promptPurchases)
    .where(eq(promptPurchases.id, Number(id)))
    .limit(1)

  if (!purchase) {
    throw createError({ statusCode: 404, statusMessage: 'Purchase not found' })
  }

  if (purchase.status === 'refunded') {
    throw createError({ statusCode: 400, statusMessage: 'Purchase already refunded' })
  }

  if (!purchase.stripePaymentIntentId) {
    throw createError({ statusCode: 400, statusMessage: 'No payment intent — cannot process refund' })
  }

  // Issue Stripe refund
  const config = useRuntimeConfig()
  try {
    const stripe = new (await import('stripe')).default(config.stripeSecretKey as string)
    await stripe.refunds.create({
      payment_intent: purchase.stripePaymentIntentId,
    })
  } catch (err) {
    console.error('[admin] Stripe refund failed:', err, { purchaseId: id })
    throw createError({ statusCode: 500, statusMessage: 'Stripe refund failed — check logs' })
  }

  // Update local record (webhook will also update on charge.refunded, but do it eagerly)
  await db
    .update(promptPurchases)
    .set({
      status: 'refunded',
      refundedAt: new Date().toISOString(),
    })
    .where(eq(promptPurchases.id, Number(id)))

  return { success: true }
})
