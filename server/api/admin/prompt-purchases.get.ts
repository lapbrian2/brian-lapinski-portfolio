import { desc, eq, and, gte, lte, sum, count } from 'drizzle-orm'
import { promptPurchases, users, artworks } from '~/server/db/schema'
import { useDb } from '~/server/db'

export default defineEventHandler(async (event) => {
  const db = useDb()
  const query = getQuery(event)
  const status = query.status as string | undefined
  const from = query.from as string | undefined
  const to = query.to as string | undefined

  // Build WHERE conditions
  const conditions = []
  if (status) {
    conditions.push(eq(promptPurchases.status, status))
  }
  if (from) {
    conditions.push(gte(promptPurchases.createdAt, from))
  }
  if (to) {
    conditions.push(lte(promptPurchases.createdAt, to))
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined

  // Fetch purchases with user + artwork info
  const purchases = await db
    .select({
      id: promptPurchases.id,
      artworkId: promptPurchases.artworkId,
      artworkTitle: artworks.title,
      artworkSrc: artworks.src,
      userName: users.name,
      userEmail: users.email,
      pricePaid: promptPurchases.pricePaid,
      status: promptPurchases.status,
      email: promptPurchases.email,
      refundedAt: promptPurchases.refundedAt,
      createdAt: promptPurchases.createdAt,
    })
    .from(promptPurchases)
    .leftJoin(users, eq(promptPurchases.userId, users.id))
    .leftJoin(artworks, eq(promptPurchases.artworkId, artworks.id))
    .where(whereClause)
    .orderBy(desc(promptPurchases.createdAt))
    .limit(100)

  // Summary stats (completed only)
  const [stats] = await db
    .select({
      totalRevenue: sum(promptPurchases.pricePaid),
      totalCount: count(),
    })
    .from(promptPurchases)
    .where(eq(promptPurchases.status, 'completed'))

  return {
    success: true,
    summary: {
      totalRevenue: Number(stats?.totalRevenue || 0),
      totalCount: stats?.totalCount || 0,
    },
    data: purchases,
  }
})
