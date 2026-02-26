import { eq, asc } from 'drizzle-orm'
import { printProducts, printVariants, artworks } from '~/server/db/schema'
import { useDb } from '~/server/db'

export default defineEventHandler(async () => {
  const db = useDb()

  // Fetch ALL products (active and inactive) with artwork info
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
    .orderBy(asc(printProducts.id))

  // Fetch ALL variants (active and inactive)
  const variants = await db
    .select({
      id: printVariants.id,
      productId: printVariants.productId,
      sizeName: printVariants.sizeName,
      sizeWidth: printVariants.sizeWidth,
      sizeHeight: printVariants.sizeHeight,
      material: printVariants.material,
      price: printVariants.price,
      printfulVariantId: printVariants.printfulVariantId,
      active: printVariants.active,
      createdAt: printVariants.createdAt,
    })
    .from(printVariants)
    .orderBy(asc(printVariants.id))

  // Group variants by product
  const variantMap = new Map<number, typeof variants>()
  for (const v of variants) {
    if (!variantMap.has(v.productId)) variantMap.set(v.productId, [])
    variantMap.get(v.productId)!.push(v)
  }

  const data = products.map((p) => ({
    id: p.id,
    artworkId: p.artworkId,
    active: p.active,
    artwork: {
      title: p.artworkTitle,
      src: p.artworkSrc,
    },
    variants: variantMap.get(p.id) || [],
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  }))

  return { success: true, data }
})
