import { eq, asc } from 'drizzle-orm'
import { printProducts, printVariants, artworks } from '~/server/db/schema'
import { useDb } from '~/server/db'

export default defineEventHandler(async (event) => {
  const db = useDb()

  // Fetch active products joined with artwork info
  const products = await db
    .select({
      id: printProducts.id,
      artworkId: printProducts.artworkId,
      active: printProducts.active,
      createdAt: printProducts.createdAt,
      updatedAt: printProducts.updatedAt,
      artworkTitle: artworks.title,
      artworkSrc: artworks.src,
    })
    .from(printProducts)
    .innerJoin(artworks, eq(printProducts.artworkId, artworks.id))
    .where(eq(printProducts.active, true))
    .orderBy(asc(printProducts.id))

  // Fetch active variants for active products
  const productIds = products.map((p) => p.id)

  let variants: Array<{
    id: number
    productId: number
    sizeName: string
    sizeWidth: number
    sizeHeight: number
    material: string
    price: number
    active: boolean
    createdAt: string | null
  }> = []

  if (productIds.length > 0) {
    const { inArray } = await import('drizzle-orm')
    variants = await db
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
      .where(inArray(printVariants.productId, productIds))
  }

  // Filter to active variants only and group by product
  const variantMap = new Map<number, typeof variants>()
  for (const v of variants) {
    if (!v.active) continue
    if (!variantMap.has(v.productId)) variantMap.set(v.productId, [])
    variantMap.get(v.productId)!.push(v)
  }

  const data = products.map((p) => ({
    id: p.id,
    artworkId: p.artworkId,
    active: p.active,
    artworkTitle: p.artworkTitle,
    artworkSrc: p.artworkSrc,
    variants: variantMap.get(p.id) || [],
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  }))

  setResponseHeaders(event, {
    'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
  })

  return { success: true, data }
})
