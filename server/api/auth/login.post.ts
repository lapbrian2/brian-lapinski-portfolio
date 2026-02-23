import { randomUUID } from 'crypto'
import { sessions } from '~/server/db/schema'
import { useDb } from '~/server/db'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const { password } = await readBody(event)

  if (!password || password !== config.adminPassword) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid password' })
  }

  const db = useDb()
  const sessionId = randomUUID()
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

  await db.insert(sessions).values({ id: sessionId, expiresAt })

  setCookie(event, 'admin_session', sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60,
    path: '/',
  })

  return { success: true, data: { authenticated: true } }
})
