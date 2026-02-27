import type { Artwork } from '~/types/artwork'

const STORAGE_KEY = 'bl-likes'

/**
 * Manages artwork like state with optimistic updates and localStorage persistence.
 * Auth-aware: when logged in, hydrates from server and uses userId-scoped storage.
 */
export function useLikes() {
  // SSR-safe shared state — Set of liked artwork IDs
  const likedIds = useState<Set<string>>('liked-ids', () => new Set())
  // Map of artwork ID → like count
  const likeCounts = useState<Map<string, number>>('like-counts', () => new Map())
  // Prevent double-clicks per artwork
  const pendingRequests = useState<Set<string>>('like-pending', () => new Set())

  // Auth state
  const { loggedIn, user } = useUserSession()

  function getStorageKey(): string {
    if (loggedIn.value && user.value?.id) {
      return `${STORAGE_KEY}-${user.value.id}`
    }
    return STORAGE_KEY
  }

  // Hydrate from localStorage on client mount
  if (import.meta.client) {
    onMounted(async () => {
      // If logged in, hydrate from server
      if (loggedIn.value) {
        try {
          const response = await $fetch<{ success: boolean; data: string[] }>('/api/user/likes')
          if (response.data.length > 0) {
            likedIds.value = new Set(response.data)
            persistToStorage()
          }
        } catch {
          // Fall back to localStorage
          hydrateFromStorage()
        }
      } else {
        hydrateFromStorage()
      }
    })
  }

  function hydrateFromStorage() {
    try {
      const stored = localStorage.getItem(getStorageKey())
      if (stored) {
        const ids = JSON.parse(stored) as string[]
        if (Array.isArray(ids)) {
          likedIds.value = new Set(ids)
        }
      }
    } catch {
      // Silently fail — corrupt localStorage
    }
  }

  function persistToStorage() {
    if (!import.meta.client) return
    try {
      localStorage.setItem(getStorageKey(), JSON.stringify([...likedIds.value]))
    } catch {
      // Storage full or unavailable
    }
  }

  function isLiked(artworkId: string): boolean {
    return likedIds.value.has(artworkId)
  }

  function getLikeCount(artworkId: string): number {
    return likeCounts.value.get(artworkId) || 0
  }

  function isPending(artworkId: string): boolean {
    return pendingRequests.value.has(artworkId)
  }

  /**
   * Seed like counts from fetched artworks data.
   * Called after artworks are loaded from the API.
   */
  function seedCounts(artworks: Artwork[]) {
    const newMap = new Map(likeCounts.value)
    for (const art of artworks) {
      if (art.likeCount !== undefined) {
        newMap.set(art.id, art.likeCount)
      }
    }
    likeCounts.value = newMap
  }

  /**
   * Toggle like state with optimistic UI update.
   * Returns the new liked state.
   */
  async function toggleLike(artworkId: string): Promise<boolean> {
    // Guard against double-clicks
    if (pendingRequests.value.has(artworkId)) {
      return isLiked(artworkId)
    }

    // Optimistic update
    const wasLiked = isLiked(artworkId)
    const newLiked = !wasLiked
    const currentCount = getLikeCount(artworkId)

    // Update state optimistically
    const newIds = new Set(likedIds.value)
    if (newLiked) {
      newIds.add(artworkId)
    } else {
      newIds.delete(artworkId)
    }
    likedIds.value = newIds
    persistToStorage()

    // Update count optimistically
    const newCounts = new Map(likeCounts.value)
    newCounts.set(artworkId, Math.max(0, currentCount + (newLiked ? 1 : -1)))
    likeCounts.value = newCounts

    // Mark as pending
    const newPending = new Set(pendingRequests.value)
    newPending.add(artworkId)
    pendingRequests.value = newPending

    try {
      const response = await $fetch<{ success: boolean; liked: boolean; count: number }>(
        `/api/artworks/${artworkId}/like`,
        { method: 'POST' },
      )

      // Reconcile with server truth
      const reconcileIds = new Set(likedIds.value)
      if (response.liked) {
        reconcileIds.add(artworkId)
      } else {
        reconcileIds.delete(artworkId)
      }
      likedIds.value = reconcileIds
      persistToStorage()

      const reconcileCounts = new Map(likeCounts.value)
      reconcileCounts.set(artworkId, response.count)
      likeCounts.value = reconcileCounts

      return response.liked
    } catch {
      // Revert on failure
      const revertIds = new Set(likedIds.value)
      if (wasLiked) {
        revertIds.add(artworkId)
      } else {
        revertIds.delete(artworkId)
      }
      likedIds.value = revertIds
      persistToStorage()

      const revertCounts = new Map(likeCounts.value)
      revertCounts.set(artworkId, currentCount)
      likeCounts.value = revertCounts

      return wasLiked
    } finally {
      const clearPending = new Set(pendingRequests.value)
      clearPending.delete(artworkId)
      pendingRequests.value = clearPending
    }
  }

  return {
    isLiked,
    getLikeCount,
    isPending,
    seedCounts,
    toggleLike,
    likedIds,
    likeCounts,
  }
}
