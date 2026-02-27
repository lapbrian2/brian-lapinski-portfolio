import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'

// Artworks
export const artworks = sqliteTable('artworks', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  category: text('category').notNull(),
  medium: text('medium').notNull(),
  description: text('description').notNull(),
  src: text('src').notNull(),
  aspect: text('aspect').notNull(),
  year: integer('year').notNull(),
  sortOrder: integer('sort_order').notNull().default(0),
  featured: integer('featured', { mode: 'boolean' }).default(false),
  // Ossuary: prompt architecture fields
  rawPrompt: text('raw_prompt'),
  mjVersion: text('mj_version'),
  refinementNotes: text('refinement_notes'),
  dominantColor: text('dominant_color'),
  createdAt: text('created_at').default(sql`(datetime('now'))`),
  updatedAt: text('updated_at').default(sql`(datetime('now'))`),
})

// Prompt Techniques — the building blocks of prompt architecture
export const techniques = sqliteTable('techniques', {
  id: text('id').primaryKey(),
  name: text('name').notNull().unique(),
  category: text('category').notNull(), // 'lighting' | 'camera' | 'style' | 'mood' | 'composition' | 'material' | 'color' | 'post'
  description: text('description'),
  createdAt: text('created_at').default(sql`(datetime('now'))`),
})

// Many-to-many: Artwork <-> Technique
export const artworkTechniques = sqliteTable('artwork_techniques', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  artworkId: text('artwork_id').notNull().references(() => artworks.id, { onDelete: 'cascade' }),
  techniqueId: text('technique_id').notNull().references(() => techniques.id, { onDelete: 'cascade' }),
})

// Public Users (OAuth)
export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email'),
  name: text('name'),
  avatarUrl: text('avatar_url'),
  provider: text('provider').notNull(), // 'github' | 'google'
  providerId: text('provider_id').notNull(),
  createdAt: text('created_at').default(sql`(datetime('now'))`),
}, (table) => ({
  providerIdx: index('users_provider_idx').on(table.provider, table.providerId),
}))

// Key-value content store for editable text blocks
export const content = sqliteTable('content', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
  section: text('section').notNull(),
  updatedAt: text('updated_at').default(sql`(datetime('now'))`),
})

// Credentials / Exhibitions
export const credentials = sqliteTable('credentials', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  type: text('type').notNull().default('exhibition'),
  sortOrder: integer('sort_order').notNull().default(0),
})

// Stats counters (4+ Exhibitions, 6 Creative Roles, etc.)
export const stats = sqliteTable('stats', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  value: text('value').notNull(),
  label: text('label').notNull(),
  sortOrder: integer('sort_order').notNull().default(0),
})

// Artwork Likes (resonance)
export const artworkLikes = sqliteTable('artwork_likes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  artworkId: text('artwork_id').notNull().references(() => artworks.id, { onDelete: 'cascade' }),
  ip: text('ip').notNull(),
  createdAt: text('created_at').default(sql`(datetime('now'))`),
}, (table) => ({
  artworkIdx: index('artwork_likes_artwork_idx').on(table.artworkId),
  ipIdx: index('artwork_likes_ip_idx').on(table.ip),
}))

// Analytics: Page Views
export const pageViews = sqliteTable('page_views', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  path: text('path').notNull(),
  artworkId: text('artwork_id'),
  referrer: text('referrer'),
  userAgent: text('user_agent'),
  ip: text('ip'),
  country: text('country'),
  createdAt: text('created_at').default(sql`(datetime('now'))`),
}, (table) => ({
  artworkIdx: index('page_views_artwork_idx').on(table.artworkId),
  createdAtIdx: index('page_views_created_at_idx').on(table.createdAt),
  pathIdx: index('page_views_path_idx').on(table.path),
}))

// Admin Sessions
export const sessions = sqliteTable('sessions', {
  id: text('id').primaryKey(),
  createdAt: text('created_at').default(sql`(datetime('now'))`),
  expiresAt: text('expires_at').notNull(),
})

// Contact Form Submissions
export const contactSubmissions = sqliteTable('contact_submissions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  email: text('email').notNull(),
  message: text('message').notNull(),
  ip: text('ip'),
  createdAt: text('created_at').default(sql`(datetime('now'))`),
})

// ─── Print Shop ───

// Print Products — represents a printable version of an artwork
export const printProducts = sqliteTable('print_products', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  artworkId: text('artwork_id').notNull().references(() => artworks.id, { onDelete: 'cascade' }),
  active: integer('active', { mode: 'boolean' }).notNull().default(true),
  createdAt: text('created_at').default(sql`(datetime('now'))`),
  updatedAt: text('updated_at').default(sql`(datetime('now'))`),
})

// Print Variants — different sizes/materials for a product
export const printVariants = sqliteTable('print_variants', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  productId: integer('product_id').notNull().references(() => printProducts.id, { onDelete: 'cascade' }),
  sizeName: text('size_name').notNull(),
  sizeWidth: integer('size_width').notNull(),
  sizeHeight: integer('size_height').notNull(),
  material: text('material').notNull().default('fine-art-paper'),
  price: integer('price').notNull(), // cents
  printfulVariantId: text('printful_variant_id'),
  active: integer('active', { mode: 'boolean' }).notNull().default(true),
  createdAt: text('created_at').default(sql`(datetime('now'))`),
})

// Orders
export const orders = sqliteTable('orders', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  email: text('email').notNull(),
  stripeSessionId: text('stripe_session_id').unique(),
  stripePaymentIntentId: text('stripe_payment_intent_id'),
  status: text('status').notNull().default('pending'),
  total: integer('total').notNull(), // cents
  shippingName: text('shipping_name'),
  shippingAddress: text('shipping_address'), // JSON
  createdAt: text('created_at').default(sql`(datetime('now'))`),
  updatedAt: text('updated_at').default(sql`(datetime('now'))`),
})

// Order Line Items
export const orderItems = sqliteTable('order_items', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  orderId: integer('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),
  variantId: integer('variant_id').notNull().references(() => printVariants.id),
  quantity: integer('quantity').notNull().default(1),
  unitPrice: integer('unit_price').notNull(), // cents at time of purchase
})

// ─── Collections & Curation ───

export const collections = sqliteTable('collections', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  coverImage: text('cover_image'),
  sortOrder: integer('sort_order').notNull().default(0),
  featured: integer('featured', { mode: 'boolean' }).default(false),
  createdAt: text('created_at').default(sql`(datetime('now'))`),
})

export const collectionArtworks = sqliteTable('collection_artworks', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  collectionId: integer('collection_id').notNull().references(() => collections.id, { onDelete: 'cascade' }),
  artworkId: text('artwork_id').notNull().references(() => artworks.id, { onDelete: 'cascade' }),
  sortOrder: integer('sort_order').notNull().default(0),
})
