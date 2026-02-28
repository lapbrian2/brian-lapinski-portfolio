import { eq, and, gte, sum, count, desc } from 'drizzle-orm'
import { promptPurchases, artworks } from '~/server/db/schema'
import { useDb } from '~/server/db'
import { sql } from 'drizzle-orm'

export default defineEventHandler(async () => {
  const db = useDb()
  const now = new Date()

  // Start of current month (ISO)
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  // 7 days ago
  const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
  // 30 days ago
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()

  const completedFilter = eq(promptPurchases.status, 'completed')

  // Total revenue (all time)
  const [totalStats] = await db
    .select({
      revenue: sum(promptPurchases.pricePaid),
      count: count(),
    })
    .from(promptPurchases)
    .where(completedFilter)

  // Month revenue
  const [monthStats] = await db
    .select({ revenue: sum(promptPurchases.pricePaid) })
    .from(promptPurchases)
    .where(and(completedFilter, gte(promptPurchases.createdAt, monthStart)))

  // Week revenue
  const [weekStats] = await db
    .select({ revenue: sum(promptPurchases.pricePaid) })
    .from(promptPurchases)
    .where(and(completedFilter, gte(promptPurchases.createdAt, weekStart)))

  // Top 5 selling prompts
  const topPrompts = await db
    .select({
      artworkId: promptPurchases.artworkId,
      title: artworks.title,
      revenue: sum(promptPurchases.pricePaid),
      count: count(),
    })
    .from(promptPurchases)
    .leftJoin(artworks, eq(promptPurchases.artworkId, artworks.id))
    .where(completedFilter)
    .groupBy(promptPurchases.artworkId, artworks.title)
    .orderBy(desc(sum(promptPurchases.pricePaid)))
    .limit(5)

  // Daily revenue (last 30 days)
  const dailyRevenue = await db
    .select({
      date: sql<string>`date(${promptPurchases.createdAt})`.as('day'),
      revenue: sum(promptPurchases.pricePaid),
      count: count(),
    })
    .from(promptPurchases)
    .where(and(completedFilter, gte(promptPurchases.createdAt, thirtyDaysAgo)))
    .groupBy(sql`date(${promptPurchases.createdAt})`)
    .orderBy(sql`date(${promptPurchases.createdAt})`)

  return {
    success: true,
    data: {
      totalRevenue: Number(totalStats?.revenue || 0),
      monthRevenue: Number(monthStats?.revenue || 0),
      weekRevenue: Number(weekStats?.revenue || 0),
      totalPurchases: totalStats?.count || 0,
      topPrompts: topPrompts.map(p => ({
        artworkId: p.artworkId,
        title: p.title || 'Untitled',
        revenue: Number(p.revenue || 0),
        count: p.count,
      })),
      dailyRevenue: dailyRevenue.map(d => ({
        date: d.date,
        revenue: Number(d.revenue || 0),
        count: d.count,
      })),
    },
  }
})
