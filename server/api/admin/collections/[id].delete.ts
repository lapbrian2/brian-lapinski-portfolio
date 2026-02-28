import { eq } from 'drizzle-orm'
import { collections, collectionArtworks } from '~/server/db/schema'
import { useDb } from '~/server/db'

export default defineEventHandler(async (event) => {
  const collectionId = requireNumericParam(event, 'id')
  const db = useDb()

  // Delete artwork associations first
  await db.delete(collectionArtworks).where(eq(collectionArtworks.collectionId, collectionId))

  // Delete the collection
  await db.delete(collections).where(eq(collections.id, collectionId))

  return { success: true, data: { deleted: collectionId } }
})
