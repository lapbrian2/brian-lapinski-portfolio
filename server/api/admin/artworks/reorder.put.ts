import { eq } from 'drizzle-orm'
import { artworks } from '~/server/db/schema'
import { useDb } from '~/server/db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { order } = body // Array of { id, sortOrder }

  if (!Array.isArray(order)) {
    throw createError({ statusCode: 400, statusMessage: 'order array required' })
  }

  const db = useDb()

  for (const item of order) {
    await db
      .update(artworks)
      .set({ sortOrder: item.sortOrder, updatedAt: new Date().toISOString() })
      .where(eq(artworks.id, item.id))
  }

  return { success: true, data: { updated: order.length } }
})
