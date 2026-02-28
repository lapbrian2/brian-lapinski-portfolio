import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createError } from 'h3'

// Mock getRouterParam since it is auto-imported in Nuxt server context
let mockParams: Record<string, string | undefined> = {}

beforeEach(() => {
  mockParams = {}
  vi.stubGlobal('createError', createError)
  vi.stubGlobal('getRouterParam', (_event: unknown, name: string) => mockParams[name])
})

import { requireNumericParam } from '~/server/utils/params'

// Minimal H3Event-like object for testing
const fakeEvent = {} as Parameters<typeof requireNumericParam>[0]

describe('requireNumericParam', () => {
  it('returns a number for a valid numeric string param', () => {
    mockParams.id = '42'
    expect(requireNumericParam(fakeEvent, 'id')).toBe(42)
  })

  it('handles decimal numeric strings', () => {
    mockParams.price = '19.99'
    expect(requireNumericParam(fakeEvent, 'price')).toBe(19.99)
  })

  it('throws 400 when param is missing (undefined)', () => {
    // 'id' not in mockParams → getRouterParam returns undefined
    expect(() => requireNumericParam(fakeEvent, 'id')).toThrow()
    try {
      requireNumericParam(fakeEvent, 'id')
    } catch (error: unknown) {
      const err = error as { statusCode: number; statusMessage: string }
      expect(err.statusCode).toBe(400)
      expect(err.statusMessage).toBe('id is required')
    }
  })

  it('throws 400 when param is NaN (non-numeric string)', () => {
    mockParams.id = 'abc'
    expect(() => requireNumericParam(fakeEvent, 'id')).toThrow()
    try {
      requireNumericParam(fakeEvent, 'id')
    } catch (error: unknown) {
      const err = error as { statusCode: number; statusMessage: string }
      expect(err.statusCode).toBe(400)
      expect(err.statusMessage).toBe('id must be a number')
    }
  })

  it('uses custom label in error message when provided', () => {
    try {
      requireNumericParam(fakeEvent, 'id', 'Artwork ID')
    } catch (error: unknown) {
      const err = error as { statusCode: number; statusMessage: string }
      expect(err.statusMessage).toBe('Artwork ID is required')
    }
  })

  it('uses custom label for NaN error when provided', () => {
    mockParams.id = 'xyz'
    try {
      requireNumericParam(fakeEvent, 'id', 'Artwork ID')
    } catch (error: unknown) {
      const err = error as { statusCode: number; statusMessage: string }
      expect(err.statusMessage).toBe('Artwork ID must be a number')
    }
  })

  it('throws when param is empty string', () => {
    mockParams.id = ''
    // Empty string is falsy, so it hits the "is required" branch
    expect(() => requireNumericParam(fakeEvent, 'id')).toThrow()
    try {
      requireNumericParam(fakeEvent, 'id')
    } catch (error: unknown) {
      const err = error as { statusCode: number; statusMessage: string }
      expect(err.statusMessage).toBe('id is required')
    }
  })
})
