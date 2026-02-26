import { eq } from 'drizzle-orm'
import { printProducts, printVariants } from '~/server/db/schema'
import { useDb } from '~/server/db'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Product ID required' })

  const body = await readBody(event)
  const db = useDb()

  // Verify product exists
  const [existing] = await db
    .select({ id: printProducts.id })
    .from(printProducts)
    .where(eq(printProducts.id, Number(id)))
    .limit(1)

  if (!existing) {
    throw createError({ statusCode: 404, statusMessage: 'Product not found' })
  }

  // Update product fields (active toggle)
  if (body.active !== undefined) {
    await db
      .update(printProducts)
      .set({
        active: body.active,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(printProducts.id, Number(id)))
  }

  // Handle variants: add or update
  if (body.variants && Array.isArray(body.variants)) {
    for (const variant of body.variants) {
      if (variant.id) {
        // Update existing variant
        const updateData: Record<string, any> = {}
        if (variant.sizeName !== undefined) updateData.sizeName = variant.sizeName
        if (variant.sizeWidth !== undefined) updateData.sizeWidth = Number(variant.sizeWidth)
        if (variant.sizeHeight !== undefined) updateData.sizeHeight = Number(variant.sizeHeight)
        if (variant.material !== undefined) updateData.material = variant.material
        if (variant.price !== undefined) updateData.price = Number(variant.price)
        if (variant.printfulVariantId !== undefined) updateData.printfulVariantId = variant.printfulVariantId
        if (variant.active !== undefined) updateData.active = variant.active

        if (Object.keys(updateData).length > 0) {
          await db
            .update(printVariants)
            .set(updateData)
            .where(eq(printVariants.id, Number(variant.id)))
        }
      } else {
        // Create new variant
        if (!variant.sizeName || !variant.sizeWidth || !variant.sizeHeight || variant.price === undefined) {
          throw createError({ statusCode: 400, statusMessage: 'New variants require sizeName, sizeWidth, sizeHeight, and price' })
        }
        await db.insert(printVariants).values({
          productId: Number(id),
          sizeName: variant.sizeName,
          sizeWidth: Number(variant.sizeWidth),
          sizeHeight: Number(variant.sizeHeight),
          material: variant.material || 'fine-art-paper',
          price: Number(variant.price),
          printfulVariantId: variant.printfulVariantId || null,
          active: variant.active !== undefined ? variant.active : true,
        })
      }
    }
  }

  return { success: true, data: { id: Number(id) } }
})
