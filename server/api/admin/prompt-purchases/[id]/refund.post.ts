import { eq } from 'drizzle-orm'
import { promptPurchases } from '~/server/db/schema'
import { useDb } from '~/server/db'
import { createLogger } from '~/server/utils/logger'

const log = createLogger('admin:refund')

export default defineEventHandler(async (event) => {
  const numId = requireNumericParam(event, 'id', 'Purchase ID')

  const db = useDb()

  // Find the purchase
  const [purchase] = await db
    .select({
      id: promptPurchases.id,
      status: promptPurchases.status,
      stripePaymentIntentId: promptPurchases.stripePaymentIntentId,
    })
    .from(promptPurchases)
    .where(eq(promptPurchases.id, numId))
    .limit(1)

  if (!purchase) {
    throw createError({ statusCode: 404, statusMessage: 'Purchase not found' })
  }

  if (purchase.status !== 'completed') {
    throw createError({ statusCode: 400, statusMessage: `Cannot refund purchase with status '${purchase.status}'` })
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
    log.error('Stripe refund failed:', err, { purchaseId: numId })
    throw createError({ statusCode: 500, statusMessage: 'Stripe refund failed — check logs' })
  }

  // Update local record (webhook will also update on charge.refunded, but do it eagerly)
  await db
    .update(promptPurchases)
    .set({
      status: 'refunded',
      refundedAt: new Date().toISOString(),
    })
    .where(eq(promptPurchases.id, numId))

  return { success: true }
})
