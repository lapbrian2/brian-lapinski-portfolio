import { eq } from 'drizzle-orm'
import { artworks } from '~/server/db/schema'
import { useDb } from '~/server/db'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'ID required' })

  const body = await readBody(event)
  const db = useDb()

  const updateData: Record<string, unknown> = {}
  const fields = ['title', 'category', 'medium', 'description', 'src', 'aspect', 'year', 'sortOrder', 'featured', 'published', 'rawPrompt', 'mjVersion', 'refinementNotes', 'dominantColor', 'promptPrice'] as const
  const numericFields = new Set(['year', 'sortOrder', 'promptPrice'])

  for (const field of fields) {
    if (body[field] !== undefined) {
      updateData[field] = numericFields.has(field) ? Number(body[field]) : body[field]
    }
  }

  if (Object.keys(updateData).length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'No fields to update' })
  }

  updateData.updatedAt = new Date().toISOString()

  await db.update(artworks).set(updateData).where(eq(artworks.id, id))

  return { success: true, data: { id } }
})
