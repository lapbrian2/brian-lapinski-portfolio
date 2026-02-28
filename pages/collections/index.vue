<template>
  <div class="min-h-screen bg-dark-900 vignette grain-overlay overflow-x-hidden">
    <!-- Header -->
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
          Curated Groupings
        </p>
        <h1 ref="titleEl" class="font-display text-hero font-bold text-lavender-100 leading-none mb-6">
          Collections
        </h1>
        <p class="font-body text-lg text-lavender-300 max-w-xl mx-auto">
          Thematic groupings of artworks — curated sequences that reveal deeper threads running through the work.
        </p>
      </div>
    </section>

    <!-- Loading -->
    <div v-if="pending" class="flex flex-col items-center justify-center py-20 gap-4">
      <div class="loading-dots"><span /><span /><span /></div>
      <div class="text-lavender-400 font-body text-sm">Loading collections...</div>
    </div>

    <!-- Empty State -->
    <div v-else-if="!collections || collections.length === 0" class="flex flex-col items-center justify-center py-20 px-6 text-center">
      <h2 class="font-display text-2xl font-bold text-lavender-100 mb-4">No Collections Yet</h2>
      <p class="font-body text-lavender-400 mb-8">Check back soon for curated groupings of artwork.</p>
      <NuxtLink
        to="/#work"
        class="inline-flex items-center gap-2 px-6 py-3 bg-accent-red hover:bg-accent-red-hover text-white text-sm font-medium rounded-sm transition-colors"
      >
        Browse Gallery
      </NuxtLink>
    </div>

    <!-- Collections Grid -->
    <section v-else ref="gridEl" class="pb-24 px-6 md:px-12">
      <div class="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <NuxtLink
          v-for="collection in collections"
          :key="collection.id"
          :to="`/collections/${collection.slug}`"
          class="group relative bg-dark-800 rounded-sm overflow-hidden border border-white/[0.04] hover:border-white/[0.1] transition-all duration-300"
        >
          <!-- Cover Image -->
          <div class="aspect-[4/3] overflow-hidden">
            <NuxtImg
              v-if="collection.coverImage"
              :src="collection.coverImage"
              :alt="collection.title"
              class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
              placeholder
              sizes="sm:100vw md:50vw lg:33vw"
            />
            <div v-else class="w-full h-full bg-dark-700 flex items-center justify-center">
              <span class="text-lavender-500 font-body text-sm">No cover image</span>
            </div>
          </div>

          <!-- Info -->
          <div class="p-5">
            <h3 class="font-display text-base font-semibold text-lavender-100 mb-1 group-hover:text-white transition-colors">
              {{ collection.title }}
            </h3>
            <p class="font-body text-xs text-lavender-400 mb-2">
              {{ collection.artworkCount }} {{ collection.artworkCount === 1 ? 'work' : 'works' }}
            </p>
            <p v-if="collection.description" class="font-body text-sm text-lavender-300/60 line-clamp-2">
              {{ collection.description }}
            </p>
          </div>

          <!-- Hover accent -->
          <div class="absolute bottom-0 left-0 right-0 h-px bg-accent-red scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
        </NuxtLink>
      </div>
    </section>

    <AppFooter />
  </div>
</template>

<script setup lang="ts">
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useReducedMotion } from '~/composables/useMediaQuery'

interface Collection {
  id: number
  title: string
  slug: string
  description: string
  coverImage: string
  artworkCount: number
  featured: boolean
}

definePageMeta({ layout: false })

const { data: collectionsData, pending } = useFetch<{ data: Collection[] }>('/api/collections')

const collections = computed(() => collectionsData.value?.data ?? [])

const heroEl = ref<HTMLElement | null>(null)
const titleEl = ref<HTMLElement | null>(null)
const gridEl = ref<HTMLElement | null>(null)
const reducedMotion = useReducedMotion()
let ctx: gsap.Context | null = null

// Entrance animations
onMounted(async () => {
  if (typeof window === 'undefined') return
  gsap.registerPlugin(ScrollTrigger)

  if (reducedMotion.value) return

  const { default: Splitting } = await import('splitting')

  ctx = gsap.context(() => {
    // Hero supporting elements (label, subtitle — excluding title)
    if (heroEl.value && titleEl.value) {
      const others = Array.from(heroEl.value.children).filter(el => el !== titleEl.value)
      gsap.from(others, {
        y: 40,
        opacity: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: 'power3.out',
        delay: 0.2,
      })

      // Title chars: blur-in from center like a camera focusing
      const result = Splitting({ target: titleEl.value, by: 'chars' })
      const chars = result[0]?.chars || []
      if (chars.length) {
        gsap.set(chars, { opacity: 0, filter: 'blur(12px)', scale: 0.7 })
        gsap.to(chars, {
          opacity: 1,
          filter: 'blur(0px)',
          scale: 1,
          duration: 0.8,
          stagger: { each: 0.04, from: 'center' },
          delay: 0.3,
          ease: 'power3.out',
          onComplete() {
            this.targets().forEach((el: HTMLElement) =>
              gsap.set(el, { clearProps: 'transform,willChange,filter' }),
            )
          },
        })
      }
    }

    if (gridEl.value) {
      const cards = gridEl.value.querySelectorAll('a')
      if (cards.length) {
        gsap.set(cards, { y: 30, opacity: 0, filter: 'blur(8px)', scale: 1.04 })
        ScrollTrigger.create({
          trigger: gridEl.value,
          start: 'top 85%',
          once: true,
          onEnter: () => {
            gsap.to(cards, {
              y: 0,
              opacity: 1,
              filter: 'blur(0px)',
              scale: 1,
              duration: 0.7,
              stagger: 0.1,
              ease: 'power2.out',
              force3D: true,
              onComplete() {
                this.targets().forEach((el: HTMLElement) =>
                  gsap.set(el, { clearProps: 'transform,willChange,force3D,filter' }),
                )
              },
            })
          },
        })
      }
    }
  })
})

onUnmounted(() => {
  ctx?.revert()
})

useHead({
  title: 'Collections | Brian Lapinski',
  meta: [
    { name: 'description', content: 'Curated thematic collections of AI artworks by Brian Lapinski.' },
    { property: 'og:title', content: 'Collections — Brian Lapinski' },
    { property: 'og:description', content: 'Curated thematic collections of AI artworks.' },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary_large_image' },
  ],
})
</script>

<style scoped>
:deep(.char) {
  display: inline-block;
}
</style>
