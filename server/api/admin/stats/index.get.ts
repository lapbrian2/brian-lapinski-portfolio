import { asc } from 'drizzle-orm'
import { stats } from '~/server/db/schema'
import { useDb } from '~/server/db'

export default defineEventHandler(async () => {
  const db = useDb()
  const results = await db.select().from(stats).orderBy(asc(stats.sortOrder))
  return { success: true, data: results }
})
