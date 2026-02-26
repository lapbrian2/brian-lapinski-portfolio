import { eq, asc, inArray, count } from 'drizzle-orm'
import { artworks, techniques, artworkTechniques, artworkLikes } from '~/server/db/schema'
import { useDb } from '~/server/db'

export default defineEventHandler(async (event) => {
  const db = useDb()
  const query = getQuery(event)
  const category = query.category as string | undefined
  const withNodes = query.nodes === 'true' // ?nodes=true to include prompt nodes

  let results
  if (category && category !== 'all') {
    results = await db
      .select()
      .from(artworks)
      .where(eq(artworks.category, category))
      .orderBy(asc(artworks.sortOrder))
  } else {
    results = await db
      .select()
      .from(artworks)
      .orderBy(asc(artworks.sortOrder))
  }

  // Fetch like counts for all artworks
  const likeCounts = await db
    .select({
      artworkId: artworkLikes.artworkId,
      total: count(),
    })
    .from(artworkLikes)
    .groupBy(artworkLikes.artworkId)

  const likeMap = new Map<string, number>()
  for (const lc of likeCounts) {
    likeMap.set(lc.artworkId, lc.total)
  }

  // If nodes requested, hydrate each artwork with its technique nodes
  if (withNodes && results.length > 0) {
    const artworkIds = results.map((a) => a.id)

    // Fetch all junction records + technique data in one query
    const junctions = await db
      .select({
        artworkId: artworkTechniques.artworkId,
        techniqueId: techniques.id,
        techniqueName: techniques.name,
        techniqueCategory: techniques.category,
        techniqueDescription: techniques.description,
      })
      .from(artworkTechniques)
      .innerJoin(techniques, eq(artworkTechniques.techniqueId, techniques.id))
      .where(inArray(artworkTechniques.artworkId, artworkIds))

    // Group by artwork ID
    const nodeMap = new Map<string, Array<{ id: string; name: string; category: string; description: string | null }>>()
    for (const j of junctions) {
      if (!nodeMap.has(j.artworkId)) nodeMap.set(j.artworkId, [])
      nodeMap.get(j.artworkId)!.push({
        id: j.techniqueId,
        name: j.techniqueName,
        category: j.techniqueCategory,
        description: j.techniqueDescription,
      })
    }

    // Flatten into response
    const enriched = results.map((artwork) => ({
      ...artwork,
      promptNodes: nodeMap.get(artwork.id) || [],
      likeCount: likeMap.get(artwork.id) || 0,
    }))

    setResponseHeaders(event, {
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
    })

    return { success: true, data: enriched }
  }

  // Cache for 60s, stale-while-revalidate for 2 min
  setResponseHeaders(event, {
    'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
  })

  // Add like counts to plain results
  const withLikes = results.map((artwork) => ({
    ...artwork,
    likeCount: likeMap.get(artwork.id) || 0,
  }))

  return { success: true, data: withLikes }
})
