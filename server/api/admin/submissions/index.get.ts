import { desc } from 'drizzle-orm'
import { contactSubmissions } from '~/server/db/schema'
import { useDb } from '~/server/db'

export default defineEventHandler(async () => {
  const db = useDb()
  const results = await db
    .select()
    .from(contactSubmissions)
    .orderBy(desc(contactSubmissions.createdAt))
    .limit(100)

  return { success: true, data: results }
})
