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
          <span class="font-body text-sm">Back to Home</span>
        </NuxtLink>

        <NuxtLink to="/" class="font-display text-lg font-bold text-lavender-100 hover:text-white transition-colors">
          BL
        </NuxtLink>
      </div>
    </header>

    <!-- Hero -->
    <section class="pt-32 pb-8 px-6 md:px-12">
      <div ref="heroEl" class="max-w-5xl mx-auto text-center">
        <p class="font-body text-xs uppercase tracking-[0.3em] text-accent-red mb-4">
          Full Portfolio
        </p>
        <div class="w-12 h-px bg-accent-red/40 mx-auto mb-6" />
        <h1 ref="titleEl" class="font-display text-hero font-bold text-lavender-100 leading-none mb-6" style="perspective: 600px">
          Gallery
        </h1>
        <p class="font-body text-lg text-lavender-300 max-w-xl mx-auto">
          {{ filteredArtworks.length }} works spanning portraiture, landscapes, abstraction, and worlds beyond imagination.
        </p>
      </div>
    </section>

    <!-- Category Filter Pills -->
    <section class="px-6 md:px-12 pb-10">
      <div ref="filtersEl" class="max-w-5xl mx-auto flex justify-center">
        <div class="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <button
            v-for="cat in categories"
            :key="cat.id"
            class="filter-pill flex-shrink-0 px-5 py-2 rounded-full font-body text-sm transition-all duration-300"
            :class="activeCategory === cat.id
              ? 'bg-accent-red text-white shadow-lg shadow-accent-red/20'
              : 'border border-white/[0.08] text-lavender-300 hover:border-white/[0.15] hover:text-lavender-100'"
            @click="setCategory(cat.id)"
          >
            {{ cat.label }}
            <span
              v-if="cat.id !== 'all'"
              class="ml-1.5 text-xs opacity-50"
            >{{ getCategoryCount(cat.id) }}</span>
          </button>
        </div>
      </div>
    </section>

    <!-- Masonry Grid -->
    <section ref="gridSection" class="px-6 md:px-12 pb-24">
      <div class="max-w-[1400px] mx-auto">
        <div ref="gridEl" class="gallery-masonry">
          <div
            v-for="artwork in filteredArtworks"
            :key="artwork.id"
            ref="cardRefs"
            class="gallery-card break-inside-avoid mb-4 group relative overflow-hidden rounded-sm cursor-pointer"
            :data-artwork-id="artwork.id"
            data-cursor-text="View"
            role="button"
            :tabindex="0"
            :aria-label="`View ${artwork.title}`"
            @click="openLightbox(artwork, $event)"
            @keydown.enter="openLightbox(artwork, $event)"
            @keydown.space.prevent="openLightbox(artwork, $event)"
          >
            <!-- Image -->
            <NuxtImg
              :src="artwork.src"
              :alt="artwork.title"
              class="w-full h-auto block transition-transform duration-500 group-hover:scale-[1.03]"
              loading="lazy"
              placeholder
              sizes="sm:100vw md:50vw lg:33vw"
              draggable="false"
            />

            <!-- Prompt badge (always visible) -->
            <div
              v-if="artwork.hasPrompt"
              class="absolute top-3 right-3 z-10 pointer-events-none"
            >
              <span
                v-if="isPurchased(artwork.id)"
                class="prompt-badge prompt-badge--unlocked"
              >
                <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="2 6 5 9 10 3" />
                </svg>
                Unlocked
              </span>
              <span
                v-else
                class="prompt-badge prompt-badge--locked"
              >
                <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                  <rect x="2" y="8" width="12" height="8" rx="1.5" />
                  <path d="M5 8V5a3 3 0 0 1 6 0v3" />
                </svg>
                Prompt ${{ ((artwork.promptPrice || 399) / 100).toFixed(2) }}
              </span>
            </div>

            <!-- Hover overlay -->
            <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400 flex flex-col justify-end p-5">
              <h3 class="font-display text-base md:text-lg font-semibold text-white mb-1 translate-y-3 group-hover:translate-y-0 transition-transform duration-400">
                {{ artwork.title }}
              </h3>
              <div class="flex items-center justify-between translate-y-3 group-hover:translate-y-0 transition-transform duration-400 delay-75">
                <p class="font-body text-xs uppercase tracking-[0.12em] text-lavender-300/70">
                  {{ artwork.medium }} &middot; {{ artwork.year }}
                </p>
                <!-- Prompt unlock hint on hover -->
                <span
                  v-if="artwork.hasPrompt && !isPurchased(artwork.id)"
                  class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-accent-red/20 border border-accent-red/30 text-accent-red font-body text-[10px] font-medium tracking-wide"
                >
                  <svg width="8" height="8" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                    <rect x="2" y="8" width="12" height="8" rx="1.5" />
                    <path d="M5 8V5a3 3 0 0 1 6 0v3" />
                  </svg>
                  ${{ ((artwork.promptPrice || 399) / 100).toFixed(2) }}
                </span>
                <span
                  v-else-if="artwork.hasPrompt && isPurchased(artwork.id)"
                  class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-body text-[10px] font-medium tracking-wide"
                >
                  <svg width="8" height="8" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="2 6 5 9 10 3" />
                  </svg>
                  Unlocked
                </span>
              </div>
            </div>

            <!-- Dominant color glow on hover -->
            <div
              class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-sm"
              :style="`box-shadow: inset 0 0 0 1px ${artwork.dominantColor || '#ed544d'}30, 0 0 40px ${artwork.dominantColor || '#ed544d'}15`"
            />
          </div>
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
import { categories } from '~/data/artworks'
import { useReducedMotion } from '~/composables/useMediaQuery'
import type { Artwork } from '~/types/artwork'
import type { SourceRect } from '~/composables/useLightbox'

definePageMeta({ layout: false })

const { artworks } = useArtworks()
const lightbox = useLightbox()
const reducedMotion = useReducedMotion()
const toast = useToast()
const { isPurchased, loggedIn } = usePromptPurchases()

const heroEl = ref<HTMLElement | null>(null)
const titleEl = ref<HTMLElement | null>(null)
const filtersEl = ref<HTMLElement | null>(null)
const gridEl = ref<HTMLElement | null>(null)
const gridSection = ref<HTMLElement | null>(null)

const activeCategory = ref('all')
let ctx: gsap.Context | null = null
let isAnimating = false

// 3D tilt on gallery cards (desktop only, event-delegated)
useTiltHover(gridEl, { selector: '.gallery-card' })

// Scroll velocity → subtle skew on gallery grid
const { velocity } = useScrollVelocity()
let skewTo: gsap.QuickToFunc | null = null

const filteredArtworks = computed(() => {
  if (activeCategory.value === 'all') return artworks.value
  return artworks.value.filter(a => a.category === activeCategory.value)
})

function getCategoryCount(catId: string): number {
  return artworks.value.filter(a => a.category === catId).length
}

function setCategory(catId: string) {
  if (catId === activeCategory.value || isAnimating) return
  isAnimating = true

  const cards = gridEl.value?.querySelectorAll('.gallery-card')
  if (!cards?.length) {
    activeCategory.value = catId
    isAnimating = false
    return
  }

  // Fade out existing cards
  gsap.to(cards, {
    opacity: 0,
    y: -15,
    duration: 0.25,
    stagger: 0.02,
    ease: 'power2.in',
    onComplete: () => {
      activeCategory.value = catId

      // Wait for Vue to re-render
      nextTick(() => {
        const newCards = gridEl.value?.querySelectorAll('.gallery-card')
        if (newCards?.length) {
          gsap.fromTo(newCards,
            { opacity: 0, y: 30, scale: 0.97 },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: 0.5,
              stagger: { each: 0.04, from: 'end' },
              ease: 'power3.out',
              force3D: true,
              onComplete() {
                this.targets().forEach((el: HTMLElement) =>
                  gsap.set(el, { clearProps: 'transform,willChange,force3D' }),
                )
                isAnimating = false
              },
            },
          )
        } else {
          isAnimating = false
        }
      })
    },
  })
}

function openLightbox(artwork: Artwork, event: Event) {
  const target = (event.currentTarget || event.target) as HTMLElement
  const items = filteredArtworks.value.map(a => ({
    id: a.id,
    src: a.src,
    title: a.title,
    medium: a.medium,
    description: a.description,
    year: a.year,
    rawPrompt: a.rawPrompt,
    mjVersion: a.mjVersion,
    refinementNotes: a.refinementNotes,
    promptNodes: a.promptNodes,
    promptUnlocked: a.promptUnlocked,
    promptPrice: a.promptPrice,
    hasPrompt: a.hasPrompt,
  }))

  const index = filteredArtworks.value.findIndex(a => a.id === artwork.id)

  let rect: SourceRect | null = null
  if (target) {
    const domRect = target.getBoundingClientRect()
    rect = {
      top: domRect.top,
      left: domRect.left,
      width: domRect.width,
      height: domRect.height,
      borderRadius: '2px',
    }
  }

  lightbox.open(items, index >= 0 ? index : 0, rect)
}

// Auto-open lightbox on Stripe return (?prompt_unlocked=artworkId)
// Shared handler works for both immediate (artworks already loaded) and deferred (async fetch)
let stripeReturnHandled = false

function handleStripeReturn(arts: Artwork[]) {
  if (stripeReturnHandled || typeof window === 'undefined' || !arts.length) return
  const route = useRoute()
  const unlockedId = route.query.prompt_unlocked as string | undefined
  if (!unlockedId) return

  const idx = arts.findIndex(a => a.id === unlockedId)
  if (idx >= 0) {
    stripeReturnHandled = true
    const items = arts.map(a => ({
      id: a.id,
      src: a.src,
      title: a.title,
      medium: a.medium,
      description: a.description,
      year: a.year,
      rawPrompt: a.rawPrompt,
      mjVersion: a.mjVersion,
      refinementNotes: a.refinementNotes,
      promptNodes: a.promptNodes,
      promptUnlocked: a.id === unlockedId ? true : a.promptUnlocked,
      promptPrice: a.promptPrice,
      hasPrompt: a.hasPrompt,
    }))
    lightbox.open(items, idx)
    toast.show('Prompt unlocked!', { type: 'success' })
  }

  // Clean up URL params
  const router = useRouter()
  const cleanQuery = { ...route.query }
  delete cleanQuery.prompt_unlocked
  delete cleanQuery.session_id
  router.replace({ query: Object.keys(cleanQuery).length > 0 ? cleanQuery : undefined })
}

onMounted(() => handleStripeReturn(artworks.value))
watch(() => artworks.value, (arts) => handleStripeReturn(arts), { once: true })

// GSAP entrance animations
onMounted(async () => {
  if (typeof window === 'undefined') return
  gsap.registerPlugin(ScrollTrigger)

  // Velocity-driven skew on gallery grid (desktop only)
  if (gridEl.value && window.matchMedia('(hover: hover)').matches) {
    skewTo = gsap.quickTo(gridEl.value, 'skewY', { duration: 0.4, ease: 'power2.out' })
  }

  if (reducedMotion.value) return

  const { default: Splitting } = await import('splitting')

  ctx = gsap.context(() => {
    // Hero supporting elements stagger (label, divider, subtitle — excluding title)
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

      // Title chars: rotateY flip-in like book pages turning open
      const result = Splitting({ target: titleEl.value, by: 'chars' })
      const chars = result[0]?.chars || []
      if (chars.length) {
        gsap.set(chars, { opacity: 0, x: 40, rotateY: 90 })
        gsap.to(chars, {
          opacity: 1,
          x: 0,
          rotateY: 0,
          duration: 0.9,
          stagger: { each: 0.06, from: 'start' },
          delay: 0.35,
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

    // Filter pills
    if (filtersEl.value) {
      const pills = filtersEl.value.querySelectorAll('.filter-pill')
      gsap.from(pills, {
        opacity: 0,
        y: 15,
        duration: 0.5,
        stagger: 0.05,
        delay: 0.6,
        ease: 'power2.out',
      })
    }

    // Grid cards: blur-to-sharp reveal with bottom-up wave stagger
    nextTick(() => {
      const cards = gridEl.value?.querySelectorAll('.gallery-card')
      if (cards?.length) {
        gsap.set(cards, { opacity: 0, y: 30, scale: 0.97 })
        ScrollTrigger.create({
          trigger: gridSection.value!,
          start: 'top 90%',
          once: true,
          onEnter: () => {
            gsap.to(cards, {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: 0.6,
              stagger: { each: 0.05, from: 'end' },
              ease: 'power3.out',
              force3D: true,
              onComplete() {
                this.targets().forEach((el: HTMLElement) =>
                  gsap.set(el, { clearProps: 'transform,willChange,force3D' }),
                )
              },
            })
          },
        })
      }
    })
  })
})

// Drive skew from velocity (clamped to ±1.5deg)
watch(velocity, (v) => {
  if (!skewTo) return
  const clamped = Math.max(-1.5, Math.min(1.5, v * 0.15))
  skewTo(clamped)
})

onUnmounted(() => {
  ctx?.revert()
  if (gridEl.value) gsap.set(gridEl.value, { clearProps: 'skewY' })
})

// SEO
useHead({
  title: 'Gallery | Brian Lapinski',
  meta: [
    { name: 'description', content: 'Browse the full portfolio of AI artworks by Brian Lapinski — portraits, landscapes, abstract, surreal, anime, and sci-fi.' },
    { property: 'og:title', content: 'Gallery — AI Art by Brian Lapinski' },
    { property: 'og:description', content: 'Browse the full portfolio of AI artworks by Brian Lapinski.' },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: 'Gallery | Brian Lapinski' },
    { name: 'twitter:description', content: 'Browse the full portfolio of AI artworks by Brian Lapinski.' },
  ],
})
</script>

<style scoped>
.gallery-masonry {
  column-count: 3;
  column-gap: 1rem;
}

@media (max-width: 1024px) {
  .gallery-masonry {
    column-count: 2;
  }
}

@media (max-width: 640px) {
  .gallery-masonry {
    column-count: 1;
  }
}

:deep(.char) {
  display: inline-block;
}

/* Hide scrollbar on filter row */
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

/* Prompt availability badges on gallery cards */
.prompt-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 10px;
  border-radius: 100px;
  backdrop-filter: blur(12px);
  font-family: var(--font-body, 'PP Neue Montreal', sans-serif);
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.04em;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.prompt-badge--locked {
  background: rgba(237, 84, 77, 0.2);
  border: 1px solid rgba(237, 84, 77, 0.35);
  color: #ed544d;
  box-shadow: 0 2px 12px rgba(237, 84, 77, 0.15);
}

.prompt-badge--unlocked {
  background: rgba(74, 222, 128, 0.15);
  border: 1px solid rgba(74, 222, 128, 0.3);
  color: #4ade80;
}

.gallery-card:hover .prompt-badge {
  transform: scale(1.05);
}

.gallery-card:hover .prompt-badge--locked {
  box-shadow: 0 4px 20px rgba(237, 84, 77, 0.25);
}
</style>
