import { eq, asc } from 'drizzle-orm'
import { collections, collectionArtworks, artworks } from '~/server/db/schema'
import { useDb } from '~/server/db'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')
  if (!slug) throw createError({ statusCode: 400, statusMessage: 'Slug is required' })

  const db = useDb()

  const [collection] = await db
    .select({
      id: collections.id,
      title: collections.title,
      slug: collections.slug,
      description: collections.description,
      coverImage: collections.coverImage,
      sortOrder: collections.sortOrder,
      featured: collections.featured,
      createdAt: collections.createdAt,
    })
    .from(collections)
    .where(eq(collections.slug, slug))
    .limit(1)

  if (!collection) {
    throw createError({ statusCode: 404, statusMessage: 'Collection not found' })
  }

  const collectionArtworkRows = await db
    .select({
      id: artworks.id,
      title: artworks.title,
      description: artworks.description,
      src: artworks.src,
      category: artworks.category,
      medium: artworks.medium,
    })
    .from(collectionArtworks)
    .innerJoin(artworks, eq(collectionArtworks.artworkId, artworks.id))
    .where(eq(collectionArtworks.collectionId, collection.id))
    .orderBy(asc(collectionArtworks.sortOrder))

  setResponseHeaders(event, {
    'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=300',
  })

  return { success: true, data: { ...collection, artworks: collectionArtworkRows } }
})
