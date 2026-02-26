import { eq } from 'drizzle-orm'
import { collections, collectionArtworks } from '~/server/db/schema'
import { useDb } from '~/server/db'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'ID required' })

  const db = useDb()
  const collectionId = Number(id)

  // Delete artwork associations first
  await db.delete(collectionArtworks).where(eq(collectionArtworks.collectionId, collectionId))

  // Delete the collection
  await db.delete(collections).where(eq(collections.id, collectionId))

  return { success: true, data: { deleted: collectionId } }
})
