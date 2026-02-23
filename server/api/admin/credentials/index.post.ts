import { sql } from 'drizzle-orm'
import { credentials } from '~/server/db/schema'
import { useDb } from '~/server/db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  if (!body.name) throw createError({ statusCode: 400, statusMessage: 'Name required' })

  const db = useDb()
  const [{ maxOrder }] = await db
    .select({ maxOrder: sql<number>`coalesce(max(${credentials.sortOrder}), -1)` })
    .from(credentials)

  const result = await db.insert(credentials).values({
    name: body.name.trim(),
    type: body.type || 'exhibition',
    sortOrder: maxOrder + 1,
  }).returning()

  return { success: true, data: result[0] }
})
