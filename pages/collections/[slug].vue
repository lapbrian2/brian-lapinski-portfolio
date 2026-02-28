<template>
  <div class="min-h-screen bg-dark-900 vignette grain-overlay overflow-x-hidden">
    <!-- Header -->
    <header class="fixed top-0 left-0 right-0 z-50 px-6 md:px-12 py-5 backdrop-blur-md bg-dark-900/70">
      <div class="flex items-center justify-between">
        <NuxtLink
          to="/collections"
          class="inline-flex items-center gap-2 text-lavender-300 hover:text-white transition-colors group"
        >
          <svg class="w-5 h-5 transition-transform group-hover:-translate-x-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="m12 19-7-7 7-7" />
            <path d="M19 12H5" />
          </svg>
          <span class="font-body text-sm">Back to Collections</span>
        </NuxtLink>

        <NuxtLink to="/" class="font-display text-lg font-bold text-lavender-100 hover:text-white transition-colors">
          BL
        </NuxtLink>
      </div>
    </header>

    <!-- Loading -->
    <div v-if="pending" class="flex flex-col items-center justify-center pt-40 pb-20 gap-4">
      <div class="loading-dots"><span /><span /><span /></div>
      <div class="text-lavender-400 font-body text-sm">Loading collection...</div>
    </div>

    <!-- Not Found -->
    <div v-else-if="!collection" class="flex flex-col items-center justify-center pt-40 pb-20 px-6 text-center">
      <h1 class="font-display text-4xl font-bold text-lavender-100 mb-4">Collection Not Found</h1>
      <p class="font-body text-lavender-400 mb-8">The collection you're looking for doesn't exist or has been removed.</p>
      <NuxtLink
        to="/collections"
        class="inline-flex items-center gap-2 px-6 py-3 bg-accent-red hover:bg-accent-red-hover text-white text-sm font-medium rounded-sm transition-colors"
      >
        Browse Collections
      </NuxtLink>
    </div>

    <!-- Collection Detail -->
    <template v-else>
      <!-- Hero -->
      <section class="pt-32 pb-12 px-6 md:px-12">
        <div ref="heroEl" class="max-w-5xl mx-auto text-center">
          <p class="font-body text-xs uppercase tracking-[0.3em] text-accent-red mb-4">
            {{ artworks.length }} {{ artworks.length === 1 ? 'Work' : 'Works' }}
          </p>
          <h1 ref="titleEl" class="font-display text-hero font-bold text-lavender-100 leading-none mb-6" style="perspective: 400px">
            {{ collection.title }}
          </h1>
          <p v-if="collection.description" class="font-body text-lg text-lavender-300 max-w-xl mx-auto">
            {{ collection.description }}
          </p>
        </div>
      </section>

      <!-- Empty State -->
      <div v-if="artworks.length === 0" class="flex flex-col items-center justify-center py-20 px-6 text-center">
        <p class="font-body text-lavender-400 mb-8">This collection has no artworks yet.</p>
        <NuxtLink
          to="/collections"
          class="inline-flex items-center gap-2 px-6 py-3 bg-accent-red hover:bg-accent-red-hover text-white text-sm font-medium rounded-sm transition-colors"
        >
          Browse Collections
        </NuxtLink>
      </div>

      <!-- Artwork Grid -->
      <section v-else ref="gridEl" class="pb-24 px-6 md:px-12">
        <div class="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <NuxtLink
            v-for="artwork in artworks"
            :key="artwork.id"
            :to="`/artwork/${artwork.id}`"
            class="group relative overflow-hidden rounded-sm aspect-square bg-dark-800 border border-white/[0.04] hover:border-white/[0.1] transition-all duration-300"
          >
            <NuxtImg
              v-if="artwork.src"
              :src="artwork.src"
              :alt="artwork.title"
              class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
              placeholder
              sizes="sm:100vw md:50vw lg:33vw"
            />
            <div v-else class="w-full h-full bg-dark-700 flex items-center justify-center">
              <span class="text-lavender-500 font-body text-sm">No image</span>
            </div>

            <!-- Title overlay on hover -->
            <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
              <div>
                <span class="font-display text-sm font-semibold text-white">{{ artwork.title }}</span>
                <p v-if="artwork.medium" class="font-body text-xs text-lavender-300/80 mt-0.5">{{ artwork.medium }}</p>
              </div>
            </div>
          </NuxtLink>
        </div>
      </section>
    </template>

    <AppFooter />
    <GalleryLightbox />
  </div>
</template>

<script setup lang="ts">
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useReducedMotion } from '~/composables/useMediaQuery'

interface CollectionArtwork {
  id: string
  title: string
  src: string
  category: string
  medium: string
  year: number
  aspect: string
}

interface CollectionDetail {
  id: number
  title: string
  slug: string
  description: string
  coverImage: string
  artworks: CollectionArtwork[]
}

interface CollectionResponse {
  data: CollectionDetail
}

definePageMeta({ layout: false })

const route = useRoute()
const slug = computed(() => route.params.slug as string)

const { data: response, pending, error } = useFetch<CollectionResponse>(
  () => `/api/collections/${slug.value}`,
  { key: `collection-${slug.value}` },
)

const collection = computed<CollectionDetail | null>(() => {
  if (error.value || !response.value?.data) return null
  return response.value.data
})

const artworks = computed(() => collection.value?.artworks ?? [])

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

      // Title chars: 3D cascade from start
      const result = Splitting({ target: titleEl.value, by: 'chars' })
      const chars = result[0]?.chars || []
      if (chars.length) {
        gsap.set(chars, { opacity: 0, y: 50, rotateX: -70 })
        gsap.to(chars, {
          opacity: 1,
          y: 0,
          rotateX: 0,
          duration: 0.8,
          stagger: { each: 0.04, from: 'start' },
          delay: 0.3,
          ease: 'power4.out',
          force3D: true,
          onComplete() {
            this.targets().forEach((el: HTMLElement) =>
              gsap.set(el, { clearProps: 'transform,willChange,force3D' }),
            )
          },
        })
      }
    }

    if (gridEl.value) {
      const cards = gridEl.value.querySelectorAll('a')
      if (cards.length) {
        gsap.set(cards, { y: 30, opacity: 0 })
        ScrollTrigger.create({
          trigger: gridEl.value,
          start: 'top 85%',
          once: true,
          onEnter: () => {
            gsap.to(cards, {
              y: 0,
              opacity: 1,
              duration: 0.6,
              stagger: 0.1,
              ease: 'power3.out',
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

// SEO
const config = useRuntimeConfig()
const baseUrl = (config.public.siteUrl as string) || 'https://lapinski.art'

useHead({
  title: computed(() => collection.value
    ? `${collection.value.title} | Collections | Brian Lapinski`
    : 'Collection | Brian Lapinski'),
  meta: computed(() => {
    if (!collection.value) return []
    const c = collection.value
    const imageUrl = c.coverImage?.startsWith('http') ? c.coverImage : `${baseUrl}${c.coverImage}`
    return [
      { name: 'description', content: c.description || `${c.title} — a curated collection by Brian Lapinski.` },
      { property: 'og:title', content: `${c.title} — Collections — Brian Lapinski` },
      { property: 'og:description', content: c.description || `${c.title} — a curated collection.` },
      { property: 'og:image', content: imageUrl },
      { property: 'og:type', content: 'website' },
      { property: 'og:url', content: `${baseUrl}/collections/${c.slug}` },
      { property: 'og:image:alt', content: `${c.title} collection by Brian Lapinski` },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: `${c.title} | Brian Lapinski` },
      { name: 'twitter:description', content: c.description || `${c.title} — a curated collection.` },
      { name: 'twitter:image', content: imageUrl },
    ]
  }),
  link: computed(() => {
    if (!collection.value) return []
    return [{ rel: 'canonical', href: `${baseUrl}/collections/${collection.value.slug}` }]
  }),
})
</script>

<style scoped>
:deep(.char) {
  display: inline-block;
}
</style>
