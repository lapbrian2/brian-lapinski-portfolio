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
    { id: 'the-nobleman', title: 'The Nobleman', category: 'portraits', medium: 'Midjourney', description: 'A man encased in tire rubber and gold thread stares through centuries — vanity dressed in the wreckage of industry.', src: '/images/artworks/the-nobleman.webp', aspect: 'square', year: 2025, sortOrder: 2 },
    { id: 'peeling-away', title: 'Peeling Away', category: 'portraits', medium: 'Midjourney', description: 'A face unravels in quiet surrender — the masks we wear peeling back to reveal the fragile truth beneath.', src: '/images/artworks/peeling-away.webp', aspect: 'square', year: 2025, sortOrder: 3 },
    { id: 'primal-scream', title: 'Primal Scream', category: 'abstract', medium: 'Midjourney', description: 'Raw, unfiltered rage rendered in vivid color — the animal within us all, unleashed.', src: '/images/artworks/primal-scream.webp', aspect: 'square', year: 2025, sortOrder: 4 },
    { id: 'chromatic-grief', title: 'Chromatic Grief', category: 'abstract', medium: 'Midjourney', description: 'A melting mask of iridescent sorrow — emotion given physical form, dripping with the weight of feeling.', src: '/images/artworks/chromatic-grief.webp', aspect: 'square', year: 2025, sortOrder: 5 },
    { id: 'the-gathering', title: 'The Gathering', category: 'landscapes', medium: 'Midjourney', description: 'Faceless figures converge toward an impossible light — the quiet pull of collective human experience.', src: '/images/artworks/the-gathering.webp', aspect: 'wide', year: 2025, sortOrder: 6 },
    { id: 'first-light', title: 'First Light', category: 'landscapes', medium: 'Midjourney', description: "A planet's edge catches the sun in a blade of gold — the silence before everything begins, witnessed from the void.", src: '/images/artworks/first-light.webp', aspect: 'wide', year: 2025, sortOrder: 7 },
    { id: 'the-hatchlings', title: 'The Hatchlings', category: 'surreal', medium: 'Midjourney', description: 'Translucent creatures with oversized eyes drip into being on a mossy branch — newborn and already grieving.', src: '/images/artworks/the-hatchlings.webp', aspect: 'wide', year: 2025, sortOrder: 8 },
    { id: 'first-encounter', title: 'First Encounter', category: 'surreal', medium: 'Midjourney', description: 'A child in orange meets a creature made of wire and wildness — curiosity dissolves the boundary between familiar and strange.', src: '/images/artworks/first-encounter.webp', aspect: 'square', year: 2025, sortOrder: 9 },
    { id: 'the-offering', title: 'The Offering', category: 'portraits', medium: 'Midjourney', description: 'A pale figure in scarlet silk lies still among dark-clad witnesses — devotion or surrender, the painting refuses to say.', src: '/images/artworks/the-offering.webp', aspect: 'tall', year: 2025, sortOrder: 10 },
    { id: 'the-weight', title: 'The Weight', category: 'portraits', medium: 'Midjourney', description: 'A woman bows beneath a golden wrap, skin cracked like ancient fresco — carrying something that has outlived her name.', src: '/images/artworks/the-weight.webp', aspect: 'square', year: 2025, sortOrder: 11 },
    { id: 'unspoken', title: 'Unspoken', category: 'portraits', medium: 'Midjourney', description: 'Words become clouds, teeth become architecture — what we cannot say takes on a life of its own.', src: '/images/artworks/unspoken.webp', aspect: 'square', year: 2025, sortOrder: 12 },
    { id: 'the-admiral', title: 'The Admiral', category: 'portraits', medium: 'Midjourney', description: 'An ornate figure weighed down by plumage and rank — authority rendered as armor, eyes heavy with the cost of command.', src: '/images/artworks/the-admiral.webp', aspect: 'square', year: 2025, sortOrder: 13 },
    { id: 'the-intern', title: 'The Intern', category: 'portraits', medium: 'Midjourney', description: 'A child banded at the eyes, swallowed by a suit too large for any body — ambition fitted before the self has even formed.', src: '/images/artworks/the-intern.webp', aspect: 'tall', year: 2025, sortOrder: 14 },
    { id: 'the-keeper', title: 'The Keeper', category: 'portraits', medium: 'Midjourney', description: 'An elder wrapped in feathers and bark gazes upward — part woman, part forest, holding knowledge older than language.', src: '/images/artworks/the-keeper.webp', aspect: 'square', year: 2025, sortOrder: 15 },
    { id: 'old-soldier', title: 'Old Soldier', category: 'portraits', medium: 'Midjourney', description: 'A weathered face beneath a dented helmet, a crow perched close enough to whisper — war remembered in wrinkles and feathers.', src: '/images/artworks/old-soldier.webp', aspect: 'tall', year: 2025, sortOrder: 16 },
    { id: 'the-companion', title: 'The Companion', category: 'portraits', medium: 'Midjourney', description: "A young ape in a soldier's helmet meets the lens with quiet intelligence, a bird at its shoulder — kinship across species, rendered without irony.", src: '/images/artworks/the-companion.webp', aspect: 'square', year: 2025, sortOrder: 17 },
    { id: 'metamorphosis', title: 'Metamorphosis', category: 'surreal', medium: 'Midjourney', description: 'Monarch butterflies erupt from cracked porcelain — a mind breaking open to release what it could never contain.', src: '/images/artworks/metamorphosis.webp', aspect: 'wide', year: 2025, sortOrder: 18 },
    { id: 'the-pilgrim', title: 'The Pilgrim', category: 'surreal', medium: 'Midjourney', description: 'A faceless figure in flowing robes glides on roller skates — devotion in motion, sacred and absurd in equal measure.', src: '/images/artworks/the-pilgrim.webp', aspect: 'tall', year: 2025, sortOrder: 19 },
    { id: 'the-crossing', title: 'The Crossing', category: 'landscapes', medium: 'Midjourney', description: 'Two small figures stand before a bridge that vanishes into towering clouds — the threshold between the known and the infinite.', src: '/images/artworks/the-crossing.webp', aspect: 'wide', year: 2025, sortOrder: 20 },
    { id: 'gorgons-cry', title: "Gorgon's Cry", category: 'abstract', medium: 'Midjourney', description: 'Stone tentacles writhe from a screaming face frozen mid-howl — rage petrified but never silenced.', src: '/images/artworks/gorgons-cry.webp', aspect: 'square', year: 2025, sortOrder: 21 },
    { id: 'red-sun-garden', title: 'Red Sun Garden', category: 'surreal', medium: 'Midjourney', description: 'A rusted sentinel looms over a garden of poppies and machines — tenderness persists in the wreckage of a forgotten world.', src: '/images/artworks/red-sun-garden.webp', aspect: 'wide', year: 2025, sortOrder: 22 },
    { id: 'signal-lost', title: 'Signal Lost', category: 'surreal', medium: 'Midjourney', description: 'A weathered creature with a television for a head sits alone, a dying city glowing behind its screen — broadcasting to no one.', src: '/images/artworks/signal-lost.webp', aspect: 'square', year: 2025, sortOrder: 23 },
    { id: 'the-broadcast', title: 'The Broadcast', category: 'surreal', medium: 'Midjourney', description: 'A small figure perched on a vintage television peers into a swirling portal of debris and light — tuning into a frequency the world forgot.', src: '/images/artworks/the-broadcast.webp', aspect: 'square', year: 2025, sortOrder: 24 },
    { id: 'the-travelers', title: 'The Travelers', category: 'portraits', medium: 'Midjourney', description: 'Two figures rest against a worn trunk in golden half-light — intimacy painted in the language of old masters, reimagined by machine.', src: '/images/artworks/the-travelers.webp', aspect: 'square', year: 2025, sortOrder: 25 },
    { id: 'the-executive', title: 'The Executive', category: 'portraits', medium: 'Midjourney', description: 'A faceless child in a tailored suit — innocence erased by the machinery of expectation, eyes replaced by static.', src: '/images/artworks/the-executive.webp', aspect: 'tall', year: 2025, sortOrder: 26 },
    { id: 'the-assembly', title: 'The Assembly', category: 'surreal', medium: 'Midjourney', description: 'Box-headed figures stand in formation before a towering machine — obedience manufactured at scale, individuality filed down to fit.', src: '/images/artworks/the-assembly.webp', aspect: 'square', year: 2025, sortOrder: 27 },
    { id: 'city-vortex', title: 'City Vortex', category: 'surreal', medium: 'Midjourney', description: 'A skyline folds inward on itself, swallowed by a spiraling portal of cloud and concrete — civilization consumed by its own gravity.', src: '/images/artworks/city-vortex.webp', aspect: 'wide', year: 2025, sortOrder: 28 },
    { id: 'the-watchers', title: 'The Watchers', category: 'surreal', medium: 'Midjourney', description: 'Translucent creatures with impossible eyes perch in silence — fragile, curious beings on the edge of existence.', src: '/images/artworks/the-watchers.webp', aspect: 'wide', year: 2025, sortOrder: 29 },
    { id: 'opening-night', title: 'Opening Night', category: 'surreal', medium: 'Midjourney', description: 'A wide-eyed girl clutches popcorn outside a glowing cinema — wonder preserved in animation, nostalgia rendered in pixels.', src: '/images/artworks/opening-night.webp', aspect: 'wide', year: 2025, sortOrder: 30 },
    { id: 'melting-mask', title: 'Melting Mask', category: 'abstract', medium: 'Midjourney', description: 'A porcelain face weeps iridescent streaks into black pooling nothing — sorrow rendered as liquid sculpture, beautiful and irreversible.', src: '/images/artworks/melting-mask.webp', aspect: 'square', year: 2025, sortOrder: 31 },
    { id: 'smoke-and-bone', title: 'Smoke and Bone', category: 'abstract', medium: 'Midjourney', description: 'Teeth emerge from billowing clouds of smoke — the body made elemental, language dissolving before it forms.', src: '/images/artworks/smoke-and-bone.webp', aspect: 'square', year: 2025, sortOrder: 32 },
    { id: 'cloud-atlas', title: 'Cloud Atlas', category: 'abstract', medium: 'Midjourney', description: 'A face fragments into sky and gold leaf — identity scattered across weather systems, memory pixelated into atmosphere.', src: '/images/artworks/cloud-atlas.webp', aspect: 'square', year: 2025, sortOrder: 33 },
    { id: 'ember-bloom', title: 'Ember Bloom', category: 'abstract', medium: 'Midjourney', description: 'An orange anemone unfurls against pure darkness — color so vivid it burns, petals like paper catching light before flame.', src: '/images/artworks/ember-bloom.webp', aspect: 'square', year: 2025, sortOrder: 34 },
    { id: 'twilight-bloom', title: 'Twilight Bloom', category: 'abstract', medium: 'Midjourney', description: 'Copper and silver petals catch the last light — a flower that exists only in the space between day and night.', src: '/images/artworks/twilight-bloom.webp', aspect: 'square', year: 2025, sortOrder: 35 },
    { id: 'the-procession', title: 'The Procession', category: 'surreal', medium: 'Midjourney', description: 'Stick figures hold hands in endless rows toward a burning light — obedience or devotion, the line between them erased by scale.', src: '/images/artworks/the-procession.webp', aspect: 'wide', year: 2025, sortOrder: 36 },
    { id: 'world-in-a-storm', title: 'World in a Storm', category: 'surreal', medium: 'Midjourney', description: 'A house clings to a floating sphere of lightning and debris — domesticity suspended in catastrophe, shelter in free fall.', src: '/images/artworks/world-in-a-storm.webp', aspect: 'square', year: 2025, sortOrder: 37 },
    { id: 'sheltered-world', title: 'Sheltered World', category: 'surreal', medium: 'Midjourney', description: 'A village glows inside a glass orb on a wooden table — entire lives contained in something you could hold and drop.', src: '/images/artworks/sheltered-world.webp', aspect: 'square', year: 2025, sortOrder: 38 },
    { id: 'the-deep-one', title: 'The Deep One', category: 'surreal', medium: 'Midjourney', description: 'A furious fish creature screams into underwater light — the absurdity of rage given scales and teeth, comically monstrous.', src: '/images/artworks/the-deep-one.webp', aspect: 'wide', year: 2025, sortOrder: 39 },
    { id: 'the-descent', title: 'The Descent', category: 'surreal', medium: 'Midjourney', description: 'A brass diving helmet faces a kraken in a burst of electric blue — the courage to go where pressure crushes everything familiar.', src: '/images/artworks/the-descent.webp', aspect: 'square', year: 2025, sortOrder: 40 },
    { id: 'the-grinning', title: 'The Grinning', category: 'surreal', medium: 'Midjourney', description: 'A round-headed figure grins with buckteeth in pure black void — innocence and uncanniness collapsed into a single expression.', src: '/images/artworks/the-grinning.webp', aspect: 'square', year: 2025, sortOrder: 41 },
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
