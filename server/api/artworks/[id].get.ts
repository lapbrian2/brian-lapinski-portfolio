import { eq, count } from 'drizzle-orm'
import { artworks, artworkLikes, artworkTechniques, techniques } from '~/server/db/schema'
import { useDb } from '~/server/db'

export default defineEventHandler(async (event) => {
  const db = useDb()
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Artwork ID required' })
  }

  const [artwork] = await db
    .select()
    .from(artworks)
    .where(eq(artworks.id, id))
    .limit(1)

  if (!artwork) {
    throw createError({ statusCode: 404, statusMessage: 'Artwork not found' })
  }

  // Fetch like count
  const [likeResult] = await db
    .select({ total: count() })
    .from(artworkLikes)
    .where(eq(artworkLikes.artworkId, id))

  // Fetch technique nodes
  const junctions = await db
    .select({
      techniqueId: techniques.id,
      techniqueName: techniques.name,
      techniqueCategory: techniques.category,
      techniqueDescription: techniques.description,
    })
    .from(artworkTechniques)
    .innerJoin(techniques, eq(artworkTechniques.techniqueId, techniques.id))
    .where(eq(artworkTechniques.artworkId, id))

  const promptNodes = junctions.map(j => ({
    id: j.techniqueId,
    name: j.techniqueName,
    category: j.techniqueCategory,
    description: j.techniqueDescription,
  }))

  setResponseHeaders(event, {
    'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
  })

  return {
    success: true,
    data: {
      ...artwork,
      likeCount: likeResult?.total || 0,
      promptNodes,
    },
  }
})
