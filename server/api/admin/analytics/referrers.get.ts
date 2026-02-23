import { sql } from 'drizzle-orm'
import { pageViews } from '~/server/db/schema'
import { useDb } from '~/server/db'

export default defineEventHandler(async () => {
  const db = useDb()

  const results = await db
    .select({
      referrer: pageViews.referrer,
      views: sql<number>`count(*)`,
    })
    .from(pageViews)
    .where(sql`${pageViews.referrer} is not null`)
    .groupBy(pageViews.referrer)
    .orderBy(sql`count(*) desc`)
    .limit(20)

  return { success: true, data: results }
})
