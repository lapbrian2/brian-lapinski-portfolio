import { eq, and } from 'drizzle-orm'
import { printProducts, printVariants } from '~/server/db/schema'
import { useDb } from '~/server/db'

export default defineEventHandler(async (event) => {
  const numId = requireNumericParam(event, 'id', 'Product ID')

  const body = await readBody(event)
  const db = useDb()

  // Verify product exists
  const [existing] = await db
    .select({ id: printProducts.id })
    .from(printProducts)
    .where(eq(printProducts.id, numId))
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
      .where(eq(printProducts.id, numId))
  }

  // Handle variants: add or update
  if (body.variants && Array.isArray(body.variants)) {
    for (const variant of body.variants) {
      // Validate numeric variant fields
      if (variant.sizeWidth !== undefined) {
        const w = Number(variant.sizeWidth)
        if (isNaN(w) || w <= 0 || w > 10000) throw createError({ statusCode: 400, statusMessage: 'sizeWidth must be between 1 and 10000' })
      }
      if (variant.sizeHeight !== undefined) {
        const h = Number(variant.sizeHeight)
        if (isNaN(h) || h <= 0 || h > 10000) throw createError({ statusCode: 400, statusMessage: 'sizeHeight must be between 1 and 10000' })
      }
      if (variant.price !== undefined) {
        const p = Number(variant.price)
        if (isNaN(p) || p < 100) throw createError({ statusCode: 400, statusMessage: 'Price must be at least $1.00 (100 cents)' })
      }

      if (variant.id) {
        const variantId = Number(variant.id)
        if (isNaN(variantId)) throw createError({ statusCode: 400, statusMessage: 'Variant ID must be a number' })

        // Update existing variant
        const updateData: Record<string, unknown> = {}
        if (variant.sizeName !== undefined) updateData.sizeName = variant.sizeName
        if (variant.sizeWidth !== undefined) updateData.sizeWidth = Number(variant.sizeWidth)
        if (variant.sizeHeight !== undefined) updateData.sizeHeight = Number(variant.sizeHeight)
        if (variant.material !== undefined) updateData.material = variant.material
        if (variant.price !== undefined) updateData.price = Number(variant.price)
        if (variant.printfulVariantId !== undefined) updateData.printfulVariantId = variant.printfulVariantId
        if (variant.active !== undefined) updateData.active = variant.active

        if (Object.keys(updateData).length > 0) {
          // Ownership check: ensure variant belongs to this product
          await db
            .update(printVariants)
            .set(updateData)
            .where(and(
              eq(printVariants.id, variantId),
              eq(printVariants.productId, numId),
            ))
        }
      } else {
        // Create new variant
        if (!variant.sizeName || !variant.sizeWidth || !variant.sizeHeight || variant.price === undefined) {
          throw createError({ statusCode: 400, statusMessage: 'New variants require sizeName, sizeWidth, sizeHeight, and price' })
        }
        await db.insert(printVariants).values({
          productId: numId,
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

  return { success: true, data: { id: numId } }
})
