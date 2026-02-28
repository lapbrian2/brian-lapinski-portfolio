import type { Artwork } from '~/types/artwork'

/**
 * Injects JSON-LD structured data into the page <head> via useHead().
 * Each helper returns the raw object so callers can extend if needed.
 */

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
  offers?: {
    '@type': string
    priceCurrency: string
    price: string
    url: string
    availability: string
    itemCondition: string
  }
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
      'https://www.instagram.com/lapbrian2',
      'https://www.linkedin.com/in/brian-lapinski',
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
        key: 'ld-website',
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

  // Add offers when prompt is available for purchase
  if (artwork.hasPrompt && artwork.promptPrice) {
    schema.offers = {
      '@type': 'Offer',
      priceCurrency: 'USD',
      price: (artwork.promptPrice / 100).toFixed(2),
      url: `${baseUrl}/artwork/${artwork.id}`,
      availability: 'https://schema.org/InStock',
      itemCondition: 'https://schema.org/NewCondition',
    }
  }

  useHead({
    script: [
      {
        key: 'ld-artwork',
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
        key: 'ld-category',
        type: 'application/ld+json',
        innerHTML: JSON.stringify(schema),
      },
    ],
  })

  return schema
}

/** CollectionPage + ItemList schema for the full gallery page */
export function useGallerySchema(artworks: Artwork[]) {
  const baseUrl = getBaseUrl()

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Gallery — AI Art by Brian Lapinski',
    description: 'Browse the full portfolio of AI artworks by Brian Lapinski — portraits, landscapes, abstract, surreal, anime, and sci-fi.',
    url: `${baseUrl}/gallery`,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: artworks.length,
      itemListElement: artworks.map((a, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        url: `${baseUrl}/artwork/${a.id}`,
        name: a.title,
        image: a.src.startsWith('http') ? a.src : `${baseUrl}${a.src}`,
      })),
    },
  }

  useHead({
    script: [
      {
        key: 'ld-gallery',
        type: 'application/ld+json',
        innerHTML: JSON.stringify(schema),
      },
    ],
  })

  return schema
}

/** Product schema for shop product detail pages */
export function useProductSchema(
  product: { artworkTitle?: string | null; artworkSrc?: string | null; id: string },
  variants: Array<{ price: number; active: boolean; sizeName: string }>,
) {
  const baseUrl = getBaseUrl()

  const activeVariants = variants.filter(v => v.active)
  const minPrice = activeVariants.length > 0
    ? Math.min(...activeVariants.map(v => v.price))
    : 0

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: `${product.artworkTitle || 'Untitled'} — Limited Edition Print`,
    description: `Limited edition museum-quality print of "${product.artworkTitle}" by Brian Lapinski.`,
    image: product.artworkSrc || '',
    url: `${baseUrl}/shop/${product.id}`,
    brand: {
      '@type': 'Brand',
      name: 'Brian Lapinski',
    },
    offers: activeVariants.length > 0
      ? {
          '@type': 'AggregateOffer',
          priceCurrency: 'USD',
          lowPrice: (minPrice / 100).toFixed(2),
          highPrice: (Math.max(...activeVariants.map(v => v.price)) / 100).toFixed(2),
          offerCount: activeVariants.length,
          availability: 'https://schema.org/InStock',
        }
      : undefined,
  }

  useHead({
    script: [
      {
        key: 'ld-product',
        type: 'application/ld+json',
        innerHTML: JSON.stringify(schema),
      },
    ],
  })

  return schema
}
