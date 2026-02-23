import { sql } from 'drizzle-orm'
import { artworks } from '~/server/db/schema'
import { useDb } from '~/server/db'

export default defineEventHandler(async (event) => {
  const db = useDb()

  const counts = await db
    .select({
      category: artworks.category,
      count: sql<number>`count(*)`,
    })
    .from(artworks)
    .groupBy(artworks.category)

  const total = counts.reduce((sum, c) => sum + c.count, 0)

  const categories = [
    { id: 'all', label: 'All', count: total },
    { id: 'portraits', label: 'Portraits', count: 0 },
    { id: 'landscapes', label: 'Landscapes', count: 0 },
    { id: 'abstract', label: 'Abstract', count: 0 },
    { id: 'surreal', label: 'Surreal', count: 0 },
  ]

  for (const row of counts) {
    const cat = categories.find((c) => c.id === row.category)
    if (cat) cat.count = row.count
  }

  setResponseHeaders(event, {
    'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
  })

  return { success: true, data: categories }
})
