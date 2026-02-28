/**
 * Nitro server plugin: validates environment variables on startup.
 * Required vars trigger errors; optional vars trigger warnings.
 */
export default defineNitroPlugin(() => {
  const required = [
    'TURSO_DATABASE_URL',
    'TURSO_AUTH_TOKEN',
    'ADMIN_PASSWORD',
    'ADMIN_SESSION_SECRET',
  ]

  const optional = [
    'RESEND_API_KEY',
    'STRIPE_SECRET_KEY',
    'BLOB_READ_WRITE_TOKEN',
    'SENTRY_DSN',
  ]

  const missing: string[] = []
  for (const key of required) {
    if (!process.env[key]) {
      missing.push(key)
    }
  }

  if (missing.length) {
    console.error(`[env] Missing required environment variables: ${missing.join(', ')}`)
  }

  const missingOptional: string[] = []
  for (const key of optional) {
    if (!process.env[key]) {
      missingOptional.push(key)
    }
  }

  if (missingOptional.length) {
    console.warn(`[env] Missing optional environment variables (some features disabled): ${missingOptional.join(', ')}`)
  }
})
