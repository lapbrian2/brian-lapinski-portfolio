import { desc, eq, asc } from 'drizzle-orm'
import { orders, orderItems, printVariants, printProducts, artworks } from '~/server/db/schema'
import { useDb } from '~/server/db'

export default defineEventHandler(async () => {
  const db = useDb()

  // Fetch all orders, newest first
  const allOrders = await db
    .select()
    .from(orders)
    .orderBy(desc(orders.createdAt))

  // Fetch all order items with variant/product/artwork info
  const allItems = await db
    .select({
      id: orderItems.id,
      orderId: orderItems.orderId,
      variantId: orderItems.variantId,
      quantity: orderItems.quantity,
      unitPrice: orderItems.unitPrice,
      sizeName: printVariants.sizeName,
      sizeWidth: printVariants.sizeWidth,
      sizeHeight: printVariants.sizeHeight,
      material: printVariants.material,
      artworkTitle: artworks.title,
      artworkSrc: artworks.src,
    })
    .from(orderItems)
    .innerJoin(printVariants, eq(orderItems.variantId, printVariants.id))
    .innerJoin(printProducts, eq(printVariants.productId, printProducts.id))
    .innerJoin(artworks, eq(printProducts.artworkId, artworks.id))
    .orderBy(asc(orderItems.id))

  // Group items by order
  const itemMap = new Map<number, typeof allItems>()
  for (const item of allItems) {
    if (!itemMap.has(item.orderId)) itemMap.set(item.orderId, [])
    itemMap.get(item.orderId)!.push(item)
  }

  const data = allOrders.map((order) => ({
    ...order,
    items: itemMap.get(order.id) || [],
  }))

  return { success: true, data }
})
