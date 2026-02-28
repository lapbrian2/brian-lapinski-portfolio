import { desc, isNull, count, gte } from 'drizzle-orm'
import { subscribers } from '~/server/db/schema'
import { useDb } from '~/server/db'

export default defineEventHandler(async () => {
  const db = useDb()

  // Total subscriber count
  const [totalResult] = await db
    .select({ count: count() })
    .from(subscribers)

  // Active subscriber count (unsubscribedAt IS NULL)
  const [activeResult] = await db
    .select({ count: count() })
    .from(subscribers)
    .where(isNull(subscribers.unsubscribedAt))

  // Recent week subscriber count
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const [recentResult] = await db
    .select({ count: count() })
    .from(subscribers)
    .where(gte(subscribers.createdAt, oneWeekAgo))

  // Last 50 subscribers ordered by createdAt DESC
  const subscriberList = await db
    .select()
    .from(subscribers)
    .orderBy(desc(subscribers.createdAt))
    .limit(50)

  return {
    success: true,
    data: {
      total: totalResult?.count || 0,
      active: activeResult?.count || 0,
      recentWeek: recentResult?.count || 0,
    },
    subscribers: subscriberList,
  }
})
