import { Resend } from 'resend'
import { contactSubmissions } from '~/server/db/schema'
import { useDb } from '~/server/db'
import { createLogger } from '~/server/utils/logger'

const log = createLogger('contact')

// Simple in-memory rate limiter (per IP, resets on cold start)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

// Purge expired entries every 30 minutes to prevent unbounded growth
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of rateLimitMap) {
    if (now > entry.resetAt) rateLimitMap.delete(key)
  }
}, 30 * 60 * 1000)

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 3600000 }) // 1 hour window
    return true
  }

  if (entry.count >= 5) return false // Max 5 per hour per IP
  entry.count++
  return true
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body = await readBody(event)

  // Validation
  const { name, email, message } = body || {}

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    throw createError({ statusCode: 400, statusMessage: 'Name is required (min 2 characters)' })
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw createError({ statusCode: 400, statusMessage: 'Valid email is required' })
  }
  if (!message || typeof message !== 'string' || message.trim().length < 10) {
    throw createError({ statusCode: 400, statusMessage: 'Message is required (min 10 characters)' })
  }
  if (message.length > 5000) {
    throw createError({ statusCode: 400, statusMessage: 'Message too long (max 5000 characters)' })
  }

  // Honeypot: if the hidden "website" field is filled, it's a bot
  if (body.website) {
    return { success: true, data: { sent: true } } // Fake success
  }

  // Rate limiting
  const ip = getRequestIP(event, { xForwardedFor: true }) || 'unknown'
  if (!checkRateLimit(ip)) {
    throw createError({ statusCode: 429, statusMessage: 'Too many messages. Please try again later.' })
  }

  // Log submission to database (if DB is configured)
  try {
    const db = useDb()
    await db.insert(contactSubmissions).values({
      name: name.trim(),
      email: email.trim(),
      message: message.trim(),
      ip,
    })
  } catch (err) {
    log.error('DB logging failed:', err)
    // Don't fail the request if DB logging fails
  }

  // Send email via Resend (if configured)
  if (config.resendApiKey) {
    try {
      const resend = new Resend(config.resendApiKey as string)

      await resend.emails.send({
        from: config.resendFromEmail as string,
        to: config.contactNotificationEmail as string,
        replyTo: email.trim(),
        subject: `Portfolio Contact: ${name.trim()}`,
        html: `
          <h2>New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${escapeHtml(name.trim())}</p>
          <p><strong>Email:</strong> ${escapeHtml(email.trim())}</p>
          <p><strong>Message:</strong></p>
          <p>${escapeHtml(message.trim()).replace(/\n/g, '<br>')}</p>
          <hr>
          <p style="color: #666; font-size: 12px;">Sent from your portfolio contact form</p>
        `,
      })
    } catch (err) {
      log.error('Resend email failed:', err)
      // Don't fail the request if email fails — the submission is logged
    }
  }

  return { success: true, data: { sent: true } }
})

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}
