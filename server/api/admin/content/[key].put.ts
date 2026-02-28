import { eq } from 'drizzle-orm'
import { content } from '~/server/db/schema'
import { useDb } from '~/server/db'

export default defineEventHandler(async (event) => {
  const key = getRouterParam(event, 'key')
  if (!key) throw createError({ statusCode: 400, statusMessage: 'Key required' })
  // Validate key format: alphanumeric, dashes, underscores, dots — max 100 chars
  if (!/^[a-zA-Z0-9._-]{1,100}$/.test(key)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid content key format' })
  }

  const body = await readBody(event)
  if (!body.value || typeof body.value !== 'string') {
    throw createError({ statusCode: 400, statusMessage: 'Value is required' })
  }
  if (body.value.length > 50000) {
    throw createError({ statusCode: 400, statusMessage: 'Value too long (max 50,000 characters)' })
  }

  const db = useDb()
  await db
    .update(content)
    .set({ value: body.value, updatedAt: new Date().toISOString() })
    .where(eq(content.key, key))

  return { success: true, data: { key } }
})
