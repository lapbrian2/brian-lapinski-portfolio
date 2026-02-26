import { eq, and, inArray } from 'drizzle-orm'
import { printVariants, printProducts, artworks, orders, orderItems } from '~/server/db/schema'
import { useDb } from '~/server/db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { items } = body as { items?: Array<{ variantId: number; quantity: number }> }

  if (!items || !Array.isArray(items) || items.length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'Items are required' })
  }

  if (items.length > 20) {
    throw createError({ statusCode: 400, statusMessage: 'Too many items in cart (max 20)' })
  }

  // Validate each item shape
  for (const item of items) {
    if (!item.variantId || !item.quantity || item.quantity < 1 || item.quantity > 10) {
      throw createError({ statusCode: 400, statusMessage: 'Each item must have a valid variantId and quantity between 1 and 10' })
    }
  }

  const db = useDb()
  const config = useRuntimeConfig()

  const variantIds = items.map((i) => i.variantId)

  // Fetch variants with product and artwork info, ensuring they are active
  const dbVariants = await db
    .select({
      variantId: printVariants.id,
      productId: printVariants.productId,
      sizeName: printVariants.sizeName,
      sizeWidth: printVariants.sizeWidth,
      sizeHeight: printVariants.sizeHeight,
      material: printVariants.material,
      price: printVariants.price,
      variantActive: printVariants.active,
      productActive: printProducts.active,
      artworkTitle: artworks.title,
    })
    .from(printVariants)
    .innerJoin(printProducts, eq(printVariants.productId, printProducts.id))
    .innerJoin(artworks, eq(printProducts.artworkId, artworks.id))
    .where(inArray(printVariants.id, variantIds))

  // Build a lookup map
  const variantMap = new Map<number, (typeof dbVariants)[0]>()
  for (const v of dbVariants) {
    variantMap.set(v.variantId, v)
  }

  // Validate all items exist and are active
  for (const item of items) {
    const variant = variantMap.get(item.variantId)
    if (!variant) {
      throw createError({ statusCode: 400, statusMessage: `Variant ${item.variantId} not found` })
    }
    if (!variant.variantActive || !variant.productActive) {
      throw createError({ statusCode: 400, statusMessage: `Variant ${item.variantId} is not available` })
    }
  }

  // Calculate total from DB prices (not client prices)
  let total = 0
  const lineItems: Array<{ variantId: number; quantity: number; unitPrice: number }> = []

  for (const item of items) {
    const variant = variantMap.get(item.variantId)!
    const unitPrice = variant.price
    total += unitPrice * item.quantity
    lineItems.push({ variantId: item.variantId, quantity: item.quantity, unitPrice })
  }

  // Create order in DB with status 'pending'
  const [order] = await db
    .insert(orders)
    .values({
      email: '', // Will be filled by Stripe webhook with customer email
      status: 'pending',
      total,
    })
    .returning({ id: orders.id })

  // Create order items
  await db.insert(orderItems).values(
    lineItems.map((li) => ({
      orderId: order.id,
      variantId: li.variantId,
      quantity: li.quantity,
      unitPrice: li.unitPrice,
    })),
  )

  // Create Stripe Checkout session
  const stripe = new (await import('stripe')).default(config.stripeSecretKey as string)

  const baseUrl = config.public.siteUrl as string

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: items.map((item) => {
      const variant = variantMap.get(item.variantId)!
      return {
        price_data: {
          currency: 'usd',
          product_data: {
            name: `${variant.artworkTitle} — ${variant.sizeName}`,
            description: `${variant.sizeWidth}"×${variant.sizeHeight}" ${variant.material}`,
          },
          unit_amount: variant.price,
        },
        quantity: item.quantity,
      }
    }),
    metadata: {
      orderId: String(order.id),
    },
    success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/cart`,
  })

  // Store session ID on the order
  await db
    .update(orders)
    .set({ stripeSessionId: session.id, updatedAt: new Date().toISOString() })
    .where(eq(orders.id, order.id))

  return { success: true, url: session.url }
})
