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
    if (error.value || !apiData?.length) return staticArtworks
    return apiData
  })

  // Seed like counts when artworks data changes
  const likes = useLikes()
  watch(artworks, (arts) => {
    if (arts.length) likes.seedCounts(arts)
  }, { immediate: true })

  return { artworks, pending, error, refresh }
}
