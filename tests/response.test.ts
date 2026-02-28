import { describe, it, expect, vi, beforeEach } from 'vitest'

// Provide the h3 createError as a global, since Nuxt auto-imports it in server context
import { createError } from 'h3'
beforeEach(() => {
  vi.stubGlobal('createError', createError)
})

import { apiSuccess, apiError } from '~/server/utils/response'

describe('apiSuccess', () => {
  it('wraps data in { success: true, data: ... }', () => {
    const result = apiSuccess({ id: 1, name: 'Test' })
    expect(result).toEqual({ success: true, data: { id: 1, name: 'Test' } })
  })

  it('sets success to exactly true (const)', () => {
    const result = apiSuccess('hello')
    expect(result.success).toBe(true)
  })

  it('handles null data', () => {
    const result = apiSuccess(null)
    expect(result).toEqual({ success: true, data: null })
  })

  it('handles empty object data', () => {
    const result = apiSuccess({})
    expect(result).toEqual({ success: true, data: {} })
  })

  it('handles nested objects', () => {
    const nested = { a: { b: { c: [1, 2, 3] } } }
    const result = apiSuccess(nested)
    expect(result.data).toEqual(nested)
    expect(result.success).toBe(true)
  })

  it('spreads meta properties onto the response', () => {
    const result = apiSuccess('data', { total: 42, page: 1 })
    expect(result).toEqual({ success: true, data: 'data', total: 42, page: 1 })
  })
})

describe('apiError', () => {
  it('throws an error with the correct statusCode and statusMessage', () => {
    expect(() => apiError('Not found', 404)).toThrow()
    try {
      apiError('Not found', 404)
    } catch (error: unknown) {
      const err = error as { statusCode: number; statusMessage: string }
      expect(err.statusCode).toBe(404)
      expect(err.statusMessage).toBe('Not found')
    }
  })

  it('defaults to statusCode 400 when not specified', () => {
    try {
      apiError('Bad request')
    } catch (error: unknown) {
      const err = error as { statusCode: number; statusMessage: string }
      expect(err.statusCode).toBe(400)
      expect(err.statusMessage).toBe('Bad request')
    }
  })

  it('always throws (return type is never)', () => {
    expect(() => apiError('Server error', 500)).toThrow()
  })
})
