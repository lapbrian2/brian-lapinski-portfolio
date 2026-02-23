import { asc } from 'drizzle-orm'
import { artworks } from '~/server/db/schema'
import { useDb } from '~/server/db'

export default defineEventHandler(async () => {
  const db = useDb()
  const results = await db.select().from(artworks).orderBy(asc(artworks.sortOrder))
  return { success: true, data: results }
})
