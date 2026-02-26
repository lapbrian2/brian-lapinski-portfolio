/**
 * Nitro server plugin: ensures new tables exist on startup.
 * Uses raw SQL to CREATE TABLE IF NOT EXISTS — idempotent and safe.
 */
export default defineNitroPlugin(async () => {
  try {
    const config = useRuntimeConfig()
    if (!config.tursoUrl || !config.tursoAuthToken) return

    const { createClient } = await import('@libsql/client')
    const client = createClient({
      url: config.tursoUrl as string,
      authToken: config.tursoAuthToken as string,
    })

    // artwork_likes table — for Resonance Ripple feature
    await client.execute(`
      CREATE TABLE IF NOT EXISTS artwork_likes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        artwork_id TEXT NOT NULL REFERENCES artworks(id) ON DELETE CASCADE,
        ip TEXT NOT NULL,
        created_at TEXT DEFAULT (datetime('now'))
      )
    `)

    console.log('[db-migrate] artwork_likes table ready')
  } catch (err) {
    console.warn('[db-migrate] Migration check failed:', err)
  }
})
