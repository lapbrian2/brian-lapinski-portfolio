import { eq } from 'drizzle-orm'
import { artworkTechniques } from '~/server/db/schema'
import { useDb } from '~/server/db'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Artwork ID required' })

  const body = await readBody(event)
  const techniqueIds: string[] = body.techniqueIds

  if (!Array.isArray(techniqueIds)) {
    throw createError({ statusCode: 400, statusMessage: 'techniqueIds must be an array' })
  }

  const db = useDb()

  // Delete existing junctions for this artwork
  await db.delete(artworkTechniques).where(eq(artworkTechniques.artworkId, id))

  // Insert new junctions
  if (techniqueIds.length > 0) {
    await db.insert(artworkTechniques).values(
      techniqueIds.map((techniqueId) => ({
        artworkId: id,
        techniqueId,
      })),
    )
  }

  return { success: true, data: { artworkId: id, count: techniqueIds.length } }
})
