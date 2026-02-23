export default defineEventHandler(() => {
  const baseUrl = 'https://brian-lapinski-portfolio.vercel.app'
  const categories = ['portraits', 'landscapes', 'abstract', 'surreal']

  const urls = [
    { loc: '/', priority: '1.0', changefreq: 'weekly' },
    ...categories.map((cat) => ({
      loc: `/${cat}`,
      priority: '0.8',
      changefreq: 'weekly',
    })),
  ]

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${baseUrl}${u.loc}</loc>
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
