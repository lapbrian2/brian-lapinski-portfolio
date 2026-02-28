import { eq } from 'drizzle-orm'
import { subscribers } from '~/server/db/schema'
import { useDb } from '~/server/db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { email } = body || {}

  if (!email || typeof email !== 'string') {
    throw createError({ statusCode: 400, statusMessage: 'Email is required' })
  }

  const db = useDb()
  const trimmedEmail = email.trim().toLowerCase()

  // Find subscriber by email
  const [existing] = await db
    .select()
    .from(subscribers)
    .where(eq(subscribers.email, trimmedEmail))
    .limit(1)

  if (existing && !existing.unsubscribedAt) {
    // Set unsubscribedAt to now
    await db
      .update(subscribers)
      .set({ unsubscribedAt: new Date().toISOString() })
      .where(eq(subscribers.id, existing.id))
  }

  // Always return success (don't leak email existence)
  return { success: true }
})
