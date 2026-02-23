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
  createdAt: text('created_at').default(sql`(datetime('now'))`),
  updatedAt: text('updated_at').default(sql`(datetime('now'))`),
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
