import { eq, asc, and, inArray, count } from 'drizzle-orm'
import { artworks, techniques, artworkTechniques, artworkLikes, promptPurchases } from '~/server/db/schema'
import { useDb } from '~/server/db'
import { getPromptPrice } from '~/server/utils/prompt-pricing'

export default defineEventHandler(async (event) => {
  const db = useDb()
  const query = getQuery(event)
  const category = query.category as string | undefined
  const withNodes = query.nodes === 'true' // ?nodes=true to include prompt nodes

  // Check if user is authenticated
  let userId: string | undefined
  try {
    const session = await getUserSession(event)
    userId = session?.user?.id as string | undefined
  } catch {
    // nuxt-auth-utils not configured
  }

  // Fetch user's purchased prompt IDs
  let purchasedIds = new Set<string>()
  if (userId) {
    const purchases = await db
      .select({ artworkId: promptPurchases.artworkId })
      .from(promptPurchases)
      .where(and(
        eq(promptPurchases.userId, userId),
        eq(promptPurchases.status, 'completed'),
      ))
    purchasedIds = new Set(purchases.map(p => p.artworkId))
  }

  // Return all artworks (filtered by category if specified)
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

    // Gate premium fields based on purchase status
    const enriched = results.map((artwork) => {
      const unlocked = purchasedIds.has(artwork.id)
      const nodes = nodeMap.get(artwork.id) || []
      return {
        ...artwork,
        rawPrompt: unlocked ? artwork.rawPrompt : null,
        refinementNotes: unlocked ? artwork.refinementNotes : null,
        promptNodes: nodes.map(node => ({
          ...node,
          description: unlocked ? node.description : null,
        })),
        likeCount: likeMap.get(artwork.id) || 0,
        promptUnlocked: unlocked,
        promptPrice: getPromptPrice(artwork.promptPrice),
        hasPrompt: !!artwork.rawPrompt,
      }
    })

    // Per-user responses must not be cached publicly
    setResponseHeaders(event, {
      'Cache-Control': userId
        ? 'private, no-store'
        : 'public, s-maxage=60, stale-while-revalidate=120',
    })

    return { success: true, data: enriched }
  }

  // Plain results (no nodes) — still gate premium fields
  const withLikes = results.map((artwork) => {
    const unlocked = purchasedIds.has(artwork.id)
    return {
      ...artwork,
      rawPrompt: unlocked ? artwork.rawPrompt : null,
      refinementNotes: unlocked ? artwork.refinementNotes : null,
      likeCount: likeMap.get(artwork.id) || 0,
      promptUnlocked: unlocked,
      promptPrice: getPromptPrice(artwork.promptPrice),
      hasPrompt: !!artwork.rawPrompt,
    }
  })

  setResponseHeaders(event, {
    'Cache-Control': userId
      ? 'private, no-store'
      : 'public, s-maxage=60, stale-while-revalidate=120',
  })

  return { success: true, data: withLikes }
})
