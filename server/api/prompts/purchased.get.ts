import { eq, and } from 'drizzle-orm'
import { promptPurchases } from '~/server/db/schema'
import { useDb } from '~/server/db'

export default defineEventHandler(async (event) => {
  let userId: string | undefined
  try {
    const session = await getUserSession(event)
    userId = session?.user?.id as string | undefined
  } catch {
    // nuxt-auth-utils not configured
  }

  if (!userId) {
    return { success: true, data: [] }
  }

  const db = useDb()

  const purchases = await db
    .select({ artworkId: promptPurchases.artworkId })
    .from(promptPurchases)
    .where(and(
      eq(promptPurchases.userId, userId),
      eq(promptPurchases.status, 'completed'),
    ))

  return {
    success: true,
    data: purchases.map(p => p.artworkId),
  }
})
