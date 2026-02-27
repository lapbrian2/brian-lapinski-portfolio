<template>
  <div class="min-h-screen bg-dark-900 vignette grain-overlay overflow-x-hidden">
    <!-- Back navigation -->
    <header class="fixed top-0 left-0 right-0 z-50 px-6 md:px-12 py-5 backdrop-blur-md bg-dark-900/70">
      <div class="flex items-center justify-between">
        <NuxtLink
          to="/#work"
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

    <!-- Hero -->
    <section class="pt-32 pb-12 px-6 md:px-12">
      <div ref="heroEl" class="max-w-5xl mx-auto text-center">
        <p class="font-body text-xs uppercase tracking-[0.3em] text-accent-red mb-4">
          {{ categoryArtworks.length }} Works
        </p>
        <div class="w-12 h-px bg-accent-red/40 mx-auto mb-6" />
        <h1 class="font-display text-hero font-bold text-lavender-100 leading-none mb-6 capitalize">
          {{ categoryLabel }}
        </h1>
        <p class="font-body text-lg text-lavender-300 max-w-xl mx-auto">
          {{ categoryDescription }}
        </p>
      </div>
    </section>

    <!-- Prompt Thread -->
    <PromptThread :artworks="categoryArtworks" />

    <!-- Category Navigation — editorial text links -->
    <section ref="navEl" class="px-6 md:px-12 pb-24">
      <div class="max-w-[1400px] mx-auto">
        <div class="w-16 h-px bg-accent-red/40 mx-auto mb-12" />
        <p class="font-body text-xs uppercase tracking-[0.25em] text-lavender-400 text-center mb-10">
          Explore More
        </p>
        <nav class="flex flex-col items-center gap-2">
          <NuxtLink
            v-for="cat in otherCategories"
            :key="cat.id"
            :to="`/${cat.id}`"
            class="group relative inline-flex items-center gap-4 transition-all duration-400"
          >
            <span
              class="font-display font-bold uppercase leading-none transition-all duration-400 category-nav-link"
              :class="cat.id === category
                ? 'text-lavender-100'
                : 'text-lavender-100/15 group-hover:text-lavender-100 group-hover:tracking-[0.02em]'"
            >
              {{ cat.label }}
            </span>
            <span class="font-body text-xs tabular-nums text-lavender-400/40 transition-colors duration-300 group-hover:text-accent-red">
              {{ cat.count }}
            </span>
            <!-- Hover underline -->
            <span class="absolute -bottom-1 left-0 right-0 h-px bg-accent-red/40 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-400 ease-out" />
          </NuxtLink>
        </nav>
      </div>
    </section>

    <AppFooter />

    <GalleryLightbox />
  </div>
</template>

<script setup lang="ts">
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import type { Artwork } from '~/types/artwork'
import { validCategorySlugs } from '~/data/artworks'

definePageMeta({
  layout: false,
  validate(route) {
    const valid = ['portraits', 'landscapes', 'abstract', 'surreal', 'anime', 'sci-fi']
    return valid.includes(route.params.category as string)
  },
})

const route = useRoute()
const category = computed(() => route.params.category as string)

const { artworks } = useArtworks()

const heroEl = ref<HTMLElement | null>(null)
const navEl = ref<HTMLElement | null>(null)

const categoryArtworks = computed(() =>
  artworks.value.filter((a: Artwork) => a.category === category.value)
)

const categoryLabels: Record<string, string> = {
  portraits: 'Portraits',
  landscapes: 'Landscapes',
  abstract: 'Abstract',
  surreal: 'Surreal',
  anime: 'Anime',
  'sci-fi': 'Sci-Fi',
}

const categoryLabel = computed(() => {
  return categoryLabels[category.value] || category.value.charAt(0).toUpperCase() + category.value.slice(1)
})

const categoryDescriptions: Record<string, string> = {
  portraits: 'Faces that dissolve, fracture, and reconstruct — exploring identity through the lens of artificial imagination.',
  landscapes: 'Impossible vistas and liminal spaces where architecture meets atmosphere in dreamlike harmony.',
  abstract: 'Raw emotion rendered in color and form — chaos distilled into visual frequency.',
  surreal: 'Where logic ends and wonder begins — creatures, machines, and visions from the edge of consciousness.',
  anime: 'Cel-shaded worlds and characters born from Midjourney\'s Niji mode — manga energy meets AI imagination.',
  'sci-fi': 'Vast alien environments and deep-sea frontiers — photorealistic science fiction at the edge of the known.',
}

const categoryDescription = computed(() => categoryDescriptions[category.value] || '')

const otherCategories = computed(() => {
  return validCategorySlugs.map((id) => ({
    id,
    label: categoryLabels[id] || id.charAt(0).toUpperCase() + id.slice(1),
    count: artworks.value.filter((a: Artwork) => a.category === id).length,
  }))
})

// GSAP scroll reveals
let ctx: gsap.Context | null = null

onMounted(() => {
  if (typeof window === 'undefined') return
  gsap.registerPlugin(ScrollTrigger)

  ctx = gsap.context(() => {
    // Hero reveal
    if (heroEl.value) {
      gsap.from(heroEl.value.children, {
        y: 40,
        opacity: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: 'power3.out',
        delay: 0.2,
      })
    }

    // Nav section
    if (navEl.value) {
      gsap.from(navEl.value, {
        y: 20,
        opacity: 0,
        duration: 0.6,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: navEl.value,
          start: 'top 90%',
        },
      })
    }
  })
})

onUnmounted(() => {
  ctx?.revert()
})

const ogImage = computed(() => {
  const first = categoryArtworks.value[0]
  return first?.src || '/images/artworks/the-threshold.webp'
})

useHead({
  title: computed(() => `${categoryLabel.value} | Brian Lapinski`),
  meta: computed(() => [
    { name: 'description', content: categoryDescription.value },
    { property: 'og:title', content: `${categoryLabel.value} — AI Art by Brian Lapinski` },
    { property: 'og:description', content: categoryDescription.value },
    { property: 'og:image', content: ogImage.value },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: `${categoryLabel.value} | Brian Lapinski` },
    { name: 'twitter:description', content: categoryDescription.value },
    { name: 'twitter:image', content: ogImage.value },
  ]),
})

// JSON-LD structured data for category page — reactive via watchEffect
watchEffect(() => {
  if (categoryLabel.value && categoryArtworks.value.length) {
    useCategorySchema(categoryLabel.value, categoryDescription.value, categoryArtworks.value)
  }
})
</script>

<style scoped>
.category-nav-link {
  font-size: clamp(2rem, 6vw, 5rem);
  letter-spacing: -0.03em;
}
</style>
