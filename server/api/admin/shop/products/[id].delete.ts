import { eq } from 'drizzle-orm'
import { printProducts } from '~/server/db/schema'
import { useDb } from '~/server/db'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Product ID required' })

  const db = useDb()
  await db.delete(printProducts).where(eq(printProducts.id, Number(id)))

  return { success: true, data: { deleted: Number(id) } }
})
