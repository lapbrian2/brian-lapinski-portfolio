import { content } from '~/server/db/schema'
import { useDb } from '~/server/db'

export default defineEventHandler(async () => {
  const db = useDb()
  const results = await db.select().from(content)
  return { success: true, data: results }
})
