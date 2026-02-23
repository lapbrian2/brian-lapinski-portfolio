import { sql } from 'drizzle-orm'
import { pageViews } from '~/server/db/schema'
import { useDb } from '~/server/db'

export default defineEventHandler(async () => {
  const db = useDb()

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

  const results = await db
    .select({
      date: sql<string>`date(${pageViews.createdAt})`.as('date'),
      views: sql<number>`count(*)`,
      uniqueVisitors: sql<number>`count(distinct ${pageViews.ip})`,
    })
    .from(pageViews)
    .where(sql`${pageViews.createdAt} >= ${thirtyDaysAgo}`)
    .groupBy(sql`date(${pageViews.createdAt})`)
    .orderBy(sql`date(${pageViews.createdAt}) asc`)

  return { success: true, data: results }
})
