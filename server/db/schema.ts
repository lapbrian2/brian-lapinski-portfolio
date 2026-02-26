import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
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
})

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
})

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
