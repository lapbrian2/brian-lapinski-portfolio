import { eq } from 'drizzle-orm'
import { collections, collectionArtworks } from '~/server/db/schema'
import { useDb } from '~/server/db'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'ID required' })

  const body = await readBody(event)
  const db = useDb()
  const collectionId = Number(id)

  // Update collection fields if any are provided
  const updateData: Record<string, any> = {}
  const fields = ['title', 'slug', 'description', 'coverImage', 'sortOrder', 'featured'] as const

  for (const field of fields) {
    if (body[field] !== undefined) {
      updateData[field] = field === 'sortOrder' ? Number(body[field]) : body[field]
    }
  }

  if (Object.keys(updateData).length > 0) {
    await db.update(collections).set(updateData).where(eq(collections.id, collectionId))
  }

  // If artworkIds array is provided, replace the collection's artworks
  if (Array.isArray(body.artworkIds)) {
    // Delete existing artwork associations
    await db.delete(collectionArtworks).where(eq(collectionArtworks.collectionId, collectionId))

    // Re-insert with sort order
    if (body.artworkIds.length > 0) {
      const values = body.artworkIds.map((artworkId: string, index: number) => ({
        collectionId,
        artworkId,
        sortOrder: index,
      }))

      await db.insert(collectionArtworks).values(values)
    }
  }

  if (Object.keys(updateData).length === 0 && !Array.isArray(body.artworkIds)) {
    throw createError({ statusCode: 400, statusMessage: 'No fields to update' })
  }

  return { success: true, data: { id: collectionId } }
})
