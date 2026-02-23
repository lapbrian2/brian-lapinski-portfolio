import { eq } from 'drizzle-orm'
import { content } from '~/server/db/schema'
import { useDb } from '~/server/db'

export default defineEventHandler(async (event) => {
  const key = getRouterParam(event, 'key')
  if (!key) throw createError({ statusCode: 400, statusMessage: 'Key required' })

  const body = await readBody(event)
  if (!body.value || typeof body.value !== 'string') {
    throw createError({ statusCode: 400, statusMessage: 'Value is required' })
  }

  const db = useDb()
  await db
    .update(content)
    .set({ value: body.value, updatedAt: new Date().toISOString() })
    .where(eq(content.key, key))

  return { success: true, data: { key } }
})
