/**
 * Hash an IP address for privacy-safe storage.
 * Uses SHA-256 with a configurable salt, truncated to 16 hex chars.
 * Shared across like tracking, view tracking, and analytics middleware.
 */
export async function hashIp(ip: string): Promise<string> {
  const salt = process.env.NUXT_IP_HASH_SALT || '_salt_lapinski_art'
  const encoder = new TextEncoder()
  const data = encoder.encode(ip + salt)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 16)
}
