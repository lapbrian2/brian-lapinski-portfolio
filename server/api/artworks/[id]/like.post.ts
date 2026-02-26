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
  const ip = getRequestHeader(event, 'x-forwarded-for')?.split(',')[0]?.trim()
    || getRequestHeader(event, 'x-real-ip')
    || ''
  const hashedIp = ip ? await hashIp(ip) : 'anonymous'

  // Check if this IP already liked this artwork
  const existing = await db
    .select()
    .from(artworkLikes)
    .where(and(
      eq(artworkLikes.artworkId, artworkId),
      eq(artworkLikes.ip, hashedIp),
    ))
    .limit(1)

  let liked: boolean

  if (existing.length > 0) {
    // Unlike — remove the existing like
    await db.delete(artworkLikes).where(and(
      eq(artworkLikes.artworkId, artworkId),
      eq(artworkLikes.ip, hashedIp),
    ))
    liked = false
  } else {
    // Like — insert new record
    await db.insert(artworkLikes).values({
      artworkId,
      ip: hashedIp,
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
