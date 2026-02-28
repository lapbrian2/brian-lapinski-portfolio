import { describe, it, expect } from 'vitest'
import { hashIp } from '~/server/utils/hash-ip'

describe('hashIp', () => {
  it('produces deterministic output (same input gives same hash)', async () => {
    const hash1 = await hashIp('192.168.1.1')
    const hash2 = await hashIp('192.168.1.1')
    expect(hash1).toBe(hash2)
  })

  it('produces different hashes for different IPs', async () => {
    const hash1 = await hashIp('192.168.1.1')
    const hash2 = await hashIp('10.0.0.1')
    expect(hash1).not.toBe(hash2)
  })

  it('returns exactly 16 hex characters', async () => {
    const hash = await hashIp('192.168.1.1')
    expect(hash).toHaveLength(16)
    expect(hash).toMatch(/^[0-9a-f]{16}$/)
  })

  it('handles empty string input', async () => {
    const hash = await hashIp('')
    expect(hash).toHaveLength(16)
    expect(hash).toMatch(/^[0-9a-f]{16}$/)
  })

  it('handles IPv6 addresses', async () => {
    const hash = await hashIp('::1')
    expect(hash).toHaveLength(16)
    expect(hash).toMatch(/^[0-9a-f]{16}$/)

    const hashFull = await hashIp('2001:0db8:85a3:0000:0000:8a2e:0370:7334')
    expect(hashFull).toHaveLength(16)
    expect(hashFull).toMatch(/^[0-9a-f]{16}$/)

    // Different IPv6 addresses produce different hashes
    expect(hash).not.toBe(hashFull)
  })
})
