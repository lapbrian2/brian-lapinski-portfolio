import { eq, and } from 'drizzle-orm'
import { artworks, promptPurchases } from '~/server/db/schema'
import { useDb } from '~/server/db'
import { getPromptPrice } from '~/server/utils/prompt-pricing'
import { createLogger } from '~/server/utils/logger'

const log = createLogger('prompts')

export default defineEventHandler(async (event) => {
  // Auth required
  let userId: string | undefined
  try {
    const session = await getUserSession(event)
    userId = session?.user?.id as string | undefined
  } catch (err) {
    log.error('Session lookup failed:', err)
    // nuxt-auth-utils not configured
  }

  if (!userId) {
    throw createError({ statusCode: 401, statusMessage: 'Sign in to purchase prompts' })
  }

  const body = await readBody(event)
  const artworkId = body?.artworkId

  // Input validation
  if (!artworkId || typeof artworkId !== 'string' || artworkId.length === 0 || artworkId.length > 100) {
    throw createError({ statusCode: 400, statusMessage: 'Valid artworkId required' })
  }

  const db = useDb()

  // Validate artwork exists and has a prompt
  const [artwork] = await db
    .select({
      id: artworks.id,
      title: artworks.title,
      rawPrompt: artworks.rawPrompt,
      promptPrice: artworks.promptPrice,
    })
    .from(artworks)
    .where(eq(artworks.id, artworkId))
    .limit(1)

  if (!artwork) {
    throw createError({ statusCode: 404, statusMessage: 'Artwork not found' })
  }

  if (!artwork.rawPrompt) {
    throw createError({ statusCode: 400, statusMessage: 'No prompt available for this artwork' })
  }

  // Check for existing purchase
  const [existing] = await db
    .select({ id: promptPurchases.id })
    .from(promptPurchases)
    .where(and(
      eq(promptPurchases.userId, userId),
      eq(promptPurchases.artworkId, artworkId),
      eq(promptPurchases.status, 'completed'),
    ))
    .limit(1)

  if (existing) {
    return { success: true, alreadyOwned: true }
  }

  const price = getPromptPrice(artwork.promptPrice)
  const config = useRuntimeConfig()
  const baseUrl = config.public.siteUrl as string

  // Create Stripe checkout session
  let session
  try {
    const stripe = new (await import('stripe')).default(config.stripeSecretKey as string)

    session = await stripe.checkout.sessions.create({
      mode: 'payment',
      // Let Stripe auto-detect payment methods (card, Apple Pay, Google Pay, Link)
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: `Prompt Unlock: ${artwork.title}`,
            description: 'Full prompt text, technique descriptions, refinement notes, and Playground access',
          },
          unit_amount: price,
        },
        quantity: 1,
      }],
      metadata: {
        type: 'prompt_purchase',
        userId,
        artworkId,
        pricePaid: String(price),
      },
      success_url: `${baseUrl}/gallery?prompt_unlocked=${artworkId}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/gallery`,
    })
  } catch (err) {
    log.error('Stripe checkout session creation failed:', err)
    throw createError({ statusCode: 500, statusMessage: 'Payment setup failed — please try again' })
  }

  return { success: true, url: session.url }
})
