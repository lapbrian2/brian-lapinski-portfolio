<template>
  <div class="min-h-screen bg-dark-900 vignette grain-overlay overflow-x-hidden">
    <!-- Header -->
    <header class="fixed top-0 left-0 right-0 z-50 px-6 md:px-12 py-5 backdrop-blur-md bg-dark-900/70">
      <div class="flex items-center justify-between">
        <NuxtLink
          to="/gallery"
          class="inline-flex items-center gap-2 text-lavender-300 hover:text-white transition-colors group"
        >
          <svg class="w-5 h-5 transition-transform group-hover:-translate-x-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="m12 19-7-7 7-7" />
            <path d="M19 12H5" />
          </svg>
          <span class="font-body text-sm">Back to Gallery</span>
        </NuxtLink>

        <NuxtLink to="/" class="font-display text-lg font-bold text-lavender-100 hover:text-white transition-colors">
          BL
        </NuxtLink>
      </div>
    </header>

    <section class="pt-32 pb-24 px-6 md:px-12">
      <div class="max-w-4xl mx-auto">
        <!-- Title -->
        <div class="text-center mb-12">
          <p class="font-body text-xs uppercase tracking-[0.3em] text-accent-red mb-4">
            Your Collection
          </p>
          <div class="w-12 h-px bg-accent-red/40 mx-auto mb-6" />
          <h1 class="font-display text-3xl md:text-4xl font-bold text-lavender-100 mb-3">
            Unlocked Prompts
          </h1>
          <p class="font-body text-sm text-lavender-300">
            Full prompt text, techniques, and Playground access for your unlocked artworks.
          </p>
        </div>

        <!-- Loading -->
        <div v-if="loading" class="text-center py-16">
          <div class="w-6 h-6 border-2 border-accent-red border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p class="font-body text-sm text-lavender-400">Loading your prompts...</p>
        </div>

        <!-- Empty State -->
        <div v-else-if="!purchases.length" class="text-center py-16">
          <div class="w-16 h-16 rounded-full border border-white/[0.08] bg-white/[0.02] flex items-center justify-center mx-auto mb-6">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="text-lavender-400/40">
              <rect x="3" y="11" width="18" height="11" rx="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke-linecap="round" />
            </svg>
          </div>
          <h2 class="font-display text-xl font-bold text-lavender-200 mb-2">No prompts unlocked yet</h2>
          <p class="font-body text-sm text-lavender-400 mb-8 max-w-sm mx-auto">
            Browse the gallery, open any artwork's Prompt Architecture panel, and unlock the full creative blueprint.
          </p>
          <NuxtLink
            to="/gallery"
            class="inline-flex items-center gap-2 px-6 py-3 bg-accent-red hover:bg-accent-red-hover text-white text-sm font-medium rounded-sm transition-colors"
          >
            Browse Gallery
          </NuxtLink>
        </div>

        <!-- Purchase Grid -->
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <NuxtLink
            v-for="purchase in purchases"
            :key="purchase.artworkId"
            :to="`/gallery?prompt_unlocked=${purchase.artworkId}`"
            class="group block rounded-sm overflow-hidden border border-white/[0.06] hover:border-white/[0.12] transition-all duration-300"
          >
            <!-- Thumbnail -->
            <div class="aspect-[4/3] bg-dark-800 overflow-hidden">
              <img
                v-if="purchase.src"
                :src="purchase.src"
                :alt="purchase.title"
                class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                loading="lazy"
              />
            </div>
            <!-- Info -->
            <div class="p-4 bg-dark-800/50">
              <h3 class="font-display text-sm font-semibold text-lavender-100 mb-1.5 truncate">
                {{ purchase.title }}
              </h3>
              <div class="flex items-center justify-between">
                <span class="font-body text-xs text-lavender-400">
                  {{ formatDate(purchase.purchasedAt) }}
                </span>
                <span class="font-body text-xs text-emerald-400 font-medium">
                  ${{ (purchase.pricePaid / 100).toFixed(2) }}
                </span>
              </div>
            </div>
          </NuxtLink>
        </div>
      </div>
    </section>

    <AppFooter />
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })

interface PurchaseDetail {
  artworkId: string
  title: string
  src: string
  pricePaid: number
  purchasedAt: string | null
}

const loading = ref(true)
const purchases = ref<PurchaseDetail[]>([])

// Auth check — redirect if not logged in
let loggedIn = ref(false)
try {
  const session = useUserSession()
  loggedIn = session.loggedIn
} catch {
  // nuxt-auth-utils not configured
}

onMounted(async () => {
  if (!loggedIn.value) {
    navigateTo('/gallery')
    return
  }

  try {
    const response = await $fetch<{ success: boolean; data: PurchaseDetail[] }>(
      '/api/prompts/purchased?detail=true',
    )
    purchases.value = response.data
  } catch {
    // Silently fail — empty state will show
  } finally {
    loading.value = false
  }
})

function formatDate(dateStr: string | null): string {
  if (!dateStr) return ''
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  } catch {
    return ''
  }
}

useHead({
  title: 'My Prompts | Brian Lapinski',
  meta: [
    { name: 'description', content: 'View your unlocked prompt collection.' },
    { name: 'robots', content: 'noindex' },
  ],
})
</script>
