import { eq } from 'drizzle-orm'
import { printProducts, artworks } from '~/server/db/schema'
import { useDb } from '~/server/db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { artworkId } = body as { artworkId?: string }

  if (!artworkId) {
    throw createError({ statusCode: 400, statusMessage: 'artworkId is required' })
  }

  const db = useDb()

  // Verify artwork exists
  const [artwork] = await db
    .select({ id: artworks.id })
    .from(artworks)
    .where(eq(artworks.id, artworkId))
    .limit(1)

  if (!artwork) {
    throw createError({ statusCode: 404, statusMessage: 'Artwork not found' })
  }

  const [product] = await db
    .insert(printProducts)
    .values({
      artworkId,
      active: true,
    })
    .returning()

  return { success: true, data: product }
})
