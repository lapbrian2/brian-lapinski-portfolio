import { desc } from 'drizzle-orm'
import { artworks } from '~/server/db/schema'
import { useDb } from '~/server/db'

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const baseUrl = (config.public.siteUrl as string) || 'https://lapinski.art'

  let rows: Array<{
    id: string
    title: string
    description: string
    src: string
    createdAt: string | null
  }> = []

  try {
    const db = useDb()
    rows = await db
      .select({
        id: artworks.id,
        title: artworks.title,
        description: artworks.description,
        src: artworks.src,
        createdAt: artworks.createdAt,
      })
      .from(artworks)
      .orderBy(desc(artworks.createdAt))
      .limit(20)
  } catch {
    rows = []
  }

  const now = new Date().toUTCString()

  const items = rows
    .map((a) => {
      const link = `${baseUrl}/artwork/${a.id}`
      const pubDate = a.createdAt ? new Date(a.createdAt).toUTCString() : now
      const enclosure = a.src
        ? `\n      <enclosure url="${escapeXml(a.src.startsWith('http') ? a.src : `${baseUrl}${a.src}`)}" type="image/webp" length="0" />`
        : ''

      return `    <item>
      <title>${escapeXml(a.title)}</title>
      <link>${link}</link>
      <description>${escapeXml(a.description)}</description>
      <pubDate>${pubDate}</pubDate>
      <guid isPermaLink="true">${link}</guid>${enclosure}
    </item>`
    })
    .join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Brian Lapinski — AI Art Portfolio</title>
    <link>${baseUrl}</link>
    <description>Latest artworks and explorations in AI-generated imagery</description>
    <language>en-us</language>
    <lastBuildDate>${now}</lastBuildDate>
    <atom:link href="${baseUrl}/feed.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`

  setResponseHeaders(event, {
    'Content-Type': 'application/rss+xml',
    'Cache-Control': 'public, max-age=3600, s-maxage=3600',
  })

  return xml
})
