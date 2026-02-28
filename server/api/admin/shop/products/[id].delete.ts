import { eq } from 'drizzle-orm'
import { printProducts } from '~/server/db/schema'
import { useDb } from '~/server/db'

export default defineEventHandler(async (event) => {
  const numId = requireNumericParam(event, 'id', 'Product ID')

  const db = useDb()
  await db.delete(printProducts).where(eq(printProducts.id, numId))

  return { success: true, data: { deleted: numId } }
})
