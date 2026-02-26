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
    { id: 'veiled-gaze', title: 'Veiled Gaze', category: 'portraits', medium: 'Midjourney', description: 'A young face emerges through layers of translucent distortion — identity obscured by the very medium that reveals it.', src: '/images/artworks/veiled-gaze.webp', aspect: 'square', year: 2025, sortOrder: 0, dominantColor: '#9a8a7a', rawPrompt: null, mjVersion: null, refinementNotes: null },
    { id: 'the-unraveling', title: 'The Unraveling', category: 'portraits', medium: 'Midjourney', description: 'Skin splits like aged canvas, revealing gold beneath — beauty and decay locked in the same breath.', src: '/images/artworks/the-unraveling.webp', aspect: 'square', year: 2025, sortOrder: 1, dominantColor: '#b8a890', rawPrompt: null, mjVersion: null, refinementNotes: null },
    { id: 'through-glass', title: 'Through Glass', category: 'portraits', medium: 'Midjourney', description: 'A face pressed against frosted glass, features softened into memory — the distance between seeing and knowing.', src: '/images/artworks/through-glass.webp', aspect: 'square', year: 2025, sortOrder: 2, dominantColor: '#6a7a8a', rawPrompt: null, mjVersion: null, refinementNotes: null },
    { id: 'the-other-side', title: 'The Other Side', category: 'portraits', medium: 'Midjourney', description: 'A mirror image shifted slightly wrong — familiar features rearranged into something just beyond recognition.', src: '/images/artworks/the-other-side.webp', aspect: 'square', year: 2025, sortOrder: 3, dominantColor: '#7a8a9a', rawPrompt: null, mjVersion: null, refinementNotes: null },
    { id: 'beneath-the-surface', title: 'Beneath the Surface', category: 'abstract', medium: 'Midjourney', description: 'A nose, an eye socket — features surfacing through cracked plaster like archaeology of the self.', src: '/images/artworks/beneath-the-surface.webp', aspect: 'square', year: 2025, sortOrder: 4, dominantColor: '#7a8a8a', rawPrompt: null, mjVersion: null, refinementNotes: null },
    { id: 'half-remembered', title: 'Half-Remembered', category: 'portraits', medium: 'Midjourney', description: 'A face dissolving into texture and shadow — the way we recall people who have left us.', src: '/images/artworks/half-remembered.webp', aspect: 'square', year: 2025, sortOrder: 5, dominantColor: '#8a9aaa', rawPrompt: null, mjVersion: null, refinementNotes: null },
    { id: 'erosion', title: 'Erosion', category: 'portraits', medium: 'Midjourney', description: 'Plaster cracks across a human form — time written on skin, identity crumbling at the edges.', src: '/images/artworks/erosion.webp', aspect: 'square', year: 2025, sortOrder: 6, dominantColor: '#9a9a9a', rawPrompt: null, mjVersion: null, refinementNotes: null },
    { id: 'gilt-veil', title: 'Gilt Veil', category: 'portraits', medium: 'Midjourney', description: 'Gold light filters through a translucent barrier, warming the face behind it — beauty seen through the lens of reverence.', src: '/images/artworks/gilt-veil.webp', aspect: 'square', year: 2025, sortOrder: 7, dominantColor: '#c4a060', rawPrompt: null, mjVersion: null, refinementNotes: null },
    { id: 'the-elder', title: 'The Elder', category: 'portraits', medium: 'Midjourney', description: 'A bald figure materializes from golden fog — wisdom emerging from the formless, age rendered as light.', src: '/images/artworks/the-elder.webp', aspect: 'square', year: 2025, sortOrder: 8, dominantColor: '#b8a060', rawPrompt: null, mjVersion: null, refinementNotes: null },
    { id: 'the-patriarch', title: 'The Patriarch', category: 'portraits', medium: 'Midjourney', description: 'A bearded face behind amber glass, oil-paint texture dissolving features — history remembered through the grain of canvas.', src: '/images/artworks/the-patriarch.webp', aspect: 'square', year: 2025, sortOrder: 9, dominantColor: '#c4a050', rawPrompt: null, mjVersion: null, refinementNotes: null },
    { id: 'the-youth', title: 'The Youth', category: 'portraits', medium: 'Midjourney', description: 'Curls catch warm light through a veil of distortion — innocence preserved in the space between clarity and dream.', src: '/images/artworks/the-youth.webp', aspect: 'square', year: 2025, sortOrder: 10, dominantColor: '#b89a60', rawPrompt: null, mjVersion: null, refinementNotes: null },
    { id: 'the-vanishing', title: 'The Vanishing', category: 'portraits', medium: 'Midjourney', description: 'A figure barely visible through cool blue haze — presence fading into atmosphere, a person becoming weather.', src: '/images/artworks/the-vanishing.webp', aspect: 'square', year: 2025, sortOrder: 11, dominantColor: '#7a8a8a', rawPrompt: null, mjVersion: null, refinementNotes: null },
    { id: 'signal-fade', title: 'Signal Fade', category: 'abstract', medium: 'Midjourney', description: 'A face caught in transmission — streaks of data and paint dissolving identity into pure frequency.', src: '/images/artworks/signal-fade.webp', aspect: 'square', year: 2025, sortOrder: 12, dominantColor: '#6a7a8a', rawPrompt: null, mjVersion: null, refinementNotes: null },
    { id: 'bloom-and-bone', title: 'Bloom and Bone', category: 'portraits', medium: 'Midjourney', description: 'A ghost face half-hidden behind a white tulip — the boundary between the living and the floral.', src: '/images/artworks/bloom-and-bone.webp', aspect: 'square', year: 2025, sortOrder: 13, dominantColor: '#8a9aaa', rawPrompt: null, mjVersion: null, refinementNotes: null },
    { id: 'impasto-man', title: 'Impasto Man', category: 'portraits', medium: 'Midjourney', description: 'A face built from thick brushstrokes of blue and flesh — the subject indistinguishable from the paint that made him.', src: '/images/artworks/impasto-man.webp', aspect: 'square', year: 2025, sortOrder: 14, dominantColor: '#7a8a9a', rawPrompt: null, mjVersion: null, refinementNotes: null },
    { id: 'silk-valley', title: 'Silk Valley', category: 'landscapes', medium: 'Midjourney', description: 'Trees flow like liquid metal beneath clouds of brushed silk — a valley that exists only in the space between waking and sleep.', src: '/images/artworks/silk-valley.webp', aspect: 'wide', year: 2025, sortOrder: 15, dominantColor: '#6a7a6a', rawPrompt: null, mjVersion: null, refinementNotes: null },
    { id: 'the-grove', title: 'The Grove', category: 'landscapes', medium: 'Midjourney', description: 'Swirling, storm-blown trees dance in a landscape of pure gesture — nature distilled into movement.', src: '/images/artworks/the-grove.webp', aspect: 'wide', year: 2025, sortOrder: 16, dominantColor: '#6a7a6a', rawPrompt: null, mjVersion: null, refinementNotes: null },
    { id: 'mountain-veil', title: 'Mountain Veil', category: 'landscapes', medium: 'Midjourney', description: 'Silk-draped mountains rise behind golden trees — earth wrapped in atmosphere like fabric, soft and impossibly distant.', src: '/images/artworks/mountain-veil.webp', aspect: 'wide', year: 2025, sortOrder: 17, dominantColor: '#7a8a9a', rawPrompt: null, mjVersion: null, refinementNotes: null },
    { id: 'wind-song', title: 'Wind Song', category: 'landscapes', medium: 'Midjourney', description: 'Trees with canopies of billowing cloud catch golden light on rolling terrain — sound made visible.', src: '/images/artworks/wind-song.webp', aspect: 'wide', year: 2025, sortOrder: 18, dominantColor: '#7a8a7a', rawPrompt: null, mjVersion: null, refinementNotes: null },
    { id: 'the-wanderer', title: 'The Wanderer', category: 'landscapes', medium: 'Midjourney', description: 'A figure barely visible on a stormy path through swirling painterly trees — solitude given landscape.', src: '/images/artworks/the-wanderer.webp', aspect: 'wide', year: 2025, sortOrder: 19, dominantColor: '#6a7a6a', rawPrompt: null, mjVersion: null, refinementNotes: null },
    { id: 'blue-architecture', title: 'Blue Architecture', category: 'abstract', medium: 'Midjourney', description: 'Glowing geometric blocks float on still water — structure emerging from and dissolving into the deep blue void.', src: '/images/artworks/blue-architecture.webp', aspect: 'square', year: 2025, sortOrder: 20, dominantColor: '#2a4a8a', rawPrompt: null, mjVersion: null, refinementNotes: null },
    { id: 'luminous-grove', title: 'Luminous Grove', category: 'surreal', medium: 'Midjourney', description: 'Trees with glowing shell-like canopies illuminate a dark forest — nature reimagined as bioluminescent architecture.', src: '/images/artworks/luminous-grove.webp', aspect: 'wide', year: 2025, sortOrder: 21, dominantColor: '#8a7a4a', rawPrompt: null, mjVersion: null, refinementNotes: null },
    { id: 'twisted-sentinels', title: 'Twisted Sentinels', category: 'surreal', medium: 'Midjourney', description: 'Gnarly trees with serpentine trunks line a stone cliff, golden light catching their impossible curves — guardians of a world that follows different rules.', src: '/images/artworks/twisted-sentinels.webp', aspect: 'wide', year: 2025, sortOrder: 22, dominantColor: '#8a7a4a', rawPrompt: null, mjVersion: null, refinementNotes: null },
    { id: 'the-canopy', title: 'The Canopy', category: 'abstract', medium: 'Midjourney', description: "Twisted branches frame a cathedral of filtered light — nature's architecture rendered in impossible amber and teal.", src: '/images/artworks/the-canopy.webp', aspect: 'wide', year: 2025, sortOrder: 23, dominantColor: '#5a7a8a', rawPrompt: null, mjVersion: null, refinementNotes: null },
    { id: 'red-shift', title: 'Red Shift', category: 'surreal', medium: 'Midjourney', description: 'A crimson motorcycle tears through neon streets, rider leaning into impossible speed — velocity rendered as light trails and adrenaline.', src: '/images/artworks/red-shift.webp', aspect: 'wide', year: 2025, sortOrder: 24, dominantColor: '#c43030', rawPrompt: null, mjVersion: null, refinementNotes: null },
    { id: 'night-patrol', title: 'Night Patrol', category: 'surreal', medium: 'Midjourney', description: 'Helmeted riders crowd a dark alley between towering buildings — urban tension compressed into a single frame.', src: '/images/artworks/night-patrol.webp', aspect: 'square', year: 2025, sortOrder: 25, dominantColor: '#2a3a6a', rawPrompt: null, mjVersion: null, refinementNotes: null },
    { id: 'the-infiltrator', title: 'The Infiltrator', category: 'surreal', medium: 'Midjourney', description: 'A black-suited figure moves through industrial corridors, weapon drawn — paranoia and purpose given form.', src: '/images/artworks/the-infiltrator.webp', aspect: 'square', year: 2025, sortOrder: 26, dominantColor: '#4a4a4a', rawPrompt: null, mjVersion: null, refinementNotes: null },
    { id: 'the-operator', title: 'The Operator', category: 'surreal', medium: 'Midjourney', description: 'A small figure hunches before a wall of glowing screens in darkness — the weight of omniscience, the loneliness of control.', src: '/images/artworks/the-operator.webp', aspect: 'square', year: 2025, sortOrder: 27, dominantColor: '#2a3a5a', rawPrompt: null, mjVersion: null, refinementNotes: null },
    { id: 'the-submersible', title: 'The Submersible', category: 'surreal', medium: 'Midjourney', description: 'A spherical fish-shaped vessel with a tiny pilot peering out — wonder compressed into a machine, adventure made adorable.', src: '/images/artworks/the-submersible.webp', aspect: 'square', year: 2025, sortOrder: 28, dominantColor: '#d4a040', rawPrompt: null, mjVersion: null, refinementNotes: null },
    { id: 'the-scouts', title: 'The Scouts', category: 'surreal', medium: 'Midjourney', description: 'A bug-eyed yellow vehicle and its tiny green companion survey the clouds from a cliff edge — exploration at the scale of toys.', src: '/images/artworks/the-scouts.webp', aspect: 'wide', year: 2025, sortOrder: 29, dominantColor: '#c4a040', rawPrompt: null, mjVersion: null, refinementNotes: null },
    { id: 'city-of-lights', title: 'City of Lights', category: 'surreal', medium: 'Midjourney', description: 'A small figure stands atop a building overlooking a vast illuminated metropolis at twilight — the city as organism, witnessed from above.', src: '/images/artworks/city-of-lights.webp', aspect: 'wide', year: 2025, sortOrder: 30, dominantColor: '#4a5a7a', rawPrompt: null, mjVersion: null, refinementNotes: null },
    { id: 'the-threshold', title: 'The Threshold', category: 'landscapes', medium: 'Midjourney', description: 'A solitary figure stands between massive stone monoliths at sunset — the doorway between worlds measured in human scale.', src: '/images/artworks/the-threshold.webp', aspect: 'wide', year: 2025, sortOrder: 31, dominantColor: '#b87a40', rawPrompt: null, mjVersion: null, refinementNotes: null },
    { id: 'golden-passage', title: 'Golden Passage', category: 'landscapes', medium: 'Midjourney', description: 'Stone pillars frame a wanderer walking toward golden light — pilgrimage rendered in the language of cinema.', src: '/images/artworks/golden-passage.webp', aspect: 'wide', year: 2025, sortOrder: 32, dominantColor: '#c48a40', rawPrompt: null, mjVersion: null, refinementNotes: null },
    { id: 'desert-cathedral', title: 'Desert Cathedral', category: 'landscapes', medium: 'Midjourney', description: 'Concrete ruins form a cathedral in the desert, a lone figure dwarfed by abandoned architecture — devotion outlasting its builders.', src: '/images/artworks/desert-cathedral.webp', aspect: 'wide', year: 2025, sortOrder: 33, dominantColor: '#c48a40', rawPrompt: null, mjVersion: null, refinementNotes: null },
    { id: 'the-departure', title: 'The Departure', category: 'landscapes', medium: 'Midjourney', description: 'A figure walks toward the sun between impossible columns — leaving everything behind, illuminated by what lies ahead.', src: '/images/artworks/the-departure.webp', aspect: 'wide', year: 2025, sortOrder: 34, dominantColor: '#b88a50', rawPrompt: null, mjVersion: null, refinementNotes: null },
    { id: 'the-deep', title: 'The Deep', category: 'surreal', medium: 'Midjourney', description: 'A figure stands beneath a massive organic cavern of teal and shadow — the alien rendered as architecture, scale as terror.', src: '/images/artworks/the-deep.webp', aspect: 'wide', year: 2025, sortOrder: 35, dominantColor: '#2a5a5a', rawPrompt: null, mjVersion: null, refinementNotes: null },
    { id: 'bioluminescence', title: 'Bioluminescence', category: 'surreal', medium: 'Midjourney', description: 'An underwater world glows with scattered lights as a tiny explorer walks its floor — the ocean reimagined as cathedral.', src: '/images/artworks/bioluminescence.webp', aspect: 'wide', year: 2025, sortOrder: 36, dominantColor: '#2a5a5a', rawPrompt: null, mjVersion: null, refinementNotes: null },
    { id: 'leviathan', title: 'Leviathan', category: 'surreal', medium: 'Midjourney', description: 'A diver with a single light encounters the mouth of something vast and dark — the sublime terror of being small in an enormous world.', src: '/images/artworks/leviathan.webp', aspect: 'wide', year: 2025, sortOrder: 37, dominantColor: '#2a4a5a', rawPrompt: null, mjVersion: null, refinementNotes: null },
    { id: 'the-wreckage', title: 'The Wreckage', category: 'landscapes', medium: 'Midjourney', description: 'Industrial bones collapse against a setting sun as a lone figure witnesses — the end of the machine age, seen by its last citizen.', src: '/images/artworks/the-wreckage.webp', aspect: 'wide', year: 2025, sortOrder: 38, dominantColor: '#b88a40', rawPrompt: null, mjVersion: null, refinementNotes: null },
    { id: 'the-procession', title: 'The Procession', category: 'landscapes', medium: 'Midjourney', description: 'Robed figures walk in golden dust past ancient columns — pilgrimage as old as stone, captured in amber light.', src: '/images/artworks/the-procession.webp', aspect: 'wide', year: 2025, sortOrder: 39, dominantColor: '#c49a50', rawPrompt: null, mjVersion: null, refinementNotes: null },
    { id: 'the-colonnade', title: 'The Colonnade', category: 'landscapes', medium: 'Midjourney', description: 'Cloaked figures gather among towering pillars at sunset — ancient rituals played out at the scale of myth.', src: '/images/artworks/the-colonnade.webp', aspect: 'wide', year: 2025, sortOrder: 40, dominantColor: '#b88a50', rawPrompt: null, mjVersion: null, refinementNotes: null },
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
    // Portraits — ethereal distortion
    ...expand('veiled-gaze', ['shallow-dof', 'painterly-realism', 'warm-earth-palette', 'subsurface-scattering']),
    ...expand('the-unraveling', ['gold-leaf', 'warm-earth-palette', 'heavy-texture', 'oil-painting', 'vanitas']),
    ...expand('through-glass', ['glass-refraction', 'cool-desaturated', 'shallow-dof']),
    ...expand('the-other-side', ['cool-desaturated', 'shallow-dof', 'uncanny-valley']),
    ...expand('half-remembered', ['atmospheric-perspective', 'cool-desaturated', 'painterly-realism', 'motion-blur']),
    ...expand('erosion', ['heavy-texture', 'porcelain', 'warm-earth-palette', 'vanitas']),
    ...expand('gilt-veil', ['gold-leaf', 'rembrandt-lighting', 'warm-earth-palette', 'subsurface-scattering']),
    ...expand('the-elder', ['golden-hour', 'atmospheric-perspective', 'warm-earth-palette', 'painterly-realism']),
    ...expand('the-patriarch', ['oil-painting', 'rembrandt-lighting', 'warm-earth-palette', 'heavy-texture', 'dutch-golden-age']),
    ...expand('the-youth', ['shallow-dof', 'warm-earth-palette', 'painterly-realism', 'subsurface-scattering']),
    ...expand('the-vanishing', ['atmospheric-perspective', 'cool-desaturated', 'motion-blur']),
    ...expand('bloom-and-bone', ['shallow-dof', 'cool-desaturated', 'painterly-realism', 'vanitas']),
    ...expand('impasto-man', ['heavy-texture', 'oil-painting', 'abstract-expressionism']),
    // Abstract
    ...expand('beneath-the-surface', ['heavy-texture', 'porcelain', 'cool-desaturated']),
    ...expand('signal-fade', ['motion-blur', 'cool-desaturated', 'abstract-expressionism']),
    ...expand('blue-architecture', ['cool-desaturated', 'epic-scale', 'atmospheric-perspective']),
    ...expand('the-canopy', ['dappled-light', 'warm-cool-contrast', 'atmospheric-perspective']),
    // Landscapes — dreamscapes
    ...expand('silk-valley', ['painterly-realism', 'atmospheric-perspective', 'warm-earth-palette', 'heavy-texture']),
    ...expand('the-grove', ['abstract-expressionism', 'heavy-texture', 'warm-earth-palette', 'motion-blur']),
    ...expand('mountain-veil', ['atmospheric-perspective', 'the-sublime', 'cool-desaturated', 'painterly-realism']),
    ...expand('wind-song', ['golden-hour', 'painterly-realism', 'atmospheric-perspective', 'warm-earth-palette']),
    ...expand('the-wanderer', ['the-sublime', 'atmospheric-perspective', 'painterly-realism', 'warm-earth-palette']),
    // Landscapes — cinematic monoliths
    ...expand('the-threshold', ['golden-hour', 'epic-scale', 'the-sublime', 'warm-earth-palette', 'volumetric-lighting']),
    ...expand('golden-passage', ['volumetric-lighting', 'golden-hour', 'epic-scale', 'warm-earth-palette', 'vanishing-point']),
    ...expand('desert-cathedral', ['epic-scale', 'the-sublime', 'warm-earth-palette', 'atmospheric-perspective']),
    ...expand('the-departure', ['golden-hour', 'epic-scale', 'volumetric-lighting', 'the-sublime', 'vanishing-point']),
    ...expand('the-wreckage', ['golden-hour', 'weathered-metal', 'epic-scale', 'warm-earth-palette']),
    ...expand('the-procession', ['golden-hour', 'atmospheric-perspective', 'warm-earth-palette', 'epic-scale']),
    ...expand('the-colonnade', ['golden-hour', 'epic-scale', 'atmospheric-perspective', 'warm-earth-palette', 'the-sublime']),
    // Surreal — impossible nature
    ...expand('luminous-grove', ['bioluminescence', 'dappled-light', 'warm-earth-palette', 'magical-realism']),
    ...expand('twisted-sentinels', ['golden-hour', 'painterly-realism', 'warm-earth-palette', 'magical-realism']),
    // Surreal — cyberpunk
    ...expand('red-shift', ['motion-blur', 'neon-glow', 'high-saturation', 'retro-futurism', 'long-exposure']),
    ...expand('night-patrol', ['neon-glow', 'cool-desaturated', 'forced-perspective']),
    ...expand('the-infiltrator', ['cool-desaturated', 'dramatic-spotlight', 'forced-perspective']),
    ...expand('the-operator', ['neon-glow', 'cool-desaturated', 'dramatic-spotlight']),
    // Surreal — whimsical machines
    ...expand('the-submersible', ['animation-style', 'nostalgic-wonder', 'warm-earth-palette']),
    ...expand('the-scouts', ['animation-style', 'nostalgic-wonder', 'warm-earth-palette', 'epic-scale']),
    ...expand('city-of-lights', ['neon-glow', 'atmospheric-perspective', 'epic-scale', 'cool-desaturated']),
    // Surreal — the abyss
    ...expand('the-deep', ['bioluminescence', 'epic-scale', 'underwater-caustics', 'cool-desaturated', 'the-sublime']),
    ...expand('bioluminescence', ['bioluminescence', 'underwater-caustics', 'epic-scale', 'cool-desaturated']),
    ...expand('leviathan', ['bioluminescence', 'underwater-caustics', 'epic-scale', 'the-sublime', 'dramatic-spotlight']),
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
