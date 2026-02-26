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

    // Print Shop tables
    await client.execute(`
      CREATE TABLE IF NOT EXISTS print_products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        artwork_id TEXT NOT NULL REFERENCES artworks(id) ON DELETE CASCADE,
        active INTEGER NOT NULL DEFAULT 1,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now'))
      )
    `)

    await client.execute(`
      CREATE TABLE IF NOT EXISTS print_variants (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id INTEGER NOT NULL REFERENCES print_products(id) ON DELETE CASCADE,
        size_name TEXT NOT NULL,
        size_width INTEGER NOT NULL,
        size_height INTEGER NOT NULL,
        material TEXT NOT NULL DEFAULT 'fine-art-paper',
        price INTEGER NOT NULL,
        printful_variant_id TEXT,
        active INTEGER NOT NULL DEFAULT 1,
        created_at TEXT DEFAULT (datetime('now'))
      )
    `)

    await client.execute(`
      CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT NOT NULL,
        stripe_session_id TEXT UNIQUE,
        stripe_payment_intent_id TEXT,
        status TEXT NOT NULL DEFAULT 'pending',
        total INTEGER NOT NULL,
        shipping_name TEXT,
        shipping_address TEXT,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now'))
      )
    `)

    await client.execute(`
      CREATE TABLE IF NOT EXISTS order_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
        variant_id INTEGER NOT NULL REFERENCES print_variants(id),
        quantity INTEGER NOT NULL DEFAULT 1,
        unit_price INTEGER NOT NULL
      )
    `)

    // Collections tables
    await client.execute(`
      CREATE TABLE IF NOT EXISTS collections (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        description TEXT,
        cover_image TEXT,
        sort_order INTEGER NOT NULL DEFAULT 0,
        featured INTEGER DEFAULT 0,
        created_at TEXT DEFAULT (datetime('now'))
      )
    `)

    await client.execute(`
      CREATE TABLE IF NOT EXISTS collection_artworks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        collection_id INTEGER NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
        artwork_id TEXT NOT NULL REFERENCES artworks(id) ON DELETE CASCADE,
        sort_order INTEGER NOT NULL DEFAULT 0
      )
    `)

    console.log('[db-migrate] All tables ready')
  } catch (err) {
    console.warn('[db-migrate] Migration check failed:', err)
  }
})
