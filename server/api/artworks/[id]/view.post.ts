import { pageViews } from '~/server/db/schema'
import { useDb } from '~/server/db'
import { hashIp } from '~/server/utils/hash-ip'

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
