import { eq } from 'drizzle-orm'
import { stats } from '~/server/db/schema'
import { useDb } from '~/server/db'

export default defineEventHandler(async (event) => {
  const id = requireNumericParam(event, 'id')

  const body = await readBody(event)
  const db = useDb()

  const updateData: Record<string, unknown> = {}
  if (body.value) updateData.value = body.value
  if (body.label) updateData.label = body.label
  if (body.sortOrder !== undefined) {
    const sortOrder = Number(body.sortOrder)
    if (isNaN(sortOrder)) throw createError({ statusCode: 400, statusMessage: 'sortOrder must be a number' })
    updateData.sortOrder = sortOrder
  }

  await db.update(stats).set(updateData).where(eq(stats.id, id))
  return { success: true, data: { id } }
})
