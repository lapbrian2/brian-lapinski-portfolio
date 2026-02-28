import { describe, it, expect } from 'vitest'
import { getFetchErrorMessage } from '../utils/get-fetch-error-message'

describe('getFetchErrorMessage', () => {
  it('returns data.statusMessage from a FetchError-like object', () => {
    const error = { data: { statusMessage: 'Not Found' } }
    expect(getFetchErrorMessage(error, 'fallback')).toBe('Not Found')
  })

  it('returns fallback when data.statusMessage is empty string', () => {
    const error = { data: { statusMessage: '' } }
    expect(getFetchErrorMessage(error, 'Something went wrong')).toBe('Something went wrong')
  })

  it('returns fallback when data exists but statusMessage is undefined', () => {
    const error = { data: {} }
    expect(getFetchErrorMessage(error, 'Something went wrong')).toBe('Something went wrong')
  })

  it('returns fallback for a regular Error object (no data property)', () => {
    const error = new Error('internal failure')
    expect(getFetchErrorMessage(error, 'Request failed')).toBe('Request failed')
  })

  it('returns fallback for a plain string error', () => {
    expect(getFetchErrorMessage('some string', 'Oops')).toBe('Oops')
  })

  it('returns fallback for null', () => {
    expect(getFetchErrorMessage(null, 'Oops')).toBe('Oops')
  })

  it('returns fallback for undefined', () => {
    expect(getFetchErrorMessage(undefined, 'Oops')).toBe('Oops')
  })
})
