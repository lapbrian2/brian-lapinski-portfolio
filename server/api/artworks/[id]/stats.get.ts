import { eq, count } from 'drizzle-orm'
import { pageViews, artworkLikes } from '~/server/db/schema'
import { useDb } from '~/server/db'

export default defineEventHandler(async (event) => {
  const artworkId = getRouterParam(event, 'id')
  if (!artworkId) {
    throw createError({ statusCode: 400, statusMessage: 'Artwork ID required' })
  }

  const db = useDb()

  // Fetch view count and like count in parallel
  const [viewResult, likeResult] = await Promise.all([
    db
      .select({ total: count() })
      .from(pageViews)
      .where(eq(pageViews.artworkId, artworkId)),
    db
      .select({ total: count() })
      .from(artworkLikes)
      .where(eq(artworkLikes.artworkId, artworkId)),
  ])

  setResponseHeaders(event, {
    'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
  })

  return {
    success: true,
    views: viewResult[0]?.total || 0,
    likes: likeResult[0]?.total || 0,
  }
})
