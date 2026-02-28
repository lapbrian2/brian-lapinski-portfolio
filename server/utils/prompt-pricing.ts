/** Default prompt unlock price in cents (USD) */
export const DEFAULT_PROMPT_PRICE = 999 // $9.99

/** Min/max bounds for prompt pricing (cents) */
const MIN_PRICE = 99 // $0.99
const MAX_PRICE = 9999 // $99.99

/** Get the unlock price for an artwork (per-artwork override or global default), clamped to valid range */
export function getPromptPrice(artworkPromptPrice: number | null | undefined): number {
  const price = artworkPromptPrice ?? DEFAULT_PROMPT_PRICE
  return Math.max(MIN_PRICE, Math.min(MAX_PRICE, price))
}

/** Format a price in cents as a dollar string (e.g., 399 → "$3.99") */
export function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`
}
