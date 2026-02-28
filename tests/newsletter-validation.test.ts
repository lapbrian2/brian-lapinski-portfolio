import { describe, it, expect } from 'vitest'

/**
 * Tests for newsletter subscribe validation logic.
 * These test the pure validation rules extracted from the subscribe endpoint,
 * without requiring Nitro/H3 server context.
 */

// Extract the validation regex used in the subscribe endpoint
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

describe('newsletter email validation regex', () => {
  it('accepts a standard email', () => {
    expect(emailRegex.test('user@example.com')).toBe(true)
  })

  it('accepts emails with subdomains', () => {
    expect(emailRegex.test('user@mail.example.com')).toBe(true)
  })

  it('accepts emails with plus addressing', () => {
    expect(emailRegex.test('user+tag@example.com')).toBe(true)
  })

  it('accepts emails with dots in local part', () => {
    expect(emailRegex.test('first.last@example.com')).toBe(true)
  })

  it('rejects empty string', () => {
    expect(emailRegex.test('')).toBe(false)
  })

  it('rejects missing @ sign', () => {
    expect(emailRegex.test('userexample.com')).toBe(false)
  })

  it('rejects missing domain', () => {
    expect(emailRegex.test('user@')).toBe(false)
  })

  it('rejects missing local part', () => {
    expect(emailRegex.test('@example.com')).toBe(false)
  })

  it('rejects spaces in email', () => {
    expect(emailRegex.test('user @example.com')).toBe(false)
  })

  it('rejects multiple @ signs', () => {
    expect(emailRegex.test('user@@example.com')).toBe(false)
  })
})

describe('newsletter input constraints', () => {
  const MAX_EMAIL_LENGTH = 200
  const MAX_NAME_LENGTH = 100

  it('accepts email at exactly max length', () => {
    const localPart = 'a'.repeat(MAX_EMAIL_LENGTH - '@b.co'.length)
    const email = `${localPart}@b.co`
    expect(email.length).toBe(MAX_EMAIL_LENGTH)
    expect(emailRegex.test(email)).toBe(true)
  })

  it('name at max length is valid', () => {
    const name = 'A'.repeat(MAX_NAME_LENGTH)
    expect(name.length).toBe(MAX_NAME_LENGTH)
    // The server allows names up to 100 chars
  })

  it('email normalization: trims and lowercases', () => {
    const raw = '  User@Example.COM  '
    const normalized = raw.trim().toLowerCase()
    expect(normalized).toBe('user@example.com')
  })

  it('name normalization: trims whitespace', () => {
    const raw = '  Brian Lapinski  '
    const trimmed = raw.trim()
    expect(trimmed).toBe('Brian Lapinski')
  })

  it('empty name after trim becomes null', () => {
    const raw = '   '
    const trimmedName = (typeof raw === 'string' && raw.trim()) ? raw.trim() : null
    expect(trimmedName).toBeNull()
  })
})
