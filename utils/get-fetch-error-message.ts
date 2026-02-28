/**
 * Extract a user-friendly error message from a Nuxt $fetch error.
 * Nuxt wraps server errors in `{ data: { statusMessage } }`, so this
 * utility handles the cast and fallback in one place.
 */
export function getFetchErrorMessage(error: unknown, fallback: string): string {
  const fetchError = error as { data?: { statusMessage?: string } } | undefined
  return fetchError?.data?.statusMessage || fallback
}
