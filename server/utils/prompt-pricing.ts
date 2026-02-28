/** Default prompt unlock price in cents (USD) */
export const DEFAULT_PROMPT_PRICE = 399 // $3.99

/** Get the unlock price for an artwork (per-artwork override or global default) */
export function getPromptPrice(artworkPromptPrice: number | null | undefined): number {
  return artworkPromptPrice ?? DEFAULT_PROMPT_PRICE
}
