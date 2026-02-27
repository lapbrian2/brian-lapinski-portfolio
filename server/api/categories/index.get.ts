import { sql } from 'drizzle-orm'
import { artworks } from '~/server/db/schema'
import { useDb } from '~/server/db'
import { categories as staticCategories } from '~/data/artworks'

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

  const categories = staticCategories.map(c => ({
    id: c.id,
    label: c.label,
    count: c.id === 'all' ? total : 0,
  }))

  for (const row of counts) {
    const cat = categories.find((c) => c.id === row.category)
    if (cat) cat.count = row.count
  }

  setResponseHeaders(event, {
    'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
  })

  return { success: true, data: categories }
})
