import { eq } from 'drizzle-orm'
import { sessions } from '~/server/db/schema'
import { useDb } from '~/server/db'

export default defineEventHandler(async (event) => {
  const sessionId = getCookie(event, 'admin_session')

  if (sessionId) {
    try {
      const db = useDb()
      await db.delete(sessions).where(eq(sessions.id, sessionId))
    } catch (err) {
      console.error('[logout] Session deletion failed:', err)
    }
  }

  deleteCookie(event, 'admin_session', { path: '/' })
  return { success: true, data: { authenticated: false } }
})
