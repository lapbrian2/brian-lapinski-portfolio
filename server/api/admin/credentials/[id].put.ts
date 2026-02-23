import { eq } from 'drizzle-orm'
import { credentials } from '~/server/db/schema'
import { useDb } from '~/server/db'

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  if (!id) throw createError({ statusCode: 400, statusMessage: 'ID required' })

  const body = await readBody(event)
  const db = useDb()

  const updateData: Record<string, any> = {}
  if (body.name) updateData.name = body.name.trim()
  if (body.type) updateData.type = body.type
  if (body.sortOrder !== undefined) updateData.sortOrder = Number(body.sortOrder)

  await db.update(credentials).set(updateData).where(eq(credentials.id, id))
  return { success: true, data: { id } }
})
