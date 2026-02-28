import { eq, and } from 'drizzle-orm'
import { promptPurchases, artworks } from '~/server/db/schema'
import { useDb } from '~/server/db'

export default defineEventHandler(async (event) => {
  let userId: string | undefined
  try {
    const session = await getUserSession(event)
    userId = session?.user?.id as string | undefined
  } catch {
    // nuxt-auth-utils not configured
  }

  if (!userId) {
    return { success: true, data: [] }
  }

  const db = useDb()
  const query = getQuery(event)
  const detail = query.detail === 'true'

  const completedByUser = and(
    eq(promptPurchases.userId, userId),
    eq(promptPurchases.status, 'completed'),
  )

  // Fast path: just return IDs (used by composable hydration)
  if (!detail) {
    const purchases = await db
      .select({ artworkId: promptPurchases.artworkId })
      .from(promptPurchases)
      .where(completedByUser)

    return {
      success: true,
      data: purchases.map(p => p.artworkId),
    }
  }

  // Detail path: return full purchase info with artwork data
  const purchases = await db
    .select({
      artworkId: promptPurchases.artworkId,
      pricePaid: promptPurchases.pricePaid,
      purchasedAt: promptPurchases.createdAt,
      title: artworks.title,
      src: artworks.src,
    })
    .from(promptPurchases)
    .leftJoin(artworks, eq(promptPurchases.artworkId, artworks.id))
    .where(completedByUser)

  return {
    success: true,
    data: purchases.map(p => ({
      artworkId: p.artworkId,
      title: p.title || 'Untitled',
      src: p.src || '',
      pricePaid: p.pricePaid,
      purchasedAt: p.purchasedAt,
    })),
  }
})
