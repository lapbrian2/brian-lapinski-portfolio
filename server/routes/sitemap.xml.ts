import { asc } from 'drizzle-orm'
import { artworks, collections } from '~/server/db/schema'
import { useDb } from '~/server/db'
import { validCategorySlugs } from '~/data/artworks'

function escapeXml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const baseUrl = (config.public.siteUrl as string) || 'https://lapinski.art'
  const categories = validCategorySlugs
  const today = new Date().toISOString().split('T')[0]

  // Fetch all artwork IDs for individual artwork pages
  let artworkRows: Array<{ id: string; updatedAt: string | null }> = []
  let collectionRows: Array<{ slug: string; createdAt: string | null }> = []
  try {
    const db = useDb()
    artworkRows = await db
      .select({ id: artworks.id, updatedAt: artworks.updatedAt })
      .from(artworks)
      .orderBy(asc(artworks.sortOrder))
    collectionRows = await db
      .select({ slug: collections.slug, createdAt: collections.createdAt })
      .from(collections)
      .orderBy(asc(collections.sortOrder))
  } catch {
    // If DB fails, sitemap still works with static pages
    artworkRows = []
    collectionRows = []
  }

  const urls = [
    { loc: '/', priority: '1.0', changefreq: 'weekly' },
    { loc: '/gallery', priority: '0.9', changefreq: 'weekly' },
    ...categories.map((cat) => ({
      loc: `/${cat}`,
      priority: '0.8',
      changefreq: 'weekly',
    })),
    { loc: '/shop', priority: '0.7', changefreq: 'weekly' },
    { loc: '/collections', priority: '0.7', changefreq: 'weekly' },
    ...artworkRows.map((a) => ({
      loc: `/artwork/${a.id}`,
      priority: '0.6',
      changefreq: 'monthly',
      lastmod: a.updatedAt ? a.updatedAt.split('T')[0] : today,
    })),
    ...collectionRows.map((c) => ({
      loc: `/collections/${c.slug}`,
      priority: '0.6',
      changefreq: 'monthly',
      lastmod: c.createdAt ? c.createdAt.split('T')[0] : today,
    })),
  ]

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${escapeXml(baseUrl + u.loc)}</loc>
    <lastmod>${'lastmod' in u ? (u as { lastmod: string }).lastmod : today}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`

  setResponseHeaders(event, {
    'Content-Type': 'application/xml',
    'Cache-Control': 'public, max-age=86400, s-maxage=86400',
  })

  return xml
})
