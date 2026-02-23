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

// Placeholder artworks — replace src with real image paths
export const artworks: Artwork[] = [
  {
    id: 'art-01',
    title: 'Emergence',
    category: 'abstract',
    medium: 'Midjourney v6',
    description: 'Neural patterns emerging from digital noise.',
    src: '/images/placeholder/art-01.webp',
    aspect: 'tall',
    year: 2025,
  },
  {
    id: 'art-02',
    title: 'Digital Reverie',
    category: 'portraits',
    medium: 'Stable Diffusion XL',
    description: 'A contemplative figure dissolving into pixels.',
    src: '/images/placeholder/art-02.webp',
    aspect: 'square',
    year: 2025,
  },
  {
    id: 'art-03',
    title: 'Neon Frontier',
    category: 'landscapes',
    medium: 'Midjourney v6 + Photoshop',
    description: 'A cyberpunk landscape bathed in electric light.',
    src: '/images/placeholder/art-03.webp',
    aspect: 'wide',
    year: 2025,
  },
  {
    id: 'art-04',
    title: 'Fractured Reality',
    category: 'surreal',
    medium: 'DALL-E 3',
    description: 'Where dimensions collide and space bends.',
    src: '/images/placeholder/art-04.webp',
    aspect: 'tall',
    year: 2024,
  },
  {
    id: 'art-05',
    title: 'Synthetic Bloom',
    category: 'abstract',
    medium: 'Stable Diffusion + ComfyUI',
    description: 'Organic forms rendered through algorithmic processes.',
    src: '/images/placeholder/art-05.webp',
    aspect: 'square',
    year: 2025,
  },
  {
    id: 'art-06',
    title: 'Ghost in the Machine',
    category: 'portraits',
    medium: 'Midjourney v6',
    description: 'The line between human and artificial blurred.',
    src: '/images/placeholder/art-06.webp',
    aspect: 'tall',
    year: 2024,
  },
  {
    id: 'art-07',
    title: 'Terraform',
    category: 'landscapes',
    medium: 'Midjourney v6 + Topaz',
    description: 'Alien worlds shaped by artificial intelligence.',
    src: '/images/placeholder/art-07.webp',
    aspect: 'wide',
    year: 2025,
  },
  {
    id: 'art-08',
    title: 'Dreamweaver',
    category: 'surreal',
    medium: 'Stable Diffusion XL',
    description: 'Subconscious imagery woven by neural networks.',
    src: '/images/placeholder/art-08.webp',
    aspect: 'square',
    year: 2024,
  },
]
