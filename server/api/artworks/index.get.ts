import { eq, asc } from 'drizzle-orm'
import { artworks } from '~/server/db/schema'
import { useDb } from '~/server/db'

export default defineEventHandler(async (event) => {
  const db = useDb()
  const query = getQuery(event)
  const category = query.category as string | undefined

  let results
  if (category && category !== 'all') {
    results = await db
      .select()
      .from(artworks)
      .where(eq(artworks.category, category))
      .orderBy(asc(artworks.sortOrder))
  } else {
    results = await db
      .select()
      .from(artworks)
      .orderBy(asc(artworks.sortOrder))
  }

  // Cache for 60s, stale-while-revalidate for 2 min
  setResponseHeaders(event, {
    'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
  })

  return { success: true, data: results }
})
