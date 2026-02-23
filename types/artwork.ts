export interface Artwork {
  id: string
  title: string
  category: 'portraits' | 'landscapes' | 'abstract' | 'surreal'
  medium: string
  description: string
  src: string
  aspect: 'tall' | 'wide' | 'square'
  year: number
  sortOrder?: number
  featured?: boolean | null
  createdAt?: string | null
  updatedAt?: string | null
}

export type ArtworkCategory = Artwork['category']

export interface Category {
  id: string
  label: string
  count?: number
}
