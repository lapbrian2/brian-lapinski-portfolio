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
      if (numericFields.has(field)) {
        const num = Number(body[field])
        if (isNaN(num)) {
          throw createError({ statusCode: 400, statusMessage: `${field} must be a valid number` })
        }
        // Range validation
        if (field === 'year' && (num < 1900 || num > 2100)) {
          throw createError({ statusCode: 400, statusMessage: 'Year must be between 1900 and 2100' })
        }
        if (field === 'sortOrder' && (num < -1000 || num > 10000)) {
          throw createError({ statusCode: 400, statusMessage: 'Sort order must be between -1000 and 10000' })
        }
        if (field === 'promptPrice' && (num < 99 || num > 9999)) {
          throw createError({ statusCode: 400, statusMessage: 'Prompt price must be between $0.99 and $99.99' })
        }
        updateData[field] = num
      } else {
        updateData[field] = body[field]
      }
    }
  }

  if (Object.keys(updateData).length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'No fields to update' })
  }

  updateData.updatedAt = new Date().toISOString()

  await db.update(artworks).set(updateData).where(eq(artworks.id, id))

  return { success: true, data: { id } }
})
