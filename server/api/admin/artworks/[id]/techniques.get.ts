import { eq } from 'drizzle-orm'
import { artworkTechniques } from '~/server/db/schema'
import { useDb } from '~/server/db'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Artwork ID required' })

  const db = useDb()

  const junctions = await db
    .select({ techniqueId: artworkTechniques.techniqueId })
    .from(artworkTechniques)
    .where(eq(artworkTechniques.artworkId, id))

  return { success: true, data: junctions.map((j) => j.techniqueId) }
})
