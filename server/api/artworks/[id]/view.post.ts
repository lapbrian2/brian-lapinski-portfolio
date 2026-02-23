import { pageViews } from '~/server/db/schema'
import { useDb } from '~/server/db'

export default defineEventHandler(async (event) => {
  const artworkId = getRouterParam(event, 'id')
  if (!artworkId) {
    throw createError({ statusCode: 400, statusMessage: 'Artwork ID required' })
  }

  // Fire and forget
  try {
    const db = useDb()
    const ip = getRequestHeader(event, 'x-forwarded-for')?.split(',')[0]?.trim()
      || getRequestHeader(event, 'x-real-ip')
      || ''
    const hashedIp = ip ? await hashIp(ip) : null
    const country = getRequestHeader(event, 'x-vercel-ip-country') || null

    await db.insert(pageViews).values({
      path: `/artworks/${artworkId}`,
      artworkId,
      ip: hashedIp,
      country,
    })
  } catch {
    // Silently fail
  }

  return { success: true }
})

async function hashIp(ip: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(ip + '_salt_lapinski_art')
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 16)
}
