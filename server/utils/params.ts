import type { H3Event } from 'h3'

/**
 * Parse a route parameter as a number, throwing a 400 error if missing or non-numeric.
 * Consolidates the repeated `Number(getRouterParam(...)) + isNaN` pattern.
 */
export function requireNumericParam(event: H3Event, name: string, label?: string): number {
  const raw = getRouterParam(event, name)
  const displayName = label || name
  if (!raw) {
    throw createError({ statusCode: 400, statusMessage: `${displayName} is required` })
  }
  const num = Number(raw)
  if (isNaN(num)) {
    throw createError({ statusCode: 400, statusMessage: `${displayName} must be a number` })
  }
  return num
}
