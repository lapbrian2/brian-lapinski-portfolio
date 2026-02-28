import { describe, it, expect } from 'vitest'
import { getPromptPrice, formatPrice, DEFAULT_PROMPT_PRICE } from '../server/utils/prompt-pricing'

describe('getPromptPrice', () => {
  it('returns DEFAULT_PROMPT_PRICE (399) when passed null', () => {
    expect(getPromptPrice(null)).toBe(DEFAULT_PROMPT_PRICE)
    expect(getPromptPrice(null)).toBe(399)
  })

  it('returns DEFAULT_PROMPT_PRICE (399) when passed undefined', () => {
    expect(getPromptPrice(undefined)).toBe(DEFAULT_PROMPT_PRICE)
    expect(getPromptPrice(undefined)).toBe(399)
  })

  it('returns the exact price when within valid range', () => {
    expect(getPromptPrice(599)).toBe(599)
  })

  it('clamps to minimum (99) when price is below floor', () => {
    expect(getPromptPrice(50)).toBe(99)
  })

  it('clamps to maximum (9999) when price exceeds ceiling', () => {
    expect(getPromptPrice(99999)).toBe(9999)
  })

  it('returns boundary values unchanged', () => {
    expect(getPromptPrice(99)).toBe(99)
    expect(getPromptPrice(9999)).toBe(9999)
  })
})

describe('formatPrice', () => {
  it('formats 399 cents as "$3.99"', () => {
    expect(formatPrice(399)).toBe('$3.99')
  })

  it('formats 100 cents as "$1.00"', () => {
    expect(formatPrice(100)).toBe('$1.00')
  })

  it('formats 0 cents as "$0.00"', () => {
    expect(formatPrice(0)).toBe('$0.00')
  })
})
