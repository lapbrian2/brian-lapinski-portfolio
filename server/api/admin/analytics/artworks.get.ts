import { sql } from 'drizzle-orm'
import { pageViews } from '~/server/db/schema'
import { useDb } from '~/server/db'

export default defineEventHandler(async () => {
  const db = useDb()

  const results = await db
    .select({
      artworkId: pageViews.artworkId,
      views: sql<number>`count(*)`,
    })
    .from(pageViews)
    .where(sql`${pageViews.artworkId} is not null`)
    .groupBy(pageViews.artworkId)
    .orderBy(sql`count(*) desc`)
    .limit(20)

  return { success: true, data: results }
})
