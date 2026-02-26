/**
 * Hash an IP address for privacy-safe storage.
 * Uses SHA-256 with a static salt, truncated to 16 hex chars.
 * Shared across like tracking, view tracking, and analytics middleware.
 */
export async function hashIp(ip: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(ip + '_salt_lapinski_art')
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 16)
}
