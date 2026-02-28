import type { H3Event } from 'h3'
import { pageViews } from '~/server/db/schema'
import { useDb } from '~/server/db'
import { hashIp } from '~/server/utils/hash-ip'

const BOT_PATTERNS = /bot|crawl|spider|slurp|lighthouse|pagespeed|gtmetrix|pingdom/i

export default defineEventHandler(async (event) => {
  const url = getRequestURL(event)
  const path = url.pathname

  // Only track page loads (HTML requests), not API calls or assets
  if (
    path.startsWith('/api/') ||
    path.startsWith('/admin') ||
    path.startsWith('/_nuxt') ||
    path.startsWith('/__nuxt') ||
    path.includes('.') // static files (.js, .css, .webp etc.)
  ) {
    return
  }

  const userAgent = getRequestHeader(event, 'user-agent') || ''
  if (BOT_PATTERNS.test(userAgent)) return

  // Fire and forget — never block the response
  trackPageView(event, path, userAgent).catch(() => {})
})

async function trackPageView(event: H3Event, path: string, userAgent: string) {
  try {
    const db = useDb()

    // Hash IP for privacy (SHA-256) — use consistent IP resolution
    const rawIp = getRequestIP(event, { xForwardedFor: true }) || ''
    const hashedIp = rawIp ? await hashIp(rawIp) : null

    // Get country from Vercel's free geo header
    const country = getRequestHeader(event, 'x-vercel-ip-country') || null

    // Get referrer
    const referrer = getRequestHeader(event, 'referer') || null
    // Strip own domain from referrer
    const cleanReferrer = referrer && !referrer.includes(getRequestURL(event).host)
      ? referrer
      : null

    await db.insert(pageViews).values({
      path,
      referrer: cleanReferrer,
      userAgent: userAgent.substring(0, 256),
      ip: hashedIp,
      country,
    })
  } catch {
    // Never let analytics crash the app
  }
}
