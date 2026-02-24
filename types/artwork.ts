export interface Artwork {
  id: string
  title: string
  category: 'portraits' | 'landscapes' | 'abstract' | 'surreal'
  medium: string
  description: string
  src: string
  aspect: 'tall' | 'wide' | 'square'
  year: number
  dominantColor?: string
  sortOrder?: number
  featured?: boolean | null
  // Ossuary: prompt architecture
  rawPrompt?: string | null
  mjVersion?: string | null
  refinementNotes?: string | null
  promptNodes?: PromptNode[]
  createdAt?: string | null
  updatedAt?: string | null
}

export interface PromptNode {
  id: string
  name: string
  category: TechniqueCategory
  description?: string | null
}

export type TechniqueCategory = 'lighting' | 'camera' | 'style' | 'mood' | 'composition' | 'material' | 'color' | 'post'

export type ArtworkCategory = Artwork['category']

export interface Category {
  id: string
  label: string
  count?: number
}
