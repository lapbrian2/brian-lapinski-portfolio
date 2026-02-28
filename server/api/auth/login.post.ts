import { randomUUID } from 'crypto'
import { sessions } from '~/server/db/schema'
import { useDb } from '~/server/db'

// Simple in-memory rate limiter for login attempts
const loginAttempts = new Map<string, { count: number; resetAt: number }>()
const MAX_ATTEMPTS = 5
const WINDOW_MS = 15 * 60 * 1000 // 15 minutes

// Purge expired entries every 30 minutes to prevent unbounded growth
setInterval(() => {
  const now = Date.now()
  for (const [key, record] of loginAttempts) {
    if (now > record.resetAt) loginAttempts.delete(key)
  }
}, 30 * 60 * 1000)

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const record = loginAttempts.get(ip)

  if (!record || now > record.resetAt) {
    loginAttempts.set(ip, { count: 1, resetAt: now + WINDOW_MS })
    return false
  }

  record.count++
  return record.count > MAX_ATTEMPTS
}

export default defineEventHandler(async (event) => {
  const ip = getRequestIP(event, { xForwardedFor: true }) || 'unknown'

  if (isRateLimited(ip)) {
    throw createError({ statusCode: 429, statusMessage: 'Too many login attempts. Try again later.' })
  }

  const config = useRuntimeConfig()
  const { password } = await readBody(event)

  if (!password || password !== config.adminPassword) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid password' })
  }

  // Reset attempts on successful login
  loginAttempts.delete(ip)

  const db = useDb()
  const sessionId = randomUUID()
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

  await db.insert(sessions).values({ id: sessionId, expiresAt })

  setCookie(event, 'admin_session', sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60,
    path: '/',
  })

  return { success: true, data: { authenticated: true } }
})
