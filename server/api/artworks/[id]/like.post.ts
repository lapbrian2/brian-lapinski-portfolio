import { eq, and, count } from 'drizzle-orm'
import { artworkLikes } from '~/server/db/schema'
import { useDb } from '~/server/db'
import { hashIp } from '~/server/utils/hash-ip'

export default defineEventHandler(async (event) => {
  const artworkId = getRouterParam(event, 'id')
  if (!artworkId) {
    throw createError({ statusCode: 400, statusMessage: 'Artwork ID required' })
  }

  const db = useDb()

  // Check if user is authenticated (graceful when auth module not configured)
  let userId: string | undefined
  try {
    const session = await getUserSession(event)
    userId = session?.user?.id as string | undefined
  } catch {
    // nuxt-auth-utils not configured — fall back to IP-based tracking
  }

  // Build unique constraint: prefer userId, fall back to hashed IP
  let whereClause
  if (userId) {
    whereClause = and(
      eq(artworkLikes.artworkId, artworkId),
      eq(artworkLikes.userId, userId),
    )
  } else {
    const ip = getRequestHeader(event, 'x-forwarded-for')?.split(',')[0]?.trim()
      || getRequestHeader(event, 'x-real-ip')
      || ''
    const hashedIp = ip ? await hashIp(ip) : 'anonymous'

    whereClause = and(
      eq(artworkLikes.artworkId, artworkId),
      eq(artworkLikes.ip, hashedIp),
    )
  }

  // Check existing like
  const existing = await db
    .select()
    .from(artworkLikes)
    .where(whereClause)
    .limit(1)

  let liked: boolean

  if (existing.length > 0) {
    // Unlike
    await db.delete(artworkLikes).where(whereClause)
    liked = false
  } else {
    // Like — build insert values
    const ip = getRequestHeader(event, 'x-forwarded-for')?.split(',')[0]?.trim()
      || getRequestHeader(event, 'x-real-ip')
      || ''
    const hashedIp = ip ? await hashIp(ip) : 'anonymous'

    await db.insert(artworkLikes).values({
      artworkId,
      ip: hashedIp,
      userId: userId || null,
    })
    liked = true
  }

  // Get updated count
  const [result] = await db
    .select({ total: count() })
    .from(artworkLikes)
    .where(eq(artworkLikes.artworkId, artworkId))

  return { success: true, liked, count: result?.total || 0 }
})
