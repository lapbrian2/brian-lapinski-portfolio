import type { Artwork } from '~/types/artwork'
import { artworks as staticArtworks } from '~/data/artworks'

export function useArtworks() {
  // Use static artwork data as the canonical source
  const artworks = computed<Artwork[]>(() => staticArtworks)
  const pending = ref(false)
  const error = ref<Error | null>(null)
  const refresh = () => Promise.resolve()

  // Seed like counts when artworks data changes
  const likes = useLikes()
  watch(artworks, (arts) => {
    if (arts.length) likes.seedCounts(arts)
  }, { immediate: true })

  return { artworks, pending, error, refresh }
}
