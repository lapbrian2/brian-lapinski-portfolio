import { sql } from 'drizzle-orm'
import { artworks } from '~/server/db/schema'
import { useDb } from '~/server/db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { id, title, category, medium, description, src, aspect, year } = body

  if (!id || !title || !category || !medium || !description || !src || !aspect || !year) {
    throw createError({ statusCode: 400, statusMessage: 'All fields are required' })
  }

  const db = useDb()

  // Get next sort order
  const [{ maxOrder }] = await db
    .select({ maxOrder: sql<number>`coalesce(max(${artworks.sortOrder}), -1)` })
    .from(artworks)

  await db.insert(artworks).values({
    id: id.trim(),
    title: title.trim(),
    category,
    medium: medium.trim(),
    description: description.trim(),
    src,
    aspect,
    year: Number(year),
    sortOrder: maxOrder + 1,
    rawPrompt: body.rawPrompt?.trim() || null,
    mjVersion: body.mjVersion?.trim() || null,
    refinementNotes: body.refinementNotes?.trim() || null,
    dominantColor: body.dominantColor?.trim() || null,
  })

  return { success: true, data: { id } }
})
