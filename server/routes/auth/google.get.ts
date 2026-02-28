import { eq, and } from 'drizzle-orm'
import { users } from '~/server/db/schema'
import { useDb } from '~/server/db'
import { createLogger } from '~/server/utils/logger'

const log = createLogger('auth:google')

export default defineOAuthGoogleEventHandler({
  async onSuccess(event, { user: googleUser }) {
    const db = useDb()

    // Find or create user by provider + providerId
    const [existing] = await db
      .select()
      .from(users)
      .where(and(eq(users.provider, 'google'), eq(users.providerId, String(googleUser.sub))))
      .limit(1)

    let userId: string

    if (existing) {
      userId = existing.id
      await db
        .update(users)
        .set({
          name: googleUser.name,
          avatarUrl: googleUser.picture,
          email: googleUser.email,
        })
        .where(eq(users.id, existing.id))
    } else {
      userId = crypto.randomUUID()
      await db.insert(users).values({
        id: userId,
        email: googleUser.email,
        name: googleUser.name,
        avatarUrl: googleUser.picture,
        provider: 'google',
        providerId: String(googleUser.sub),
      })
    }

    await setUserSession(event, {
      user: {
        id: userId,
        name: googleUser.name,
        avatar: googleUser.picture,
        provider: 'google',
      },
    })

    return sendRedirect(event, '/')
  },
  onError(event, error) {
    log.error('OAuth error:', error)
    return sendRedirect(event, '/?auth=error')
  },
})
