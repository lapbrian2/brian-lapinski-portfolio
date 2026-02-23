/**
 * Seed script — run with: npx tsx server/db/seed.ts
 * Idempotent: safe to re-run (uses INSERT OR REPLACE)
 */
import 'dotenv/config'
import { drizzle } from 'drizzle-orm/libsql'
import { createClient } from '@libsql/client'
import { artworks, content, credentials, stats } from './schema'

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
})

const db = drizzle(client)

async function seed() {
  console.log('Seeding database...')

  // ── Artworks ──────────────────────────────────────
  const artworkData = [
    { id: 'the-watcher', title: 'The Watcher', category: 'surreal', medium: 'Midjourney', description: 'A sentient eye erupts from organic matter, crowned with lightning — the boundary between seeing and being seen dissolves.', src: '/images/artworks/the-watcher.webp', aspect: 'square', year: 2025, sortOrder: 0 },
    { id: 'bloom-of-decay', title: 'Bloom of Decay', category: 'surreal', medium: 'Midjourney', description: 'Flowers emerge from a gaping maw of stone and teeth — beauty and destruction entangled in a single breath.', src: '/images/artworks/bloom-of-decay.webp', aspect: 'wide', year: 2025, sortOrder: 1 },
    { id: 'primal-scream', title: 'Primal Scream', category: 'abstract', medium: 'Midjourney', description: 'Raw, unfiltered rage rendered in vivid color — the animal within us all, unleashed.', src: '/images/artworks/primal-scream.webp', aspect: 'square', year: 2025, sortOrder: 2 },
    { id: 'chromatic-grief', title: 'Chromatic Grief', category: 'abstract', medium: 'Midjourney', description: 'A melting mask of iridescent sorrow — emotion given physical form, dripping with the weight of feeling.', src: '/images/artworks/chromatic-grief.webp', aspect: 'square', year: 2025, sortOrder: 3 },
    { id: 'the-gathering', title: 'The Gathering', category: 'landscapes', medium: 'Midjourney', description: 'Faceless figures converge toward an impossible light — the quiet pull of collective human experience.', src: '/images/artworks/the-gathering.webp', aspect: 'wide', year: 2025, sortOrder: 4 },
    { id: 'unspoken', title: 'Unspoken', category: 'portraits', medium: 'Midjourney', description: 'Words become clouds, teeth become architecture — what we cannot say takes on a life of its own.', src: '/images/artworks/unspoken.webp', aspect: 'square', year: 2025, sortOrder: 5 },
    { id: 'peeling-away', title: 'Peeling Away', category: 'portraits', medium: 'Midjourney', description: 'A face unravels in quiet surrender — the masks we wear peeling back to reveal the fragile truth beneath.', src: '/images/artworks/peeling-away.webp', aspect: 'square', year: 2025, sortOrder: 6 },
    { id: 'metamorphosis', title: 'Metamorphosis', category: 'surreal', medium: 'Midjourney', description: 'Monarch butterflies erupt from cracked porcelain — a mind breaking open to release what it could never contain.', src: '/images/artworks/metamorphosis.webp', aspect: 'wide', year: 2025, sortOrder: 7 },
    { id: 'the-crossing', title: 'The Crossing', category: 'landscapes', medium: 'Midjourney', description: 'Two small figures stand before a bridge that vanishes into towering clouds — the threshold between the known and the infinite.', src: '/images/artworks/the-crossing.webp', aspect: 'wide', year: 2025, sortOrder: 8 },
    { id: 'red-sun-garden', title: 'Red Sun Garden', category: 'surreal', medium: 'Midjourney', description: 'A rusted sentinel looms over a garden of poppies and machines — tenderness persists in the wreckage of a forgotten world.', src: '/images/artworks/red-sun-garden.webp', aspect: 'wide', year: 2025, sortOrder: 9 },
    { id: 'first-encounter', title: 'First Encounter', category: 'surreal', medium: 'Midjourney', description: 'A child in orange meets a creature made of wire and wildness — curiosity dissolves the boundary between familiar and strange.', src: '/images/artworks/first-encounter.webp', aspect: 'square', year: 2025, sortOrder: 10 },
    { id: 'gorgons-cry', title: "Gorgon's Cry", category: 'abstract', medium: 'Midjourney', description: 'Stone tentacles writhe from a screaming face frozen mid-howl — rage petrified but never silenced.', src: '/images/artworks/gorgons-cry.webp', aspect: 'square', year: 2025, sortOrder: 11 },
    { id: 'the-watchers', title: 'The Watchers', category: 'surreal', medium: 'Midjourney', description: 'Translucent creatures with impossible eyes perch in silence — fragile, curious beings on the edge of existence.', src: '/images/artworks/the-watchers.webp', aspect: 'wide', year: 2025, sortOrder: 12 },
    { id: 'the-executive', title: 'The Executive', category: 'portraits', medium: 'Midjourney', description: 'A faceless child in a tailored suit — innocence erased by the machinery of expectation, eyes replaced by static.', src: '/images/artworks/the-executive.webp', aspect: 'tall', year: 2025, sortOrder: 13 },
    { id: 'city-vortex', title: 'City Vortex', category: 'surreal', medium: 'Midjourney', description: 'A skyline folds inward on itself, swallowed by a spiraling portal of cloud and concrete — civilization consumed by its own gravity.', src: '/images/artworks/city-vortex.webp', aspect: 'wide', year: 2025, sortOrder: 14 },
  ]

  for (const artwork of artworkData) {
    await db.insert(artworks).values(artwork).onConflictDoUpdate({
      target: artworks.id,
      set: { ...artwork },
    })
  }
  console.log(`  ✓ ${artworkData.length} artworks seeded`)

  // ── Content (bio paragraphs, pullquote) ───────────
  const contentData = [
    { key: 'pullquote', value: 'I use images as a way to explore what it means to be human.', section: 'about' },
    { key: 'bio_1', value: "I didn't come to AI art through technology — I came through a need to understand something about myself. Every piece I create starts with a feeling, a question, or a moment of genuine curiosity about the human experience.", section: 'about' },
    { key: 'bio_2', value: "I'm drawn to images that speak without words. The ones that stop you for a second and create a quiet connection between strangers. That's what I chase — not trends, not technique for its own sake, but emotional truth.", section: 'about' },
    { key: 'bio_3', value: "Teaching is central to what I do. As AI Architect at The House of Curiosity, Creative Partner at ImagineArt and Caimera, and a contributor to Creativa Magazine Volume 7, I help others discover their own creative voice through AI. My Style DNA methodology treats prompt engineering as a reproducible craft — giving artists a framework to translate inner vision into language machines can interpret.", section: 'about' },
    { key: 'bio_4', value: "My work has been exhibited internationally — Dream AI Gallery in New Jersey, Fundacion Nestle Barcelona, FNAC Asturias, and Art Innovation Gallery in New York. Each exhibition is a conversation with a new audience, and that's what keeps this practice alive.", section: 'about' },
    { key: 'site_description', value: 'Brian Lapinski — exploring what it means to be human through images. AI artist, educator, and Creative Partner.', section: 'meta' },
    { key: 'contact_heading', value: "Let's Create Together", section: 'contact' },
    { key: 'contact_subtitle', value: 'Have a project, collaboration, or just want to talk about AI art?', section: 'contact' },
  ]

  for (const item of contentData) {
    await db.insert(content).values(item).onConflictDoUpdate({
      target: content.key,
      set: { value: item.value, section: item.section },
    })
  }
  console.log(`  ✓ ${contentData.length} content entries seeded`)

  // ── Credentials ───────────────────────────────────
  // Clear and re-insert (no natural key for conflict resolution)
  await db.delete(credentials)
  const credentialData = [
    { name: 'Dream AI Gallery', type: 'exhibition', sortOrder: 0 },
    { name: 'Fundacion Nestle Barcelona', type: 'exhibition', sortOrder: 1 },
    { name: 'FNAC Asturias', type: 'exhibition', sortOrder: 2 },
    { name: 'Art Innovation NYC', type: 'exhibition', sortOrder: 3 },
  ]
  for (const cred of credentialData) {
    await db.insert(credentials).values(cred)
  }
  console.log(`  ✓ ${credentialData.length} credentials seeded`)

  // ── Stats ─────────────────────────────────────────
  await db.delete(stats)
  const statsData = [
    { value: '4+', label: 'Exhibitions', sortOrder: 0 },
    { value: '6', label: 'Creative Roles', sortOrder: 1 },
    { value: '100+', label: 'Artworks', sortOrder: 2 },
    { value: '2024', label: 'Since', sortOrder: 3 },
  ]
  for (const stat of statsData) {
    await db.insert(stats).values(stat)
  }
  console.log(`  ✓ ${statsData.length} stats seeded`)

  console.log('\nSeed complete!')
  process.exit(0)
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
