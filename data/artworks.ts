export interface Artwork {
  id: string
  title: string
  category: 'portraits' | 'landscapes' | 'abstract' | 'surreal'
  medium: string
  description: string
  src: string
  aspect: 'tall' | 'wide' | 'square'
  year: number
}

export const categories = [
  { id: 'all', label: 'All' },
  { id: 'portraits', label: 'Portraits' },
  { id: 'landscapes', label: 'Landscapes' },
  { id: 'abstract', label: 'Abstract' },
  { id: 'surreal', label: 'Surreal' },
] as const

export const artworks: Artwork[] = [
  {
    id: 'the-watcher',
    title: 'The Watcher',
    category: 'surreal',
    medium: 'Midjourney',
    description: 'A sentient eye erupts from organic matter, crowned with lightning — the boundary between seeing and being seen dissolves.',
    src: '/images/artworks/the-watcher.webp',
    aspect: 'square',
    year: 2025,
  },
  {
    id: 'bloom-of-decay',
    title: 'Bloom of Decay',
    category: 'surreal',
    medium: 'Midjourney',
    description: 'Flowers emerge from a gaping maw of stone and teeth — beauty and destruction entangled in a single breath.',
    src: '/images/artworks/bloom-of-decay.webp',
    aspect: 'wide',
    year: 2025,
  },
  {
    id: 'primal-scream',
    title: 'Primal Scream',
    category: 'abstract',
    medium: 'Midjourney',
    description: 'Raw, unfiltered rage rendered in vivid color — the animal within us all, unleashed.',
    src: '/images/artworks/primal-scream.webp',
    aspect: 'square',
    year: 2025,
  },
  {
    id: 'chromatic-grief',
    title: 'Chromatic Grief',
    category: 'abstract',
    medium: 'Midjourney',
    description: 'A melting mask of iridescent sorrow — emotion given physical form, dripping with the weight of feeling.',
    src: '/images/artworks/chromatic-grief.webp',
    aspect: 'square',
    year: 2025,
  },
  {
    id: 'the-gathering',
    title: 'The Gathering',
    category: 'landscapes',
    medium: 'Midjourney',
    description: 'Faceless figures converge toward an impossible light — the quiet pull of collective human experience.',
    src: '/images/artworks/the-gathering.webp',
    aspect: 'wide',
    year: 2025,
  },
  {
    id: 'unspoken',
    title: 'Unspoken',
    category: 'portraits',
    medium: 'Midjourney',
    description: 'Words become clouds, teeth become architecture — what we cannot say takes on a life of its own.',
    src: '/images/artworks/unspoken.webp',
    aspect: 'square',
    year: 2025,
  },
  {
    id: 'peeling-away',
    title: 'Peeling Away',
    category: 'portraits',
    medium: 'Midjourney',
    description: 'A face unravels in quiet surrender — the masks we wear peeling back to reveal the fragile truth beneath.',
    src: '/images/artworks/peeling-away.webp',
    aspect: 'square',
    year: 2025,
  },
  {
    id: 'metamorphosis',
    title: 'Metamorphosis',
    category: 'surreal',
    medium: 'Midjourney',
    description: 'Monarch butterflies erupt from cracked porcelain — a mind breaking open to release what it could never contain.',
    src: '/images/artworks/metamorphosis.webp',
    aspect: 'wide',
    year: 2025,
  },
  {
    id: 'the-crossing',
    title: 'The Crossing',
    category: 'landscapes',
    medium: 'Midjourney',
    description: 'Two small figures stand before a bridge that vanishes into towering clouds — the threshold between the known and the infinite.',
    src: '/images/artworks/the-crossing.webp',
    aspect: 'wide',
    year: 2025,
  },
  {
    id: 'red-sun-garden',
    title: 'Red Sun Garden',
    category: 'surreal',
    medium: 'Midjourney',
    description: 'A rusted sentinel looms over a garden of poppies and machines — tenderness persists in the wreckage of a forgotten world.',
    src: '/images/artworks/red-sun-garden.webp',
    aspect: 'wide',
    year: 2025,
  },
  {
    id: 'first-encounter',
    title: 'First Encounter',
    category: 'surreal',
    medium: 'Midjourney',
    description: 'A child in orange meets a creature made of wire and wildness — curiosity dissolves the boundary between familiar and strange.',
    src: '/images/artworks/first-encounter.webp',
    aspect: 'square',
    year: 2025,
  },
]
