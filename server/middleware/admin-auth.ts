import { eq } from 'drizzle-orm'
import { sessions } from '~/server/db/schema'
import { useDb } from '~/server/db'

export default defineEventHandler(async (event) => {
  const url = getRequestURL(event)

  // Only protect /api/admin/* routes
  if (!url.pathname.startsWith('/api/admin')) return

  const sessionId = getCookie(event, 'admin_session')
  if (!sessionId) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const db = useDb()
  const [session] = await db
    .select()
    .from(sessions)
    .where(eq(sessions.id, sessionId))
    .limit(1)

  if (!session || new Date(session.expiresAt) < new Date()) {
    deleteCookie(event, 'admin_session', { path: '/' })
    throw createError({ statusCode: 401, statusMessage: 'Session expired' })
  }
})
