import { eq } from 'drizzle-orm'
import { artworks } from '~/server/db/schema'
import { useDb } from '~/server/db'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'ID required' })

  const db = useDb()
  await db.delete(artworks).where(eq(artworks.id, id))

  return { success: true, data: { deleted: id } }
})
