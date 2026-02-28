import { eq } from 'drizzle-orm'
import { subscribers } from '~/server/db/schema'
import { useDb } from '~/server/db'

// Simple in-memory rate limiter (per IP, resets on cold start)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

// Purge expired entries every 30 minutes to prevent unbounded growth
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of rateLimitMap) {
    if (now > entry.resetAt) rateLimitMap.delete(key)
  }
}, 30 * 60 * 1000)

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 3600000 }) // 1 hour window
    return true
  }

  if (entry.count >= 5) return false // Max 5 per hour per IP
  entry.count++
  return true
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  // Validation
  const { email, name } = body || {}

  if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw createError({ statusCode: 400, statusMessage: 'Valid email is required' })
  }
  if (email.length > 200) {
    throw createError({ statusCode: 400, statusMessage: 'Email too long (max 200 characters)' })
  }
  if (name !== undefined && name !== null && typeof name === 'string' && name.length > 100) {
    throw createError({ statusCode: 400, statusMessage: 'Name too long (max 100 characters)' })
  }

  // Honeypot: if the hidden "website" field is filled, it's a bot
  if (body.website) {
    return { success: true } // Fake success
  }

  // Rate limiting
  const ip = getRequestIP(event, { xForwardedFor: true }) || 'unknown'
  if (!checkRateLimit(ip)) {
    throw createError({ statusCode: 429, statusMessage: 'Too many requests. Please try again later.' })
  }

  const db = useDb()
  const trimmedEmail = email.trim().toLowerCase()
  const trimmedName = (typeof name === 'string' && name.trim()) ? name.trim() : null

  // Check if email already exists
  const [existing] = await db
    .select()
    .from(subscribers)
    .where(eq(subscribers.email, trimmedEmail))
    .limit(1)

  if (existing) {
    if (existing.unsubscribedAt) {
      // Re-subscribe: clear unsubscribedAt
      await db
        .update(subscribers)
        .set({ unsubscribedAt: null, name: trimmedName || existing.name })
        .where(eq(subscribers.id, existing.id))
    }
    // If already active, just return success (idempotent)
    return { success: true }
  }

  // Insert new subscriber
  await db.insert(subscribers).values({
    email: trimmedEmail,
    name: trimmedName,
  })

  return { success: true }
})
