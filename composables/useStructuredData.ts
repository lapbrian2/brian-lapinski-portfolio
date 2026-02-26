import type { Artwork } from '~/types/artwork'

/**
 * Injects JSON-LD structured data into the page <head> via useHead().
 * Each helper returns the raw object so callers can extend if needed.
 */

interface WebSiteSchema {
  '@context': string
  '@type': string
  name: string
  url: string
  description: string
  author: PersonSchema
}

interface PersonSchema {
  '@type': string
  name: string
  url: string
  sameAs?: string[]
}

interface VisualArtworkSchema {
  '@context': string
  '@type': string
  name: string
  description: string
  image: string
  dateCreated: string
  artMedium: string
  creator: PersonSchema
  artform: string
  url: string
}

interface CollectionPageSchema {
  '@context': string
  '@type': string
  name: string
  description: string
  url: string
  mainEntity: {
    '@type': string
    itemListElement: Array<{
      '@type': string
      position: number
      url: string
      name: string
    }>
  }
}

function getBaseUrl() {
  const config = useRuntimeConfig()
  return (config.public.siteUrl as string) || 'https://lapinski.art'
}

function getCreator(): PersonSchema {
  return {
    '@type': 'Person',
    name: 'Brian Lapinski',
    url: getBaseUrl(),
    sameAs: [
      'https://twitter.com/Lapbrian2',
    ],
  }
}

/** WebSite + ArtGallery schema for the homepage */
export function useWebsiteSchema() {
  const baseUrl = getBaseUrl()

  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        name: 'Brian Lapinski | AI Art Portfolio',
        url: baseUrl,
        description: 'Exploring what it means to be human through images. AI artist, educator, and Creative Partner.',
        author: getCreator(),
      },
      {
        '@type': 'ArtGallery',
        name: 'Brian Lapinski Gallery',
        url: baseUrl,
        description: 'A curated gallery of AI-generated artworks spanning portraits, landscapes, abstract, and surreal categories.',
        founder: getCreator(),
      },
    ],
  }

  useHead({
    script: [
      {
        type: 'application/ld+json',
        innerHTML: JSON.stringify(schema),
      },
    ],
  })

  return schema
}

/** VisualArtwork schema for individual artwork pages */
export function useArtworkSchema(artwork: Artwork) {
  const baseUrl = getBaseUrl()

  const schema: VisualArtworkSchema = {
    '@context': 'https://schema.org',
    '@type': 'VisualArtwork',
    name: artwork.title,
    description: artwork.description,
    image: artwork.src.startsWith('http') ? artwork.src : `${baseUrl}${artwork.src}`,
    dateCreated: `${artwork.year}`,
    artMedium: artwork.medium,
    creator: getCreator(),
    artform: 'Digital Art',
    url: `${baseUrl}/artwork/${artwork.id}`,
  }

  useHead({
    script: [
      {
        type: 'application/ld+json',
        innerHTML: JSON.stringify(schema),
      },
    ],
  })

  return schema
}

/** CollectionPage schema for category pages */
export function useCategorySchema(
  categoryName: string,
  categoryDescription: string,
  artworks: Artwork[],
) {
  const baseUrl = getBaseUrl()

  const schema: CollectionPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${categoryName} — AI Art by Brian Lapinski`,
    description: categoryDescription,
    url: `${baseUrl}/${categoryName.toLowerCase()}`,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: artworks.map((a, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        url: `${baseUrl}/artwork/${a.id}`,
        name: a.title,
      })),
    },
  }

  useHead({
    script: [
      {
        type: 'application/ld+json',
        innerHTML: JSON.stringify(schema),
      },
    ],
  })

  return schema
}
