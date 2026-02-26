import { sql, asc } from 'drizzle-orm'
import { collections, collectionArtworks } from '~/server/db/schema'
import { useDb } from '~/server/db'

export default defineEventHandler(async (event) => {
  const db = useDb()

  const rows = await db
    .select({
      id: collections.id,
      title: collections.title,
      slug: collections.slug,
      description: collections.description,
      coverImage: collections.coverImage,
      sortOrder: collections.sortOrder,
      featured: collections.featured,
      createdAt: collections.createdAt,
      artworkCount: sql<number>`count(${collectionArtworks.id})`,
    })
    .from(collections)
    .leftJoin(collectionArtworks, sql`${collections.id} = ${collectionArtworks.collectionId}`)
    .groupBy(collections.id)
    .orderBy(asc(collections.sortOrder))

  setResponseHeaders(event, {
    'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=300',
  })

  return { success: true, data: rows }
})
