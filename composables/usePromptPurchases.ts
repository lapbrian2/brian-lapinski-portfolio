/**
 * Manages prompt purchase state — tracks which artworks' prompts
 * the current user has unlocked. Follows useLikes.ts pattern.
 */
export function usePromptPurchases() {
  const purchasedIds = useState<Set<string>>('prompt-purchased-ids', () => new Set())
  const pendingPurchase = useState<string | null>('prompt-purchase-pending', () => null)
  const isHydrated = useState('prompt-purchases-hydrated', () => false)

  const toast = useToast()

  // Auth state — gracefully handle missing NUXT_SESSION_PASSWORD
  let loggedIn = ref(false)
  try {
    const session = useUserSession()
    loggedIn = session.loggedIn
  } catch {
    // nuxt-auth-utils not configured
  }

  // Hydrate from server on client mount
  if (import.meta.client) {
    onMounted(async () => {
      // Check URL for Stripe redirect return
      const route = useRoute()
      const unlockedId = route.query.prompt_unlocked as string | undefined
      if (unlockedId) {
        const next = new Set(purchasedIds.value)
        next.add(unlockedId)
        purchasedIds.value = next
        // Clean up URL params
        const router = useRouter()
        const cleanQuery = { ...route.query }
        delete cleanQuery.prompt_unlocked
        delete cleanQuery.session_id
        router.replace({ query: cleanQuery })
      }

      // Fetch full purchase list from server
      if (loggedIn.value) {
        try {
          const response = await $fetch<{ success: boolean; data: string[] }>('/api/prompts/purchased')
          if (response.data.length > 0) {
            // UNION with existing set (preserves URL-sourced IDs) instead of overwriting
            const merged = new Set([...purchasedIds.value, ...response.data])
            purchasedIds.value = merged
          }
        } catch {
          // Silently fail
        }
      }

      isHydrated.value = true

      // Resume purchase intent after OAuth redirect
      try {
        const intentId = localStorage.getItem('bl-prompt-purchase-intent')
        if (intentId && loggedIn.value) {
          localStorage.removeItem('bl-prompt-purchase-intent')
          await purchasePrompt(intentId)
        }
      } catch {
        // Storage access failed
      }
    })
  }

  function isPurchased(artworkId: string): boolean {
    return purchasedIds.value.has(artworkId)
  }

  async function purchasePrompt(artworkId: string): Promise<void> {
    if (!loggedIn.value) {
      // Store intent so we can resume after auth
      if (import.meta.client) {
        localStorage.setItem('bl-prompt-purchase-intent', artworkId)
      }
      navigateTo('/auth/github')
      return
    }

    pendingPurchase.value = artworkId
    try {
      const response = await $fetch<{ success: boolean; url?: string; alreadyOwned?: boolean }>(
        '/api/prompts/purchase',
        { method: 'POST', body: { artworkId } },
      )

      if (response.alreadyOwned) {
        const next = new Set(purchasedIds.value)
        next.add(artworkId)
        purchasedIds.value = next
        toast.show('You already own this prompt!', { type: 'success' })
        return
      }

      if (response.url) {
        // Store which artwork to re-open on return
        if (import.meta.client) {
          localStorage.setItem('bl-last-viewed-artwork', artworkId)
        }
        window.location.href = response.url
      }
    } catch {
      toast.show('Purchase failed — please try again', { type: 'error' })
    } finally {
      pendingPurchase.value = null
    }
  }

  return {
    purchasedIds,
    pendingPurchase,
    isHydrated,
    isPurchased,
    purchasePrompt,
    loggedIn,
  }
}
