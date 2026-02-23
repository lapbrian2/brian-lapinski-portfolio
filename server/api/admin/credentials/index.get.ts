import { asc } from 'drizzle-orm'
import { credentials } from '~/server/db/schema'
import { useDb } from '~/server/db'

export default defineEventHandler(async () => {
  const db = useDb()
  const results = await db.select().from(credentials).orderBy(asc(credentials.sortOrder))
  return { success: true, data: results }
})
