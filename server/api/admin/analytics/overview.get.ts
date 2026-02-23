import { sql } from 'drizzle-orm'
import { pageViews } from '~/server/db/schema'
import { useDb } from '~/server/db'

export default defineEventHandler(async () => {
  const db = useDb()

  const now = new Date()
  const todayStr = now.toISOString().split('T')[0]
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()

  const [totalResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(pageViews)

  const [todayResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(pageViews)
    .where(sql`date(${pageViews.createdAt}) = ${todayStr}`)

  const [weekResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(pageViews)
    .where(sql`${pageViews.createdAt} >= ${weekAgo}`)

  const [uniqueResult] = await db
    .select({ count: sql<number>`count(distinct ${pageViews.ip})` })
    .from(pageViews)
    .where(sql`${pageViews.ip} is not null and ${pageViews.createdAt} >= ${monthAgo}`)

  return {
    success: true,
    data: {
      totalViews: totalResult.count,
      todayViews: todayResult.count,
      weekViews: weekResult.count,
      uniqueVisitors30d: uniqueResult.count,
    },
  }
})
