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

    <!-- Category Navigation -->
    <section ref="navEl" class="px-6 md:px-12 pb-24">
      <div class="max-w-4xl mx-auto">
        <p class="font-body text-xs uppercase tracking-[0.2em] text-lavender-300 text-center mb-6">
          Explore More
        </p>
        <div class="flex flex-wrap justify-center gap-3">
          <NuxtLink
            v-for="cat in otherCategories"
            :key="cat.id"
            :to="`/${cat.id}`"
            class="btn-press px-6 py-3 rounded-full border font-body text-sm uppercase tracking-wider transition-all duration-300"
            :class="cat.id === category
              ? 'bg-accent-red/15 border-accent-red/40 text-accent-red'
              : 'border-lavender-400/20 text-lavender-400 hover:border-lavender-200 hover:text-lavender-200'"
          >
            {{ cat.label }}
            <span class="ml-1.5 text-[10px] opacity-60">{{ cat.count }}</span>
          </NuxtLink>
        </div>
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

definePageMeta({
  layout: false,
  validate(route) {
    const validCategories = ['portraits', 'landscapes', 'abstract', 'surreal']
    return validCategories.includes(route.params.category as string)
  },
})

const route = useRoute()
const category = computed(() => route.params.category as string)

const validCategories = ['portraits', 'landscapes', 'abstract', 'surreal']

const { artworks } = useArtworks()

const heroEl = ref<HTMLElement | null>(null)
const navEl = ref<HTMLElement | null>(null)

const categoryArtworks = computed(() =>
  artworks.value.filter((a: Artwork) => a.category === category.value)
)

const categoryLabel = computed(() => {
  return category.value.charAt(0).toUpperCase() + category.value.slice(1)
})

const categoryDescriptions: Record<string, string> = {
  portraits: 'Faces that dissolve, fracture, and reconstruct — exploring identity through the lens of artificial imagination.',
  landscapes: 'Impossible vistas and liminal spaces where architecture meets atmosphere in dreamlike harmony.',
  abstract: 'Raw emotion rendered in color and form — chaos distilled into visual frequency.',
  surreal: 'Where logic ends and wonder begins — creatures, machines, and visions from the edge of consciousness.',
}

const categoryDescription = computed(() => categoryDescriptions[category.value] || '')

const otherCategories = computed(() => {
  return validCategories.map((id) => ({
    id,
    label: id.charAt(0).toUpperCase() + id.slice(1),
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
  return first?.src || '/images/artworks/the-watcher.webp'
})

useHead({
  title: `${categoryLabel.value} | Brian Lapinski`,
  meta: [
    { name: 'description', content: categoryDescription.value },
    { property: 'og:title', content: `${categoryLabel.value} — AI Art by Brian Lapinski` },
    { property: 'og:description', content: categoryDescription.value },
    { property: 'og:image', content: ogImage.value },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: `${categoryLabel.value} | Brian Lapinski` },
    { name: 'twitter:description', content: categoryDescription.value },
    { name: 'twitter:image', content: ogImage.value },
  ],
})
</script>

