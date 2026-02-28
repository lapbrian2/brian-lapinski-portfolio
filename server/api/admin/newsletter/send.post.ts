import { isNull } from 'drizzle-orm'
import { subscribers } from '~/server/db/schema'
import { useDb } from '~/server/db'
import { createLogger } from '~/server/utils/logger'

const log = createLogger('newsletter')

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { subject, html } = body || {}

  // Validate inputs
  if (!subject || typeof subject !== 'string' || subject.trim().length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'Subject is required' })
  }
  if (subject.length > 200) {
    throw createError({ statusCode: 400, statusMessage: 'Subject too long (max 200 characters)' })
  }
  if (!html || typeof html !== 'string' || html.trim().length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'Email body is required' })
  }
  if (html.length > 100000) {
    throw createError({ statusCode: 400, statusMessage: 'Email body too long' })
  }

  const config = useRuntimeConfig()

  if (!config.resendApiKey) {
    throw createError({ statusCode: 500, statusMessage: 'Email service not configured' })
  }

  const db = useDb()

  // Fetch all active subscribers
  const activeSubscribers = await db
    .select({ email: subscribers.email, name: subscribers.name })
    .from(subscribers)
    .where(isNull(subscribers.unsubscribedAt))

  if (activeSubscribers.length === 0) {
    return { success: true, sent: 0, failed: 0 }
  }

  const { Resend } = await import('resend')
  const resend = new Resend(config.resendApiKey as string)
  const fromEmail = config.resendFromEmail as string
  const siteUrl = config.public.siteUrl as string

  let sent = 0
  let failed = 0

  // Send individually (not batch) so each email can have personalized unsubscribe link
  for (const sub of activeSubscribers) {
    const unsubscribeUrl = `${siteUrl}/unsubscribe?email=${encodeURIComponent(sub.email)}`
    const personalizedHtml = `${html.trim()}
    <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #2a2a2a; text-align: center;">
      <p style="font-size: 12px; color: #6b6577; line-height: 1.6; margin: 0;">
        You're receiving this because you subscribed at <a href="${siteUrl}" style="color: #c43b3b; text-decoration: none;">lapinski.art</a><br>
        <a href="${unsubscribeUrl}" style="color: #6b6577; text-decoration: underline;">Unsubscribe</a>
      </p>
    </div>`

    try {
      await resend.emails.send({
        from: fromEmail,
        to: sub.email,
        subject: subject.trim(),
        html: personalizedHtml,
      })
      sent++
    } catch (err) {
      log.error(`Failed to send to ${sub.email}:`, err)
      failed++
    }
  }

  return { success: true, sent, failed }
})
