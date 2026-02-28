import { eq } from 'drizzle-orm'
import { credentials } from '~/server/db/schema'
import { useDb } from '~/server/db'

export default defineEventHandler(async (event) => {
  const id = requireNumericParam(event, 'id')

  const body = await readBody(event)
  const db = useDb()

  const updateData: Record<string, unknown> = {}
  if (body.name) updateData.name = body.name.trim()
  if (body.type) updateData.type = body.type
  if (body.sortOrder !== undefined) {
    const sortOrder = Number(body.sortOrder)
    if (isNaN(sortOrder)) throw createError({ statusCode: 400, statusMessage: 'sortOrder must be a number' })
    updateData.sortOrder = sortOrder
  }

  await db.update(credentials).set(updateData).where(eq(credentials.id, id))
  return { success: true, data: { id } }
})
