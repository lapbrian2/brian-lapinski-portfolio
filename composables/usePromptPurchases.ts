/**
 * Manages prompt purchase state — tracks which artworks' prompts
 * the current user has unlocked. Follows useLikes.ts pattern.
 */
export function usePromptPurchases() {
  const purchasedIds = useState<Set<string>>('prompt-purchased-ids', () => new Set())
  const pendingPurchase = useState<string | null>('prompt-purchase-pending', () => null)

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
            purchasedIds.value = new Set(response.data)
          }
        } catch {
          // Silently fail
        }
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
        return
      }

      if (response.url) {
        // Store which artwork to re-open on return
        if (import.meta.client) {
          localStorage.setItem('bl-last-viewed-artwork', artworkId)
        }
        window.location.href = response.url
      }
    } finally {
      pendingPurchase.value = null
    }
  }

  return {
    purchasedIds,
    pendingPurchase,
    isPurchased,
    purchasePrompt,
    loggedIn,
  }
}
