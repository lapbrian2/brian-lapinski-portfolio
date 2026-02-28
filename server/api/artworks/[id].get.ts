import { eq, and, count } from 'drizzle-orm'
import { artworks, artworkLikes, artworkTechniques, techniques, promptPurchases } from '~/server/db/schema'
import { useDb } from '~/server/db'
import { getPromptPrice } from '~/server/utils/prompt-pricing'

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

  // Check if user is authenticated + has purchased this prompt
  let userId: string | undefined
  try {
    const session = await getUserSession(event)
    userId = session?.user?.id as string | undefined
  } catch (err) {
    console.error('Session lookup failed:', err)
    // nuxt-auth-utils not configured
  }

  let unlocked = false
  if (userId) {
    const [purchase] = await db
      .select({ id: promptPurchases.id })
      .from(promptPurchases)
      .where(and(
        eq(promptPurchases.userId, userId),
        eq(promptPurchases.artworkId, id),
        eq(promptPurchases.status, 'completed'),
      ))
      .limit(1)
    unlocked = !!purchase
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
    description: unlocked ? j.techniqueDescription : null,
  }))

  setResponseHeaders(event, {
    'Cache-Control': userId
      ? 'private, no-store'
      : 'public, s-maxage=60, stale-while-revalidate=120',
  })

  return {
    success: true,
    data: {
      ...artwork,
      rawPrompt: unlocked ? artwork.rawPrompt : null,
      refinementNotes: unlocked ? artwork.refinementNotes : null,
      likeCount: likeResult?.total || 0,
      promptNodes,
      promptUnlocked: unlocked,
      promptPrice: getPromptPrice(artwork.promptPrice),
      hasPrompt: !!artwork.rawPrompt,
    },
  }
})
