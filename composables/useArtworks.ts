import type { Artwork } from '~/types/artwork'

export function useArtworks() {
  const { data: response, pending, error, refresh } = useFetch<{ success: boolean; data: Artwork[] }>(
    '/api/artworks',
    {
      key: 'artworks-list',
      default: () => ({ success: true, data: [] }),
    },
  )

  const artworks = computed<Artwork[]>(() => response.value?.data || [])

  // Seed like counts when artworks data changes
  const likes = useLikes()
  watch(artworks, (arts) => {
    if (arts.length) likes.seedCounts(arts)
  }, { immediate: true })

  return { artworks, pending, error, refresh }
}
