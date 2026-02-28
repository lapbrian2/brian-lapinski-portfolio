import { inArray } from 'drizzle-orm'
import { artworks } from '~/server/db/schema'
import { useDb } from '~/server/db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { ids, published } = body

  if (!Array.isArray(ids) || ids.length === 0 || ids.length > 100) {
    throw createError({ statusCode: 400, statusMessage: 'ids must be a non-empty array (max 100)' })
  }

  if (typeof published !== 'boolean') {
    throw createError({ statusCode: 400, statusMessage: 'published must be a boolean' })
  }

  const db = useDb()
  await db
    .update(artworks)
    .set({ published, updatedAt: new Date().toISOString() })
    .where(inArray(artworks.id, ids))

  return { success: true, updated: ids.length }
})
