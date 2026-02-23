import type { Artwork } from '~/types/artwork'
import { artworks as staticArtworks } from '~/data/artworks'

export function useArtworks() {
  const { data: response, pending, error, refresh } = useFetch('/api/artworks', {
    key: 'artworks',
    default: () => ({ success: true, data: [] as Artwork[] }),
  })

  // Fall back to static data if API fails or returns empty
  const artworks = computed<Artwork[]>(() => {
    const apiData = (response.value as any)?.data
    if (error.value || !apiData?.length) return staticArtworks as unknown as Artwork[]
    return apiData
  })

  return { artworks, pending, error, refresh }
}
