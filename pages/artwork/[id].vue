<template>
  <div class="min-h-screen bg-dark-900 vignette grain-overlay overflow-x-hidden">
    <!-- Header -->
    <header class="fixed top-0 left-0 right-0 z-50 px-6 md:px-12 py-5 backdrop-blur-md bg-dark-900/70">
      <div class="flex items-center justify-between">
        <NuxtLink
          :to="backLink"
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

    <!-- Loading -->
    <div v-if="pending" class="flex flex-col items-center justify-center pt-40 pb-20 gap-4">
      <div class="loading-dots"><span /><span /><span /></div>
      <div class="text-lavender-400 font-body text-sm">Loading artwork...</div>
    </div>

    <!-- Not Found -->
    <div v-else-if="!artwork" class="flex flex-col items-center justify-center pt-40 pb-20 px-6 text-center">
      <h1 class="font-display text-4xl font-bold text-lavender-100 mb-4">Artwork Not Found</h1>
      <p class="font-body text-lavender-400 mb-8">The artwork you're looking for doesn't exist or has been removed.</p>
      <NuxtLink
        to="/#work"
        class="inline-flex items-center gap-2 px-6 py-3 bg-accent-red hover:bg-accent-red-hover text-white text-sm font-medium rounded-sm transition-colors"
      >
        Browse Gallery
      </NuxtLink>
    </div>

    <!-- Artwork Detail -->
    <template v-else>
      <section class="pt-32 pb-8 px-6 md:px-12">
        <div class="max-w-6xl mx-auto">
          <!-- Image -->
          <div
            ref="imageWrapEl"
            class="relative cursor-pointer group mx-auto"
            :class="artwork.aspect === 'wide' ? 'max-w-5xl' : artwork.aspect === 'tall' ? 'max-w-2xl' : 'max-w-3xl'"
            @click="openInLightbox"
          >
            <NuxtImg
              :src="artwork.src"
              :alt="artwork.title"
              class="w-full h-auto rounded-sm transition-transform duration-500 group-hover:scale-[1.01]"
              loading="eager"
              preload
              sizes="sm:100vw lg:80vw 2xl:60vw"
              draggable="false"
            />
            <div class="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-sm flex items-center justify-center">
              <span class="opacity-0 group-hover:opacity-100 transition-opacity text-white/80 font-body text-sm tracking-wider uppercase">
                View Full Size
              </span>
            </div>
          </div>
        </div>
      </section>

      <!-- Info -->
      <section ref="infoEl" class="pb-16 px-6 md:px-12">
        <div class="max-w-3xl mx-auto">
          <!-- Title & Meta -->
          <div class="mb-8">
            <h1 class="artwork-title font-display text-4xl md:text-6xl lg:text-7xl font-bold text-lavender-100 mb-3 leading-none" style="letter-spacing: -0.03em">
              {{ artwork.title }}
            </h1>
            <p class="font-body text-sm uppercase tracking-[0.15em] text-lavender-400">
              {{ artwork.medium }} &middot; {{ artwork.year }} &middot;
              <NuxtLink
                :to="`/${artwork.category}`"
                class="text-accent-red hover:text-accent-red-hover transition-colors capitalize"
              >
                {{ artwork.category }}
              </NuxtLink>
            </p>

            <!-- Stats & Like -->
            <div class="flex items-center gap-4 mt-4">
              <ArtworkStats :artwork-id="artwork.id" />
              <ResonanceButton :artwork-id="artwork.id" size="md" />
            </div>

            <!-- Share -->
            <div class="mt-4">
              <ShareButtons
                :title="artwork.title"
                :url="artworkUrl"
                :image-url="artworkImageUrl"
              />
            </div>
          </div>

          <!-- Description -->
          <p v-if="artwork.description" class="font-body text-lg leading-relaxed text-lavender-300/80 mb-10">
            {{ artwork.description }}
          </p>

          <!-- Prompt Architecture -->
          <div v-if="artwork.rawPrompt || artwork.refinementNotes || (artwork.promptNodes && artwork.promptNodes.length)" class="space-y-6 mb-10">
            <h2 class="font-display text-2xl md:text-3xl font-bold text-lavender-100 leading-none" style="letter-spacing: -0.02em">Prompt Architecture</h2>

            <!-- Raw Prompt -->
            <div v-if="artwork.rawPrompt">
              <p class="text-[10px] uppercase tracking-[0.2em] text-lavender-400/40 mb-2">Raw Prompt</p>
              <code class="block text-xs leading-relaxed font-mono text-lavender-200/70 whitespace-pre-wrap break-words bg-white/[0.02] border border-white/[0.06] rounded-lg p-4">{{ artwork.rawPrompt }}</code>
            </div>

            <!-- Version -->
            <div v-if="artwork.mjVersion">
              <p class="text-[10px] uppercase tracking-[0.2em] text-lavender-400/40 mb-2">Model Version</p>
              <p class="text-sm text-lavender-200/70 font-mono">{{ artwork.mjVersion }}</p>
            </div>

            <!-- Refinement Notes -->
            <div v-if="artwork.refinementNotes">
              <p class="text-[10px] uppercase tracking-[0.2em] text-lavender-400/40 mb-2">Artist Notes</p>
              <p class="text-sm leading-relaxed font-body text-lavender-300/60 italic">{{ artwork.refinementNotes }}</p>
            </div>

            <!-- Technique Tokens -->
            <div v-if="artwork.promptNodes && artwork.promptNodes.length">
              <p class="text-[10px] uppercase tracking-[0.2em] text-lavender-400/40 mb-3">Technique Tokens</p>
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="node in artwork.promptNodes"
                  :key="node.id"
                  class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.03] border border-white/[0.08] rounded-full text-xs text-lavender-200/60"
                >
                  <span class="w-1.5 h-1.5 rounded-full" :class="tokenColor(node.category)" />
                  {{ node.name }}
                </span>
              </div>
            </div>
          </div>

          <!-- Divider -->
          <div class="pt-6 border-t border-white/[0.06]" />
        </div>
      </section>

      <!-- Related Works -->
      <section v-if="relatedArtworks.length" ref="relatedEl" class="pb-24 px-6 md:px-12">
        <div class="max-w-5xl mx-auto">
          <div class="text-center mb-10">
            <p class="font-body text-xs uppercase tracking-[0.25em] text-lavender-400 mb-3">Related Works</p>
            <h2 class="font-display text-2xl md:text-4xl font-bold text-lavender-100 leading-none" style="letter-spacing: -0.03em">More from {{ artwork.category }}</h2>
          </div>
          <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
            <NuxtLink
              v-for="related in relatedArtworks"
              :key="related.id"
              :to="`/artwork/${related.id}`"
              class="group relative overflow-hidden rounded-sm aspect-square"
            >
              <NuxtImg
                :src="related.src"
                :alt="related.title"
                class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
                placeholder
                sizes="sm:50vw md:33vw xxl:25vw"
              />
              <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                <span class="font-display text-sm font-semibold text-white">{{ related.title }}</span>
              </div>
            </NuxtLink>
          </div>
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
import type { Artwork } from '~/types/artwork'
import type { ArtworkApiResponse } from '~/types/api'
import type { TechniqueCategory } from '~/types/artwork'
import type { SourceRect } from '~/composables/useLightbox'

definePageMeta({ layout: false })

const route = useRoute()
const artworkId = computed(() => route.params.id as string)

const lightbox = useLightbox()
const imageWrapEl = ref<HTMLElement | null>(null)
const infoEl = ref<HTMLElement | null>(null)
const relatedEl = ref<HTMLElement | null>(null)

// Fetch artwork from API
const { data: response, pending, error } = useFetch<ArtworkApiResponse>(
  () => `/api/artworks/${artworkId.value}`,
  { key: `artwork-${artworkId.value}` },
)

const artwork = computed<Artwork | null>(() => {
  if (error.value || !response.value?.data) return null
  return response.value.data
})

// Get related artworks from same category
const { artworks: allArtworks } = useArtworks()
const relatedArtworks = computed(() => {
  if (!artwork.value) return []
  return allArtworks.value
    .filter(a => a.category === artwork.value!.category && a.id !== artwork.value!.id)
    .slice(0, 3)
})

// Back link — go to category page
const backLink = computed(() => {
  if (artwork.value) return `/${artwork.value.category}`
  return '/#work'
})

// Token color map
function tokenColor(category: TechniqueCategory): string {
  const map: Record<TechniqueCategory, string> = {
    lighting: 'bg-yellow-400',
    camera: 'bg-blue-400',
    style: 'bg-purple-400',
    mood: 'bg-rose-400',
    composition: 'bg-emerald-400',
    material: 'bg-orange-400',
    color: 'bg-pink-400',
    post: 'bg-cyan-400',
  }
  return map[category] || 'bg-lavender-400'
}

// Open in lightbox
function openInLightbox() {
  if (!artwork.value) return
  const items = [{
    id: artwork.value.id,
    src: artwork.value.src,
    title: artwork.value.title,
    medium: artwork.value.medium,
    description: artwork.value.description,
    year: artwork.value.year,
    rawPrompt: artwork.value.rawPrompt,
    mjVersion: artwork.value.mjVersion,
    refinementNotes: artwork.value.refinementNotes,
    promptNodes: artwork.value.promptNodes,
  }]

  let rect: SourceRect | null = null
  if (imageWrapEl.value) {
    const domRect = imageWrapEl.value.getBoundingClientRect()
    rect = {
      top: domRect.top,
      left: domRect.left,
      width: domRect.width,
      height: domRect.height,
      borderRadius: '2px',
    }
  }

  lightbox.open(items, 0, rect)
}

// GSAP entrance animations
let ctx: gsap.Context | null = null

onMounted(() => {
  if (typeof window === 'undefined') return
  gsap.registerPlugin(ScrollTrigger)

  ctx = gsap.context(() => {
    // Info section: title + description stagger
    if (infoEl.value) {
      const title = infoEl.value.querySelector('.artwork-title')
      const children = infoEl.value.querySelectorAll('.max-w-3xl > *')
      if (children.length) {
        gsap.set(children, { opacity: 0, y: 30 })
        gsap.to(children, {
          opacity: 1,
          y: 0,
          duration: 0.7,
          stagger: 0.1,
          delay: 0.3,
          ease: 'power3.out',
          force3D: true,
          onComplete() {
            this.targets().forEach((el: HTMLElement) => gsap.set(el, { clearProps: 'transform,willChange,force3D' }))
          },
        })
      }
    }

    // Related works: stagger on scroll
    if (relatedEl.value) {
      const cards = relatedEl.value.querySelectorAll('.grid > a')
      if (cards.length) {
        gsap.set(cards, { opacity: 0, y: 30, scale: 0.97 })
        ScrollTrigger.create({
          trigger: relatedEl.value,
          start: 'top 85%',
          once: true,
          onEnter: () => {
            gsap.to(cards, {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: 0.6,
              stagger: 0.12,
              ease: 'power2.out',
              force3D: true,
              onComplete() {
                this.targets().forEach((el: HTMLElement) => gsap.set(el, { clearProps: 'transform,willChange,force3D' }))
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

// Computed URLs for share buttons
const config = useRuntimeConfig()
const baseUrl = (config.public.siteUrl as string) || 'https://lapinski.art'

const artworkUrl = computed(() =>
  artwork.value ? `${baseUrl}/artwork/${artwork.value.id}` : baseUrl,
)

const artworkImageUrl = computed(() => {
  if (!artwork.value) return ''
  return artwork.value.src.startsWith('http')
    ? artwork.value.src
    : `${baseUrl}${artwork.value.src}`
})

// SEO: Dynamic head

useHead({
  title: computed(() => artwork.value
    ? `${artwork.value.title} | Brian Lapinski`
    : 'Artwork | Brian Lapinski'),
  meta: computed(() => {
    if (!artwork.value) return []
    const a = artwork.value
    const imageUrl = a.src.startsWith('http') ? a.src : `${baseUrl}${a.src}`
    return [
      { name: 'description', content: a.description },
      { property: 'og:title', content: `${a.title} — AI Art by Brian Lapinski` },
      { property: 'og:description', content: a.description },
      { property: 'og:image', content: imageUrl },
      { property: 'og:type', content: 'article' },
      { property: 'og:url', content: `${baseUrl}/artwork/${a.id}` },
      { property: 'og:image:alt', content: `${a.title} — AI artwork by Brian Lapinski` },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: `${a.title} | Brian Lapinski` },
      { name: 'twitter:description', content: a.description },
      { name: 'twitter:image', content: imageUrl },
      { name: 'twitter:creator', content: '@Lapbrian2' },
    ]
  }),
  link: computed(() => {
    const a = artwork.value
    if (!a) return []
    return [{ rel: 'canonical', href: `${baseUrl}/artwork/${a.id}` }]
  }),
})

// JSON-LD structured data — watch artwork ref to update on navigation
watch(artwork, (a) => {
  if (a) {
    useArtworkSchema(a)
    useBreadcrumbSchema([
      { name: 'Home', path: '/' },
      { name: 'Gallery', path: '/gallery' },
      { name: a.title, path: `/artwork/${a.id}` },
    ])
  }
}, { immediate: true })
</script>
