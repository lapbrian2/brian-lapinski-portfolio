import { eq, and } from 'drizzle-orm'
import { printProducts, printVariants, artworks } from '~/server/db/schema'
import { useDb } from '~/server/db'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Product ID required' })

  const db = useDb()

  const [product] = await db
    .select({
      id: printProducts.id,
      artworkId: printProducts.artworkId,
      active: printProducts.active,
      createdAt: printProducts.createdAt,
      updatedAt: printProducts.updatedAt,
      artworkTitle: artworks.title,
      artworkSrc: artworks.src,
      artworkDescription: artworks.description,
      artworkMedium: artworks.medium,
    })
    .from(printProducts)
    .innerJoin(artworks, eq(printProducts.artworkId, artworks.id))
    .where(and(eq(printProducts.id, Number(id)), eq(printProducts.active, true)))
    .limit(1)

  if (!product) {
    throw createError({ statusCode: 404, statusMessage: 'Product not found' })
  }

  const variants = await db
    .select({
      id: printVariants.id,
      productId: printVariants.productId,
      sizeName: printVariants.sizeName,
      sizeWidth: printVariants.sizeWidth,
      sizeHeight: printVariants.sizeHeight,
      material: printVariants.material,
      price: printVariants.price,
      active: printVariants.active,
      createdAt: printVariants.createdAt,
    })
    .from(printVariants)
    .where(and(eq(printVariants.productId, product.id), eq(printVariants.active, true)))

  const data = {
    id: product.id,
    artworkId: product.artworkId,
    active: product.active,
    artworkTitle: product.artworkTitle,
    artworkSrc: product.artworkSrc,
    variants,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  }

  setResponseHeaders(event, {
    'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
  })

  return { success: true, data }
})
