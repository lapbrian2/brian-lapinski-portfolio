import { techniques } from '~/server/db/schema'
import { useDb } from '~/server/db'

export default defineEventHandler(async () => {
  const db = useDb()

  const allTechniques = await db
    .select()
    .from(techniques)
    .orderBy(techniques.category, techniques.name)

  // Group by category
  const grouped = new Map<string, typeof allTechniques>()
  for (const tech of allTechniques) {
    const list = grouped.get(tech.category) || []
    list.push(tech)
    grouped.set(tech.category, list)
  }

  const data = [...grouped.entries()].map(([category, items]) => ({
    category,
    items,
  }))

  return { success: true, data }
})
