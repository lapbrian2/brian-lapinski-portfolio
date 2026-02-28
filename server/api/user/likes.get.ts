import { eq } from 'drizzle-orm'
import { artworkLikes } from '~/server/db/schema'
import { useDb } from '~/server/db'

export default defineEventHandler(async (event) => {
  let userId: string | undefined
  try {
    const session = await getUserSession(event)
    userId = session?.user?.id as string | undefined
  } catch (err) {
    console.error('Session lookup failed:', err)
    // nuxt-auth-utils not configured — no authenticated user
  }

  if (!userId) {
    return { success: true, data: [] }
  }

  const db = useDb()

  const likes = await db
    .select({ artworkId: artworkLikes.artworkId })
    .from(artworkLikes)
    .where(eq(artworkLikes.userId, userId))

  return {
    success: true,
    data: likes.map((l) => l.artworkId),
  }
})
