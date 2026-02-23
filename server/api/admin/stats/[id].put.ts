import { eq } from 'drizzle-orm'
import { stats } from '~/server/db/schema'
import { useDb } from '~/server/db'

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  if (!id) throw createError({ statusCode: 400, statusMessage: 'ID required' })

  const body = await readBody(event)
  const db = useDb()

  const updateData: Record<string, any> = {}
  if (body.value) updateData.value = body.value
  if (body.label) updateData.label = body.label
  if (body.sortOrder !== undefined) updateData.sortOrder = Number(body.sortOrder)

  await db.update(stats).set(updateData).where(eq(stats.id, id))
  return { success: true, data: { id } }
})
