import type { Artwork } from '~/types/artwork'

/**
 * Fetches artworks from the API (backed by Turso DB).
 * Returns reactive artworks list with like counts and optional prompt nodes.
 */
export function useArtworks() {
  const { data: response, pending, error, refresh } = useFetch<{ success: boolean; data: Artwork[] }>(
    '/api/artworks',
    { key: 'artworks-list', default: () => ({ success: true, data: [] }) },
  )

  const artworks = computed<Artwork[]>(() => response.value?.data || [])

  const likes = useLikes()
  watch(artworks, (arts) => {
    if (arts.length) likes.seedCounts(arts)
  }, { immediate: true })

  return { artworks, pending, error, refresh }
}
