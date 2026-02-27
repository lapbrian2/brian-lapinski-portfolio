import { eq, and, asc, inArray, count } from 'drizzle-orm'
import { artworks, techniques, artworkTechniques, artworkLikes } from '~/server/db/schema'
import { useDb } from '~/server/db'

// Known artwork IDs that have image files — fallback when published column doesn't exist yet
const KNOWN_IMAGE_IDS = new Set([
  'veiled-gaze', 'the-unraveling', 'through-glass', 'the-other-side', 'beneath-the-surface',
  'half-remembered', 'erosion', 'gilt-veil', 'the-elder', 'the-patriarch', 'the-youth',
  'the-vanishing', 'signal-fade', 'bloom-and-bone', 'impasto-man', 'silk-valley', 'the-grove',
  'mountain-veil', 'wind-song', 'the-wanderer', 'blue-architecture', 'luminous-grove',
  'twisted-sentinels', 'the-canopy', 'red-shift', 'night-patrol', 'the-infiltrator',
  'the-operator', 'the-submersible', 'the-scouts', 'city-of-lights', 'the-threshold',
  'golden-passage', 'desert-cathedral', 'the-departure', 'the-deep', 'bioluminescence',
  'leviathan', 'the-wreckage', 'the-procession', 'the-colonnade',
])

export default defineEventHandler(async (event) => {
  const db = useDb()
  const query = getQuery(event)
  const category = query.category as string | undefined
  const withNodes = query.nodes === 'true' // ?nodes=true to include prompt nodes

  // Only return published artworks on the public API
  // Falls back to known image IDs if the published column hasn't been added yet
  let results
  try {
    if (category && category !== 'all') {
      results = await db
        .select()
        .from(artworks)
        .where(and(eq(artworks.published, true), eq(artworks.category, category)))
        .orderBy(asc(artworks.sortOrder))
    } else {
      results = await db
        .select()
        .from(artworks)
        .where(eq(artworks.published, true))
        .orderBy(asc(artworks.sortOrder))
    }
  } catch {
    // published column may not exist yet — fall back to all artworks filtered by known IDs
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
    results = results.filter((a) => KNOWN_IMAGE_IDS.has(a.id))
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
