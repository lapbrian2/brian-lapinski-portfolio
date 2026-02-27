import { eq, and } from 'drizzle-orm'
import { users } from '~/server/db/schema'
import { useDb } from '~/server/db'

export default defineOAuthGitHubEventHandler({
  config: {
    emailRequired: true,
  },
  async onSuccess(event, { user: ghUser }) {
    const db = useDb()

    // Find or create user by provider + providerId
    const [existing] = await db
      .select()
      .from(users)
      .where(and(eq(users.provider, 'github'), eq(users.providerId, String(ghUser.id))))
      .limit(1)

    let userId: string

    if (existing) {
      userId = existing.id
      // Update name/avatar in case they changed
      await db
        .update(users)
        .set({
          name: ghUser.name || ghUser.login,
          avatarUrl: ghUser.avatar_url,
          email: ghUser.email,
        })
        .where(eq(users.id, existing.id))
    } else {
      userId = crypto.randomUUID()
      await db.insert(users).values({
        id: userId,
        email: ghUser.email,
        name: ghUser.name || ghUser.login,
        avatarUrl: ghUser.avatar_url,
        provider: 'github',
        providerId: String(ghUser.id),
      })
    }

    await setUserSession(event, {
      user: {
        id: userId,
        name: ghUser.name || ghUser.login,
        avatar: ghUser.avatar_url,
        provider: 'github',
      },
    })

    return sendRedirect(event, '/')
  },
  onError(event, error) {
    console.error('GitHub OAuth error:', error)
    return sendRedirect(event, '/?auth=error')
  },
})
