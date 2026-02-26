import { eq, and, count } from 'drizzle-orm'
import { artworkLikes } from '~/server/db/schema'
import { useDb } from '~/server/db'

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

  // Get total count
  const [result] = await db
    .select({ total: count() })
    .from(artworkLikes)
    .where(eq(artworkLikes.artworkId, artworkId))

  return {
    success: true,
    liked: existing.length > 0,
    count: result?.total || 0,
  }
})

async function hashIp(ip: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(ip + '_salt_lapinski_art')
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 16)
}
