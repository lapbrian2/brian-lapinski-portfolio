import { artworks as staticArtworks } from '~/data/artworks'
import type { Artwork } from '~/types/artwork'

/**
 * Returns artworks from the static data file.
 *
 * The Turso DB currently has stale artwork records whose images were replaced
 * in commit d4d7aa2. Until db:seed is re-run to sync the DB with the current
 * image set, we use the static data which matches the actual image files.
 *
 * TODO: Switch back to useFetch('/api/artworks') after running db:seed
 */
export function useArtworks() {
  const artworks = computed<Artwork[]>(() => staticArtworks)
  const pending = ref(false)
  const error = ref<Error | null>(null)

  return { artworks, pending, error }
}
