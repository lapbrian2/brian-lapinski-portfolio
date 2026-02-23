import { eq } from 'drizzle-orm'
import { credentials } from '~/server/db/schema'
import { useDb } from '~/server/db'

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  if (!id) throw createError({ statusCode: 400, statusMessage: 'ID required' })

  const db = useDb()
  await db.delete(credentials).where(eq(credentials.id, id))
  return { success: true, data: { deleted: id } }
})
