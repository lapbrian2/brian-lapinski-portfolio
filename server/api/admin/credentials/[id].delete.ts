import { eq } from 'drizzle-orm'
import { credentials } from '~/server/db/schema'
import { useDb } from '~/server/db'

export default defineEventHandler(async (event) => {
  const id = requireNumericParam(event, 'id')

  const db = useDb()
  await db.delete(credentials).where(eq(credentials.id, id))
  return { success: true, data: { deleted: id } }
})
