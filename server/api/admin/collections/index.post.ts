import { sql } from 'drizzle-orm'
import { collections } from '~/server/db/schema'
import { useDb } from '~/server/db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { title, description, coverImage, featured } = body

  if (!title || !title.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'Title is required' })
  }

  const slug = body.slug?.trim()
    || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

  const db = useDb()

  // Get next sort order
  const [{ maxOrder }] = await db
    .select({ maxOrder: sql<number>`coalesce(max(${collections.sortOrder}), -1)` })
    .from(collections)

  const [inserted] = await db.insert(collections).values({
    title: title.trim(),
    slug,
    description: description?.trim() || null,
    coverImage: coverImage || null,
    sortOrder: maxOrder + 1,
    featured: featured ?? false,
  }).returning()

  return { success: true, data: inserted }
})
