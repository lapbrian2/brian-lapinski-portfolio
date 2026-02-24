/**
 * Seed script — run with: npx tsx server/db/seed.ts
 * Idempotent: safe to re-run (uses INSERT OR REPLACE)
 */
import 'dotenv/config'
import { drizzle } from 'drizzle-orm/libsql'
import { createClient } from '@libsql/client'
import { artworks, content, credentials, stats, techniques, artworkTechniques } from './schema'

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
})

const db = drizzle(client)

/** Helper: expand an artwork ID + technique IDs into junction records */
function expand(artworkId: string, techniqueIds: string[]) {
  return techniqueIds.map((techniqueId) => ({ artworkId, techniqueId }))
}

async function seed() {
  console.log('Seeding database...')

  // ── Artworks ──────────────────────────────────────
  const artworkData = [
    { id: 'the-watcher', title: 'The Watcher', category: 'surreal', medium: 'Midjourney', description: 'A sentient eye erupts from organic matter, crowned with lightning — the boundary between seeing and being seen dissolves.', src: '/images/artworks/the-watcher.webp', aspect: 'square', year: 2025, sortOrder: 0, dominantColor: '#4a7a8c', rawPrompt: 'sentient eye erupting from organic biomass, crowned with lightning bolts, bioluminescent tendrils, macro lens perspective, volumetric fog, chiaroscuro lighting --ar 1:1 --v 7 --style raw', mjVersion: null, refinementNotes: 'Pushed chiaroscuro hard. 3 rounds of inpainting on the lightning crown to get the energy right. Started with a simpler organic mass, iterated toward more complex bio-structure.' },
    { id: 'bloom-of-decay', title: 'Bloom of Decay', category: 'surreal', medium: 'Midjourney', description: 'Flowers emerge from a gaping maw of stone and teeth — beauty and destruction entangled in a single breath.', src: '/images/artworks/bloom-of-decay.webp', aspect: 'wide', year: 2025, sortOrder: 1, dominantColor: '#c45a6e', rawPrompt: 'flowers erupting from a gaping stone maw with teeth, baroque still life, vanitas symbolism, volumetric lighting, dutch golden age palette, dramatic shadows --ar 16:9 --v 7 --style raw', mjVersion: null, refinementNotes: 'Vanitas + baroque still life mashup. The teeth needed to feel geological, not monster-like. Color shifted toward warm reds to keep it lush.' },
    { id: 'the-nobleman', title: 'The Nobleman', category: 'portraits', medium: 'Midjourney', description: 'A man encased in tire rubber and gold thread stares through centuries — vanity dressed in the wreckage of industry.', src: '/images/artworks/the-nobleman.webp', aspect: 'square', year: 2025, sortOrder: 2, dominantColor: '#b8963e', rawPrompt: 'aristocratic portrait, man wearing armor made of tire rubber and gold thread, Rembrandt lighting, oil painting texture, dark background, Renaissance composition --ar 1:1 --v 7 --style raw', mjVersion: null, refinementNotes: 'Renaissance portrait structure with industrial material swap. Rembrandt lighting was key — 4 variations before the gold thread caught light correctly.' },
    { id: 'peeling-away', title: 'Peeling Away', category: 'portraits', medium: 'Midjourney', description: 'A face unravels in quiet surrender — the masks we wear peeling back to reveal the fragile truth beneath.', src: '/images/artworks/peeling-away.webp', aspect: 'square', year: 2025, sortOrder: 3, dominantColor: '#c4a882', rawPrompt: 'portrait of a face unraveling like peeling wallpaper, layers of skin revealing light beneath, soft diffused lighting, shallow depth of field, painterly texture --ar 1:1 --v 7 --style raw', mjVersion: null, refinementNotes: 'Restraint was the challenge. Early versions were too grotesque — needed the peeling to feel gentle, like shedding.' },
    { id: 'primal-scream', title: 'Primal Scream', category: 'abstract', medium: 'Midjourney', description: 'Raw, unfiltered rage rendered in vivid color — the animal within us all, unleashed.', src: '/images/artworks/primal-scream.webp', aspect: 'square', year: 2025, sortOrder: 4, dominantColor: '#e04040', rawPrompt: 'abstract expressionist screaming face, vivid reds and oranges, Francis Bacon influence, aggressive brushstrokes, high contrast, raw emotional intensity --ar 1:1 --v 7 --style raw', mjVersion: null, refinementNotes: 'Francis Bacon meets digital expressionism. Cranked the color saturation. The face needed to feel like it was dissolving into the scream itself.' },
    { id: 'chromatic-grief', title: 'Chromatic Grief', category: 'abstract', medium: 'Midjourney', description: 'A melting mask of iridescent sorrow — emotion given physical form, dripping with the weight of feeling.', src: '/images/artworks/chromatic-grief.webp', aspect: 'square', year: 2025, sortOrder: 5, dominantColor: '#7b5ea7', rawPrompt: 'iridescent melting mask, chrome tears, holographic surface, studio lighting with colored gels, deep purple shadows, macro photography style --ar 1:1 --v 7 --style raw', mjVersion: null, refinementNotes: 'The iridescence was the whole point. Colored gel lighting + holographic material descriptors. 5 rounds to get the drip weight right.' },
    { id: 'the-gathering', title: 'The Gathering', category: 'landscapes', medium: 'Midjourney', description: 'Faceless figures converge toward an impossible light — the quiet pull of collective human experience.', src: '/images/artworks/the-gathering.webp', aspect: 'wide', year: 2025, sortOrder: 6, dominantColor: '#d4a84b', rawPrompt: 'faceless silhouette figures walking toward a massive golden light source, god rays, atmospheric perspective, Caspar David Friedrich composition, warm golden hour --ar 16:9 --v 7 --style raw', mjVersion: null, refinementNotes: 'Friedrich-scale romanticism. The god rays needed to be the protagonist. Facelessness was deliberate — identity dissolves in collective movement.' },
    { id: 'first-light', title: 'First Light', category: 'landscapes', medium: 'Midjourney', description: "A planet's edge catches the sun in a blade of gold — the silence before everything begins, witnessed from the void.", src: '/images/artworks/first-light.webp', aspect: 'wide', year: 2025, sortOrder: 7, dominantColor: '#e8b44c', rawPrompt: 'planet edge catching sunrise from space, blade of golden light, cosmic scale, lens flare, deep black void, cinematic anamorphic, silence of space --ar 16:9 --v 7 --style raw', mjVersion: null, refinementNotes: 'Anamorphic lens language applied to cosmic scale. The lens flare is the emotional anchor — that thin blade of gold against infinite black.' },
    { id: 'the-hatchlings', title: 'The Hatchlings', category: 'surreal', medium: 'Midjourney', description: 'Translucent creatures with oversized eyes drip into being on a mossy branch — newborn and already grieving.', src: '/images/artworks/the-hatchlings.webp', aspect: 'wide', year: 2025, sortOrder: 8, dominantColor: '#5a8a5e', rawPrompt: 'translucent newborn creatures with oversized eyes on a mossy branch, bioluminescent, subsurface scattering, macro lens, shallow depth of field, morning dew, forest light --ar 16:9 --v 7 --style raw', mjVersion: null, refinementNotes: 'Subsurface scattering was essential for the translucent skin. The eyes needed to be large enough to evoke empathy without being cartoonish.' },
    { id: 'first-encounter', title: 'First Encounter', category: 'surreal', medium: 'Midjourney', description: 'A child in orange meets a creature made of wire and wildness — curiosity dissolves the boundary between familiar and strange.', src: '/images/artworks/first-encounter.webp', aspect: 'square', year: 2025, sortOrder: 9, dominantColor: '#d47a3a', rawPrompt: 'child in orange raincoat facing a wire-frame creature in misty forest, warm and cool contrast, Spielberg lighting, shallow depth of field, wonder and fear --ar 1:1 --v 7 --style raw', mjVersion: null, refinementNotes: 'Spielberg-style wonder lighting. The orange raincoat is the emotional anchor against cool mist. Wire creature needed to feel organic despite being mechanical.' },
    { id: 'the-offering', title: 'The Offering', category: 'portraits', medium: 'Midjourney', description: 'A pale figure in scarlet silk lies still among dark-clad witnesses — devotion or surrender, the painting refuses to say.', src: '/images/artworks/the-offering.webp', aspect: 'tall', year: 2025, sortOrder: 10, dominantColor: '#b83a3a', rawPrompt: 'pale figure draped in scarlet silk lying among dark-robed witnesses, Caravaggio chiaroscuro, dramatic spotlight, oil painting texture, religious composition, Renaissance palette --ar 3:4 --v 7 --style raw', mjVersion: null, refinementNotes: 'Pure Caravaggio. The scarlet against dark robes creates the entire tension. Compositionally modeled after The Entombment of Christ.' },
    { id: 'the-weight', title: 'The Weight', category: 'portraits', medium: 'Midjourney', description: 'A woman bows beneath a golden wrap, skin cracked like ancient fresco — carrying something that has outlived her name.', src: '/images/artworks/the-weight.webp', aspect: 'square', year: 2025, sortOrder: 11, dominantColor: '#c8a855', rawPrompt: 'woman bowing beneath a golden shawl, skin cracked like ancient fresco, gold leaf accents, Klimt-inspired, warm side lighting, painterly texture --ar 1:1 --v 7 --style raw', mjVersion: null, refinementNotes: 'Klimt meets fresco decay. The cracked skin texture was the hardest element — needed to feel ancient without feeling wounded.' },
    { id: 'unspoken', title: 'Unspoken', category: 'portraits', medium: 'Midjourney', description: 'Words become clouds, teeth become architecture — what we cannot say takes on a life of its own.', src: '/images/artworks/unspoken.webp', aspect: 'square', year: 2025, sortOrder: 12, dominantColor: '#8899aa', rawPrompt: 'portrait with words transforming into clouds emerging from mouth, teeth becoming architectural structures, cool desaturated palette, surrealist anatomical study --ar 1:1 --v 7 --style raw', mjVersion: null, refinementNotes: 'Magritte meets medical illustration. Cool palette was intentional — emotion expressed through transformation rather than color.' },
    { id: 'the-admiral', title: 'The Admiral', category: 'portraits', medium: 'Midjourney', description: 'An ornate figure weighed down by plumage and rank — authority rendered as armor, eyes heavy with the cost of command.', src: '/images/artworks/the-admiral.webp', aspect: 'square', year: 2025, sortOrder: 13, dominantColor: '#8b6b3a', rawPrompt: 'ornate military admiral portrait, excessive plumage and medals, Rembrandt lighting, Dutch Golden Age, heavy impasto texture, dark moody background --ar 1:1 --v 7 --style raw', mjVersion: null, refinementNotes: 'Dutch Golden Age military portrait pushed to absurdity. The plumage needed to feel oppressive. Rembrandt lighting makes the medals catch light like tiny suns.' },
    { id: 'the-intern', title: 'The Intern', category: 'portraits', medium: 'Midjourney', description: 'A child banded at the eyes, swallowed by a suit too large for any body — ambition fitted before the self has even formed.', src: '/images/artworks/the-intern.webp', aspect: 'tall', year: 2025, sortOrder: 14, dominantColor: '#5a5a6a', rawPrompt: 'child in oversized business suit, eyes obscured by black band, corporate portrait style, cold fluorescent lighting, shallow depth of field, uncomfortable formality --ar 3:4 --v 7 --style raw', mjVersion: null, refinementNotes: 'Corporate portrait language applied to childhood. The fluorescent lighting was deliberately unflattering — sterile and institutional.' },
    { id: 'the-keeper', title: 'The Keeper', category: 'portraits', medium: 'Midjourney', description: 'An elder wrapped in feathers and bark gazes upward — part woman, part forest, holding knowledge older than language.', src: '/images/artworks/the-keeper.webp', aspect: 'square', year: 2025, sortOrder: 15, dominantColor: '#6a8a5a', rawPrompt: 'elder woman wrapped in feathers and bark, looking upward, forest spirit, dappled natural light, earth tones, environmental portrait, organic textures --ar 1:1 --v 7 --style raw', mjVersion: null, refinementNotes: 'Environmental portrait where the environment becomes the subject. Dappled light through a forest canopy — the woman and the forest are the same thing.' },
    { id: 'old-soldier', title: 'Old Soldier', category: 'portraits', medium: 'Midjourney', description: 'A weathered face beneath a dented helmet, a crow perched close enough to whisper — war remembered in wrinkles and feathers.', src: '/images/artworks/old-soldier.webp', aspect: 'tall', year: 2025, sortOrder: 16, dominantColor: '#7a6a55', rawPrompt: 'weathered old soldier face, dented metal helmet, crow perched on shoulder, dramatic side lighting, heavy texture, oil painting, muted earth palette --ar 3:4 --v 7 --style raw', mjVersion: null, refinementNotes: 'The crow is the co-subject. Side lighting sculpts the wrinkles. Oil painting texture makes the metal helmet feel painted rather than photographed.' },
    { id: 'the-companion', title: 'The Companion', category: 'portraits', medium: 'Midjourney', description: "A young ape in a soldier's helmet meets the lens with quiet intelligence, a bird at its shoulder — kinship across species, rendered without irony.", src: '/images/artworks/the-companion.webp', aspect: 'square', year: 2025, sortOrder: 17, dominantColor: '#5c7a5a', rawPrompt: "young ape wearing soldier's helmet, small bird on shoulder, direct eye contact with camera, environmental portrait, soft natural light, painterly realism --ar 1:1 --v 7 --style raw", mjVersion: null, refinementNotes: 'The direct eye contact is everything. Painterly realism rather than photorealism — keeps it in the realm of art rather than nature photography.' },
    { id: 'metamorphosis', title: 'Metamorphosis', category: 'surreal', medium: 'Midjourney', description: 'Monarch butterflies erupt from cracked porcelain — a mind breaking open to release what it could never contain.', src: '/images/artworks/metamorphosis.webp', aspect: 'wide', year: 2025, sortOrder: 18, dominantColor: '#d4883a', rawPrompt: 'monarch butterflies erupting from a cracking porcelain head, fragments floating, warm golden light, high contrast, baroque drama, subsurface scattering on porcelain --ar 16:9 --v 7 --style raw', mjVersion: null, refinementNotes: 'The porcelain needed subsurface scattering to feel real, not plastic. Butterflies had to feel chaotic but compositionally directed toward the upper right.' },
    { id: 'the-pilgrim', title: 'The Pilgrim', category: 'surreal', medium: 'Midjourney', description: 'A faceless figure in flowing robes glides on roller skates — devotion in motion, sacred and absurd in equal measure.', src: '/images/artworks/the-pilgrim.webp', aspect: 'tall', year: 2025, sortOrder: 19, dominantColor: '#c8b89a', rawPrompt: 'faceless figure in flowing religious robes on roller skates, motion blur on robes, sacred and absurd, warm ambient lighting, long exposure feel --ar 3:4 --v 7 --style raw', mjVersion: null, refinementNotes: 'The absurdity is the point. Motion blur on the robes while the figure glides serenely. Warm lighting keeps it reverent despite the comedy.' },
    { id: 'the-crossing', title: 'The Crossing', category: 'landscapes', medium: 'Midjourney', description: 'Two small figures stand before a bridge that vanishes into towering clouds — the threshold between the known and the infinite.', src: '/images/artworks/the-crossing.webp', aspect: 'wide', year: 2025, sortOrder: 20, dominantColor: '#6a8aaa', rawPrompt: 'two tiny figures before a massive bridge disappearing into clouds, atmospheric perspective, god rays, epic scale, cool blue palette, Caspar David Friedrich --ar 16:9 --v 7 --style raw', mjVersion: null, refinementNotes: 'Scale is the emotion here. The figures must be tiny. Friedrich influence for the sublime — humans dwarfed by nature/architecture.' },
    { id: 'gorgons-cry', title: "Gorgon's Cry", category: 'abstract', medium: 'Midjourney', description: 'Stone tentacles writhe from a screaming face frozen mid-howl — rage petrified but never silenced.', src: '/images/artworks/gorgons-cry.webp', aspect: 'square', year: 2025, sortOrder: 21, dominantColor: '#7a8a7a', rawPrompt: 'stone tentacles writhing from a screaming medusa face, petrified rage, dramatic spotlight from above, heavy texture, marble and granite materials, sculptural --ar 1:1 --v 7 --style raw', mjVersion: null, refinementNotes: 'Sculptural rather than painterly. The material (stone, marble) is the constraint that makes the rage more powerful — frozen mid-expression.' },
    { id: 'red-sun-garden', title: 'Red Sun Garden', category: 'surreal', medium: 'Midjourney', description: 'A rusted sentinel looms over a garden of poppies and machines — tenderness persists in the wreckage of a forgotten world.', src: '/images/artworks/red-sun-garden.webp', aspect: 'wide', year: 2025, sortOrder: 22, dominantColor: '#c44a3a', rawPrompt: 'rusted robot sentinel in a garden of red poppies and broken machines, golden hour light, warm post-apocalyptic, Studio Ghibli influence, painterly, nostalgic atmosphere --ar 16:9 --v 7 --style raw', mjVersion: null, refinementNotes: 'Ghibli-style post-apocalyptic warmth. The poppies are the emotional core — nature reclaiming metal. Golden hour makes rust look beautiful.' },
    { id: 'signal-lost', title: 'Signal Lost', category: 'surreal', medium: 'Midjourney', description: 'A weathered creature with a television for a head sits alone, a dying city glowing behind its screen — broadcasting to no one.', src: '/images/artworks/signal-lost.webp', aspect: 'square', year: 2025, sortOrder: 23, dominantColor: '#4a6a7a', rawPrompt: 'weathered creature with vintage TV for head sitting alone, dying neon city reflected in screen, cool blue-green palette, lonely atmosphere, retro-futurism --ar 1:1 --v 7 --style raw', mjVersion: null, refinementNotes: 'Loneliness through technology. The TV static needed to feel like a dying signal. Cool palette reinforces isolation.' },
    { id: 'the-broadcast', title: 'The Broadcast', category: 'surreal', medium: 'Midjourney', description: 'A small figure perched on a vintage television peers into a swirling portal of debris and light — tuning into a frequency the world forgot.', src: '/images/artworks/the-broadcast.webp', aspect: 'square', year: 2025, sortOrder: 24, dominantColor: '#aa7a44', rawPrompt: 'small child figure perched on vintage television, swirling portal of golden debris and light, warm amber tones, nostalgic wonder, magical realism --ar 1:1 --v 7 --style raw', mjVersion: null, refinementNotes: 'Companion piece to Signal Lost — same TV motif, opposite emotion. Warm instead of cool, wonder instead of loneliness.' },
    { id: 'the-travelers', title: 'The Travelers', category: 'portraits', medium: 'Midjourney', description: 'Two figures rest against a worn trunk in golden half-light — intimacy painted in the language of old masters, reimagined by machine.', src: '/images/artworks/the-travelers.webp', aspect: 'square', year: 2025, sortOrder: 25, dominantColor: '#c4a055', rawPrompt: 'two weary travelers resting against a worn trunk, golden half-light, Caravaggio chiaroscuro, old master painting style, warm earth palette, intimate composition --ar 1:1 --v 7 --style raw', mjVersion: null, refinementNotes: 'Old master intimacy. The golden half-light is doing all the emotional work. Composition pulled from Caravaggio group scenes.' },
    { id: 'the-executive', title: 'The Executive', category: 'portraits', medium: 'Midjourney', description: 'A faceless child in a tailored suit — innocence erased by the machinery of expectation, eyes replaced by static.', src: '/images/artworks/the-executive.webp', aspect: 'tall', year: 2025, sortOrder: 26, dominantColor: '#4a4a5a', rawPrompt: 'faceless child in tailored business suit, eyes replaced by TV static, corporate portrait, cold studio lighting, unsettling formality, desaturated palette --ar 3:4 --v 7 --style raw', mjVersion: null, refinementNotes: 'Companion to The Intern. The TV static eyes escalate the theme. Studio lighting is deliberately corporate — headshot aesthetic applied to horror.' },
    { id: 'the-assembly', title: 'The Assembly', category: 'surreal', medium: 'Midjourney', description: 'Box-headed figures stand in formation before a towering machine — obedience manufactured at scale, individuality filed down to fit.', src: '/images/artworks/the-assembly.webp', aspect: 'square', year: 2025, sortOrder: 27, dominantColor: '#7a7a6a', rawPrompt: 'box-headed figures in formation before a massive industrial machine, dystopian, desaturated palette, forced perspective, theatrical spotlight, propaganda poster composition --ar 1:1 --v 7 --style raw', mjVersion: null, refinementNotes: 'Soviet propaganda poster composition filtered through surrealism. The box heads had to be uniform but each slightly different — mass production with imperfections.' },
    { id: 'city-vortex', title: 'City Vortex', category: 'surreal', medium: 'Midjourney', description: 'A skyline folds inward on itself, swallowed by a spiraling portal of cloud and concrete — civilization consumed by its own gravity.', src: '/images/artworks/city-vortex.webp', aspect: 'wide', year: 2025, sortOrder: 28, dominantColor: '#5a7a9a', rawPrompt: 'city skyline folding inward into a spiral vortex, clouds and concrete merging, Inception-style gravity distortion, cool blue atmosphere, dramatic wide angle, epic scale --ar 16:9 --v 7 --style raw', mjVersion: null, refinementNotes: 'Inception gravity distortion at city scale. Wide angle exaggerates the fold. Cool blue palette makes concrete feel like cloud material.' },
    { id: 'the-watchers', title: 'The Watchers', category: 'surreal', medium: 'Midjourney', description: 'Translucent creatures with impossible eyes perch in silence — fragile, curious beings on the edge of existence.', src: '/images/artworks/the-watchers.webp', aspect: 'wide', year: 2025, sortOrder: 29, dominantColor: '#6a9aaa', rawPrompt: 'translucent alien creatures with large luminous eyes perched on branches, bioluminescent, subsurface scattering, misty forest, cool blue-green palette, ethereal atmosphere --ar 16:9 --v 7 --style raw', mjVersion: null, refinementNotes: 'Spiritual sequel to The Hatchlings. Same subsurface scattering technique but these are older, wiser. The silence is the subject.' },
    { id: 'opening-night', title: 'Opening Night', category: 'surreal', medium: 'Midjourney', description: 'A wide-eyed girl clutches popcorn outside a glowing cinema — wonder preserved in animation, nostalgia rendered in pixels.', src: '/images/artworks/opening-night.webp', aspect: 'wide', year: 2025, sortOrder: 30, dominantColor: '#d4884a', rawPrompt: 'wide-eyed animated girl holding popcorn outside glowing neon cinema, Pixar-meets-Miyazaki style, warm golden and orange neon glow, nostalgic wonder, cinematic composition --ar 16:9 --v 7 --style raw', mjVersion: null, refinementNotes: 'Animation style intentional — the wonder of cinema depicted through cinema language. Neon warm glow bathes everything in nostalgic amber.' },
    { id: 'melting-mask', title: 'Melting Mask', category: 'abstract', medium: 'Midjourney', description: 'A porcelain face weeps iridescent streaks into black pooling nothing — sorrow rendered as liquid sculpture, beautiful and irreversible.', src: '/images/artworks/melting-mask.webp', aspect: 'square', year: 2025, sortOrder: 31, dominantColor: '#6a5a8a', rawPrompt: 'porcelain face melting with iridescent tears, chrome liquid dripping into black void, studio lighting with purple gels, holographic surface, macro detail --ar 1:1 --v 7 --style raw', mjVersion: null, refinementNotes: 'Companion to Chromatic Grief. Same iridescent material language, different form factor. The void beneath is total black — no surface, no floor.' },
    { id: 'smoke-and-bone', title: 'Smoke and Bone', category: 'abstract', medium: 'Midjourney', description: 'Teeth emerge from billowing clouds of smoke — the body made elemental, language dissolving before it forms.', src: '/images/artworks/smoke-and-bone.webp', aspect: 'square', year: 2025, sortOrder: 32, dominantColor: '#8a7a6a', rawPrompt: 'teeth and jaw emerging from billowing smoke clouds, anatomical study meets abstract expressionism, warm desaturated palette, dramatic overhead lighting --ar 1:1 --v 7 --style raw', mjVersion: null, refinementNotes: 'Medical illustration gone surreal. The smoke needed to feel like the body dissolving — not obscuring the teeth but becoming them.' },
    { id: 'cloud-atlas', title: 'Cloud Atlas', category: 'abstract', medium: 'Midjourney', description: 'A face fragments into sky and gold leaf — identity scattered across weather systems, memory pixelated into atmosphere.', src: '/images/artworks/cloud-atlas.webp', aspect: 'square', year: 2025, sortOrder: 33, dominantColor: '#5a7a9a', rawPrompt: 'face fragmenting into clouds and gold leaf particles, double exposure technique, blue sky merging with portrait, atmospheric scatter, Klimt gold accents --ar 1:1 --v 7 --style raw', mjVersion: null, refinementNotes: 'Double exposure technique — portrait dissolving into weather. Klimt gold leaf adds structure to what could be chaos. Identity as atmosphere.' },
    { id: 'ember-bloom', title: 'Ember Bloom', category: 'abstract', medium: 'Midjourney', description: 'An orange anemone unfurls against pure darkness — color so vivid it burns, petals like paper catching light before flame.', src: '/images/artworks/ember-bloom.webp', aspect: 'square', year: 2025, sortOrder: 34, dominantColor: '#d47a3a', rawPrompt: 'single orange anemone flower against pure black background, extreme macro, vivid color, paper-thin petals catching warm light, studio strobe, botanical photography --ar 1:1 --v 7 --style raw', mjVersion: null, refinementNotes: 'Pure botanical studio photography aesthetic. Single strobe, pure black background. The simplicity is the statement — one flower, one color, maximum impact.' },
    { id: 'twilight-bloom', title: 'Twilight Bloom', category: 'abstract', medium: 'Midjourney', description: 'Copper and silver petals catch the last light — a flower that exists only in the space between day and night.', src: '/images/artworks/twilight-bloom.webp', aspect: 'square', year: 2025, sortOrder: 35, dominantColor: '#7a6a5a', rawPrompt: 'metallic flower with copper and silver petals, caught in twilight, warm to cool gradient lighting, precious metal texture, botanical sculpture, liminal atmosphere --ar 1:1 --v 7 --style raw', mjVersion: null, refinementNotes: 'Companion to Ember Bloom — same botanical subject, different material. Metal petals catch light differently. The twilight gradient (warm to cool) is the entire mood.' },
    { id: 'the-procession', title: 'The Procession', category: 'surreal', medium: 'Midjourney', description: 'Stick figures hold hands in endless rows toward a burning light — obedience or devotion, the line between them erased by scale.', src: '/images/artworks/the-procession.webp', aspect: 'wide', year: 2025, sortOrder: 36, dominantColor: '#aa8a3a', rawPrompt: 'endless rows of simple stick figures holding hands walking toward a burning golden light, vanishing point composition, epic scale, warm amber atmosphere, ritualistic --ar 16:9 --v 7 --style raw', mjVersion: null, refinementNotes: 'Vanishing point composition is doing all the heavy lifting. The stick figure simplicity against epic scale creates the unsettling tension between devotion and obedience.' },
    { id: 'world-in-a-storm', title: 'World in a Storm', category: 'surreal', medium: 'Midjourney', description: 'A house clings to a floating sphere of lightning and debris — domesticity suspended in catastrophe, shelter in free fall.', src: '/images/artworks/world-in-a-storm.webp', aspect: 'square', year: 2025, sortOrder: 37, dominantColor: '#5a6a8a', rawPrompt: 'small house on a floating sphere of lightning and debris, stormy sky, cool blue-gray palette, surrealist miniature, dramatic volumetric clouds --ar 1:1 --v 7 --style raw', mjVersion: null, refinementNotes: 'Magritte miniature world concept. The house must look cozy while the sphere is violent. That contrast is everything.' },
    { id: 'sheltered-world', title: 'Sheltered World', category: 'surreal', medium: 'Midjourney', description: 'A village glows inside a glass orb on a wooden table — entire lives contained in something you could hold and drop.', src: '/images/artworks/sheltered-world.webp', aspect: 'square', year: 2025, sortOrder: 38, dominantColor: '#6a8aaa', rawPrompt: 'miniature glowing village inside a crystal orb on a wooden table, warm interior light, cold exterior, glass refraction, tilt-shift miniature effect, cozy and fragile --ar 1:1 --v 7 --style raw', mjVersion: null, refinementNotes: 'Tilt-shift effect makes it feel like a snow globe. The warm interior vs cold exterior is key. Glass refraction adds believability to the containment.' },
    { id: 'the-deep-one', title: 'The Deep One', category: 'surreal', medium: 'Midjourney', description: 'A furious fish creature screams into underwater light — the absurdity of rage given scales and teeth, comically monstrous.', src: '/images/artworks/the-deep-one.webp', aspect: 'wide', year: 2025, sortOrder: 39, dominantColor: '#5a7a8a', rawPrompt: 'furious anglerfish creature screaming into underwater light beam, bioluminescent, dramatic underwater caustics, absurd rage, comic horror, deep sea atmosphere --ar 16:9 --v 7 --style raw', mjVersion: null, refinementNotes: 'The absurdity is the point. Underwater caustics provide the dramatic lighting. The anger had to feel genuine even though the creature is ridiculous.' },
    { id: 'the-descent', title: 'The Descent', category: 'surreal', medium: 'Midjourney', description: 'A brass diving helmet faces a kraken in a burst of electric blue — the courage to go where pressure crushes everything familiar.', src: '/images/artworks/the-descent.webp', aspect: 'square', year: 2025, sortOrder: 40, dominantColor: '#3a7aaa', rawPrompt: 'vintage brass diving helmet facing a kraken, electric blue bioluminescence, deep ocean, dramatic underwater lighting, adventure pulp style, Jules Verne atmosphere --ar 1:1 --v 7 --style raw', mjVersion: null, refinementNotes: 'Jules Verne adventure aesthetic. The electric blue is the kraken energy against brass warmth. Pulp adventure composition — hero vs monster.' },
    { id: 'the-grinning', title: 'The Grinning', category: 'surreal', medium: 'Midjourney', description: 'A round-headed figure grins with buckteeth in pure black void — innocence and uncanniness collapsed into a single expression.', src: '/images/artworks/the-grinning.webp', aspect: 'square', year: 2025, sortOrder: 41, dominantColor: '#8a8a7a', rawPrompt: 'simple round-headed character with large bucktooth grin in pure black void, uncanny valley, naive art style, single spotlight, uncomfortable innocence --ar 1:1 --v 7 --style raw', mjVersion: null, refinementNotes: 'Simplicity pushed to discomfort. Naive art meets uncanny valley. Single spotlight — nothing else exists. The grin is friendly and terrifying.' },
  ]

  for (const artwork of artworkData) {
    await db.insert(artworks).values(artwork).onConflictDoUpdate({
      target: artworks.id,
      set: { ...artwork },
    })
  }
  console.log(`  ✓ ${artworkData.length} artworks seeded`)

  // ── Techniques ──────────────────────────────────────
  const techniqueData = [
    // Lighting
    { id: 'chiaroscuro', name: 'Chiaroscuro', category: 'lighting', description: 'High-contrast light and shadow technique from Renaissance painting. Creates dramatic depth and emotional intensity.' },
    { id: 'rembrandt-lighting', name: 'Rembrandt Lighting', category: 'lighting', description: 'Triangular light patch under the eye on the shadowed side. Classic portrait technique for dimensional drama.' },
    { id: 'volumetric-lighting', name: 'Volumetric Lighting', category: 'lighting', description: 'Visible light rays passing through atmosphere — god rays, fog beams. Adds depth and sacred quality.' },
    { id: 'golden-hour', name: 'Golden Hour', category: 'lighting', description: 'Warm, low-angle sunlight during the last hour before sunset. Bathes everything in amber warmth.' },
    { id: 'colored-gels', name: 'Colored Gels', category: 'lighting', description: 'Studio lighting filtered through colored gels. Creates vivid, unnatural color casts for emotional effect.' },
    { id: 'studio-strobe', name: 'Studio Strobe', category: 'lighting', description: 'Hard, clean studio flash lighting. Creates crisp detail and stark black backgrounds.' },
    { id: 'bioluminescence', name: 'Bioluminescence', category: 'lighting', description: 'Self-emitting organic light — creatures and materials that glow from within.' },
    { id: 'dramatic-spotlight', name: 'Dramatic Spotlight', category: 'lighting', description: 'Single focused beam isolating the subject from darkness. Theatrical and intense.' },
    { id: 'neon-glow', name: 'Neon Glow', category: 'lighting', description: 'Warm or cool neon tube lighting. Urban nostalgia and retro-futurist atmosphere.' },
    { id: 'underwater-caustics', name: 'Underwater Caustics', category: 'lighting', description: 'Light patterns created by water refraction on surfaces below. Rippling, organic light.' },
    { id: 'dappled-light', name: 'Dappled Light', category: 'lighting', description: 'Sunlight filtered through leaves creating spotted light-shadow patterns. Natural and organic.' },
    // Camera
    { id: 'macro-lens', name: 'Macro Lens', category: 'camera', description: 'Extreme close-up photography revealing detail invisible to the naked eye. Shallow depth of field.' },
    { id: 'shallow-dof', name: 'Shallow Depth of Field', category: 'camera', description: 'Narrow plane of focus with blurred background. Isolates subjects and creates dreamy quality.' },
    { id: 'anamorphic', name: 'Anamorphic Lens', category: 'camera', description: 'Wide-aspect cinematic lens with distinctive oval bokeh and horizontal lens flares.' },
    { id: 'wide-angle', name: 'Wide Angle', category: 'camera', description: 'Exaggerated perspective, dramatic distortion near edges. Makes spaces feel vast and subjects imposing.' },
    { id: 'forced-perspective', name: 'Forced Perspective', category: 'camera', description: 'Manipulating apparent size relationships between foreground and background subjects.' },
    { id: 'tilt-shift', name: 'Tilt-Shift', category: 'camera', description: 'Selective focus that makes real scenes look miniature. Dreamy, toy-like quality.' },
    { id: 'long-exposure', name: 'Long Exposure', category: 'camera', description: 'Extended shutter time creating motion blur. Flowing water, light trails, ghost-like movement.' },
    // Style
    { id: 'oil-painting', name: 'Oil Painting', category: 'style', description: 'Visible brushstrokes, rich impasto texture, layered color. The weight of centuries of art history.' },
    { id: 'baroque', name: 'Baroque Drama', category: 'style', description: 'Ornate, dramatic, emotionally charged. Heavy shadow, rich fabrics, theatrical composition.' },
    { id: 'dutch-golden-age', name: 'Dutch Golden Age', category: 'style', description: 'Rembrandt-era portraiture — dark backgrounds, rich warmth, human dignity elevated through light.' },
    { id: 'abstract-expressionism', name: 'Abstract Expressionism', category: 'style', description: 'Raw, gestural, emotionally direct. Pollock, de Kooning, Bacon — paint as primal scream.' },
    { id: 'painterly-realism', name: 'Painterly Realism', category: 'style', description: 'Realistic subjects rendered with visible brushwork. Sits between photography and painting.' },
    { id: 'naive-art', name: 'Naïve Art', category: 'style', description: 'Deliberately childlike simplicity and directness. Outsider art aesthetic — raw and unpolished.' },
    { id: 'retro-futurism', name: 'Retro-Futurism', category: 'style', description: 'Past visions of the future — vacuum tubes, analog technology, vintage science fiction.' },
    { id: 'animation-style', name: 'Animation Style', category: 'style', description: 'Pixar/Miyazaki-influenced rendering — expressive, warm, slightly stylized reality.' },
    { id: 'pulp-adventure', name: 'Pulp Adventure', category: 'style', description: 'Jules Verne, adventure serial aesthetic — bold, dramatic, heroic composition.' },
    { id: 'propaganda-poster', name: 'Propaganda Poster', category: 'style', description: 'Bold geometric composition, repetitive figures, institutional messaging aesthetic turned surreal.' },
    // Mood
    { id: 'vanitas', name: 'Vanitas', category: 'mood', description: 'Symbolism of mortality and impermanence. Beauty and decay coexisting in a single frame.' },
    { id: 'the-sublime', name: 'The Sublime', category: 'mood', description: 'Caspar David Friedrich awe — humans dwarfed by nature, beauty that terrifies and elevates.' },
    { id: 'uncanny-valley', name: 'Uncanny Valley', category: 'mood', description: 'Almost-familiar made disturbing. The gap between recognition and wrongness.' },
    { id: 'nostalgic-wonder', name: 'Nostalgic Wonder', category: 'mood', description: 'Childhood awe remembered through adult eyes — bittersweet, warm, tinged with loss.' },
    { id: 'magical-realism', name: 'Magical Realism', category: 'mood', description: 'Impossible things treated as ordinary. The surreal integrated seamlessly into the real.' },
    { id: 'comic-horror', name: 'Comic Horror', category: 'mood', description: 'Fear and absurdity combined — the ridiculous made genuinely unsettling.' },
    // Composition
    { id: 'vanishing-point', name: 'Vanishing Point', category: 'composition', description: 'All lines converge to a single focal point. Creates depth, drawing the eye inexorably forward.' },
    { id: 'atmospheric-perspective', name: 'Atmospheric Perspective', category: 'composition', description: 'Objects fade in contrast and saturation with distance, creating natural depth.' },
    { id: 'double-exposure', name: 'Double Exposure', category: 'composition', description: 'Two images superimposed — typically a portrait blending with a landscape or abstract element.' },
    { id: 'epic-scale', name: 'Epic Scale', category: 'composition', description: 'Tiny figures against massive structures or landscapes. Emphasizes insignificance and wonder.' },
    { id: 'renaissance-composition', name: 'Renaissance Composition', category: 'composition', description: 'Classical triangular arrangements, golden ratio, formal balance. The geometry of old masters.' },
    // Material
    { id: 'subsurface-scattering', name: 'Subsurface Scattering', category: 'material', description: 'Light passing through translucent materials like skin, wax, or organic tissue. Creates lifelike glow.' },
    { id: 'holographic-surface', name: 'Holographic/Iridescent', category: 'material', description: 'Materials that shift color with viewing angle — chrome, oil-slick, holographic film.' },
    { id: 'porcelain', name: 'Porcelain/Ceramic', category: 'material', description: 'Smooth, delicate, breakable material. Implies fragility and preciousness.' },
    { id: 'gold-leaf', name: 'Gold Leaf', category: 'material', description: 'Klimt-inspired metallic gold applied to surfaces. Sacred, precious, decorative.' },
    { id: 'weathered-metal', name: 'Weathered Metal', category: 'material', description: 'Rust, patina, aged brass — materials that carry the weight of time.' },
    // Color
    { id: 'warm-earth-palette', name: 'Warm Earth Palette', category: 'color', description: 'Ochres, umbers, burnt sienna — the color language of old masters and desert landscapes.' },
    { id: 'cool-desaturated', name: 'Cool Desaturated', category: 'color', description: 'Muted blues and grays with reduced saturation. Creates clinical, distant, or melancholic mood.' },
    { id: 'high-saturation', name: 'High Saturation', category: 'color', description: 'Colors pushed to maximum intensity. Emotionally overwhelming, impossible to ignore.' },
    { id: 'warm-cool-contrast', name: 'Warm/Cool Contrast', category: 'color', description: 'Amber warm tones opposed by cool blue shadows. Creates visual tension and depth.' },
    // Post-processing
    { id: 'motion-blur', name: 'Motion Blur', category: 'post', description: 'Directional blur from movement — suggests speed, impermanence, the passage of time.' },
    { id: 'heavy-texture', name: 'Heavy Texture', category: 'post', description: 'Pronounced surface texture — canvas grain, impasto, visible material quality.' },
    { id: 'glass-refraction', name: 'Glass Refraction', category: 'post', description: 'Light bending through transparent curved surfaces. Distortion as beauty.' },
  ]

  for (const technique of techniqueData) {
    await db.insert(techniques).values(technique).onConflictDoUpdate({
      target: techniques.id,
      set: { ...technique },
    })
  }
  console.log(`  ✓ ${techniqueData.length} techniques seeded`)

  // ── Artwork <-> Technique mappings ──────────────────
  await db.delete(artworkTechniques)

  const mappings: Array<{ artworkId: string; techniqueId: string }> = [
    ...expand('the-watcher', ['chiaroscuro', 'volumetric-lighting', 'macro-lens', 'bioluminescence', 'subsurface-scattering']),
    ...expand('bloom-of-decay', ['baroque', 'vanitas', 'volumetric-lighting', 'warm-earth-palette', 'oil-painting']),
    ...expand('the-nobleman', ['rembrandt-lighting', 'dutch-golden-age', 'oil-painting', 'renaissance-composition', 'warm-earth-palette', 'heavy-texture']),
    ...expand('peeling-away', ['shallow-dof', 'painterly-realism', 'warm-earth-palette', 'heavy-texture']),
    ...expand('primal-scream', ['abstract-expressionism', 'high-saturation', 'heavy-texture']),
    ...expand('chromatic-grief', ['colored-gels', 'macro-lens', 'holographic-surface', 'studio-strobe']),
    ...expand('the-gathering', ['volumetric-lighting', 'golden-hour', 'the-sublime', 'atmospheric-perspective', 'epic-scale']),
    ...expand('first-light', ['anamorphic', 'golden-hour', 'the-sublime', 'epic-scale']),
    ...expand('the-hatchlings', ['macro-lens', 'shallow-dof', 'bioluminescence', 'subsurface-scattering', 'dappled-light']),
    ...expand('first-encounter', ['shallow-dof', 'warm-cool-contrast', 'nostalgic-wonder', 'magical-realism']),
    ...expand('the-offering', ['chiaroscuro', 'dramatic-spotlight', 'baroque', 'oil-painting', 'renaissance-composition']),
    ...expand('the-weight', ['gold-leaf', 'warm-earth-palette', 'painterly-realism', 'heavy-texture']),
    ...expand('unspoken', ['cool-desaturated', 'painterly-realism', 'magical-realism']),
    ...expand('the-admiral', ['rembrandt-lighting', 'dutch-golden-age', 'oil-painting', 'heavy-texture', 'warm-earth-palette']),
    ...expand('the-intern', ['cool-desaturated', 'shallow-dof', 'uncanny-valley']),
    ...expand('the-keeper', ['dappled-light', 'painterly-realism', 'warm-earth-palette']),
    ...expand('old-soldier', ['dramatic-spotlight', 'oil-painting', 'warm-earth-palette', 'heavy-texture']),
    ...expand('the-companion', ['painterly-realism', 'dappled-light', 'shallow-dof']),
    ...expand('metamorphosis', ['baroque', 'subsurface-scattering', 'porcelain', 'golden-hour', 'high-saturation']),
    ...expand('the-pilgrim', ['motion-blur', 'magical-realism', 'warm-earth-palette', 'long-exposure']),
    ...expand('the-crossing', ['volumetric-lighting', 'atmospheric-perspective', 'the-sublime', 'epic-scale', 'cool-desaturated']),
    ...expand('gorgons-cry', ['dramatic-spotlight', 'porcelain', 'heavy-texture']),
    ...expand('red-sun-garden', ['golden-hour', 'weathered-metal', 'animation-style', 'nostalgic-wonder', 'warm-cool-contrast']),
    ...expand('signal-lost', ['neon-glow', 'retro-futurism', 'cool-desaturated']),
    ...expand('the-broadcast', ['neon-glow', 'nostalgic-wonder', 'magical-realism', 'warm-earth-palette']),
    ...expand('the-travelers', ['chiaroscuro', 'golden-hour', 'oil-painting', 'renaissance-composition', 'warm-earth-palette']),
    ...expand('the-executive', ['cool-desaturated', 'studio-strobe', 'uncanny-valley']),
    ...expand('the-assembly', ['forced-perspective', 'propaganda-poster', 'dramatic-spotlight', 'cool-desaturated']),
    ...expand('city-vortex', ['wide-angle', 'atmospheric-perspective', 'epic-scale', 'cool-desaturated']),
    ...expand('the-watchers', ['bioluminescence', 'subsurface-scattering', 'atmospheric-perspective', 'cool-desaturated']),
    ...expand('opening-night', ['animation-style', 'neon-glow', 'nostalgic-wonder', 'warm-earth-palette']),
    ...expand('melting-mask', ['colored-gels', 'holographic-surface', 'macro-lens', 'studio-strobe']),
    ...expand('smoke-and-bone', ['dramatic-spotlight', 'abstract-expressionism', 'warm-earth-palette', 'heavy-texture']),
    ...expand('cloud-atlas', ['double-exposure', 'gold-leaf', 'atmospheric-perspective', 'cool-desaturated']),
    ...expand('ember-bloom', ['macro-lens', 'studio-strobe', 'high-saturation', 'warm-earth-palette']),
    ...expand('twilight-bloom', ['weathered-metal', 'warm-cool-contrast', 'studio-strobe', 'macro-lens']),
    ...expand('the-procession', ['vanishing-point', 'golden-hour', 'epic-scale', 'warm-earth-palette']),
    ...expand('world-in-a-storm', ['volumetric-lighting', 'cool-desaturated', 'magical-realism']),
    ...expand('sheltered-world', ['tilt-shift', 'glass-refraction', 'warm-cool-contrast', 'nostalgic-wonder']),
    ...expand('the-deep-one', ['underwater-caustics', 'bioluminescence', 'comic-horror', 'wide-angle']),
    ...expand('the-descent', ['bioluminescence', 'underwater-caustics', 'pulp-adventure', 'weathered-metal', 'warm-cool-contrast']),
    ...expand('the-grinning', ['dramatic-spotlight', 'naive-art', 'uncanny-valley']),
  ]

  for (const mapping of mappings) {
    await db.insert(artworkTechniques).values(mapping)
  }
  console.log(`  ✓ ${mappings.length} artwork-technique mappings seeded`)

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
