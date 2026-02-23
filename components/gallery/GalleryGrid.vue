<script setup lang="ts">
import type { Artwork } from '~/types/artwork'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const props = defineProps<{
  category: string
  artworks: Artwork[]
}>()

const lightbox = useLightbox()
const gridEl = ref<HTMLElement | null>(null)
let ctx: gsap.Context | null = null
let hasRevealed = false

const filteredArtworks = computed<Artwork[]>(() => {
  if (props.category === 'all') return props.artworks
  return props.artworks.filter((a) => a.category === props.category)
})

function openLightbox(index: number) {
  const items = filteredArtworks.value.map((a) => ({
    id: a.id,
    src: a.src,
    title: a.title,
    medium: a.medium,
    description: a.description,
    year: a.year,
  }))
  lightbox.open(items, index)
}

// Masonry-style varied column spans for visual rhythm
// 15-item pattern: varied pairs, triple rows, featured items, cinematic finale
const spanPatterns = [
  'col-span-12 md:col-span-7',   // 1: The Watcher — dominant left
  'col-span-12 md:col-span-5',   // 2: Bloom of Decay — medium right
  'col-span-12 md:col-span-5',   // 3: Primal Scream — medium left
  'col-span-12 md:col-span-7',   // 4: Chromatic Grief — dominant right
  'col-span-12 md:col-span-4',   // 5: The Gathering — triple row
  'col-span-12 md:col-span-4',   // 6: Unspoken — triple row
  'col-span-12 md:col-span-4',   // 7: Peeling Away — triple row
  'col-span-12 md:col-span-8',   // 8: Metamorphosis — wide featured
  'col-span-12 md:col-span-4',   // 9: The Crossing — aside
  'col-span-12 md:col-span-6',   // 10: Red Sun Garden — balanced
  'col-span-12 md:col-span-6',   // 11: First Encounter — balanced
  'col-span-12 md:col-span-4',   // 12: Gorgon's Cry — triple row
  'col-span-12 md:col-span-4',   // 13: The Watchers — triple row
  'col-span-12 md:col-span-4',   // 14: The Executive — triple row
  'col-span-12',                  // 15: City Vortex — full-width cinematic
]

function getSpanClass(index: number): string {
  return spanPatterns[index % spanPatterns.length]
}

// Scroll velocity skew
let currentSkew = 0
const skewTarget = ref(0)

function setupVelocitySkew() {
  if (!gridEl.value) return
  try {
    const { $lenis } = useNuxtApp()
    if ($lenis) {
      ;($lenis as any).on('scroll', (e: any) => {
        const velocity = e.velocity || 0
        skewTarget.value = Math.max(-3, Math.min(3, velocity * 0.8))
      })
    }
  } catch {}

  // Smooth lerp the skew onto cards
  gsap.ticker.add(() => {
    currentSkew += (skewTarget.value - currentSkew) * 0.1
    skewTarget.value *= 0.95 // decay
    if (Math.abs(currentSkew) < 0.01) currentSkew = 0
    if (!gridEl.value) return
    const cards = gridEl.value.querySelectorAll('.gallery-card')
    cards.forEach((card) => {
      ;(card as HTMLElement).style.transform += '' // force reflow avoided by using gsap
    })
    gsap.set(cards, { skewY: currentSkew, force3D: true, overwrite: false })
  })
}

// Initial staggered entrance on scroll
onMounted(() => {
  if (!gridEl.value) return

  ctx = gsap.context(() => {
    const cards = gridEl.value!.querySelectorAll('.gallery-card')
    if (!cards.length) return

    gsap.set(cards, { opacity: 0, y: 60, scale: 0.92 })

    ScrollTrigger.create({
      trigger: gridEl.value!,
      start: 'top 90%',
      once: true,
      onEnter: () => {
        hasRevealed = true
        gsap.to(cards, {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          stagger: { each: 0.08, from: 'start' },
          ease: 'power3.out',
          force3D: true,
        })
      },
    })

    // Safety net: if ScrollTrigger hasn't fired after 2.5s, reveal cards anyway
    // This handles edge cases where the section is already in view on load
    setTimeout(() => {
      if (!hasRevealed) {
        hasRevealed = true
        gsap.to(cards, {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          stagger: { each: 0.08, from: 'start' },
          ease: 'power3.out',
          force3D: true,
        })
      }
    }, 2500)
  }, gridEl.value)

  // Only enable velocity skew on pointer devices
  if (window.matchMedia('(hover: hover)').matches) {
    setupVelocitySkew()
  }
})

// Animate filter changes
watch(
  () => props.category,
  async () => {
    if (!gridEl.value || !hasRevealed) return
    const cards = gridEl.value.querySelectorAll('.gallery-card')

    // Quick exit
    await gsap.to(cards, {
      opacity: 0,
      scale: 0.95,
      y: -20,
      duration: 0.25,
      stagger: 0.02,
      ease: 'power2.in',
    })

    // Wait a frame for Vue to re-render filtered list
    await nextTick()
    await nextTick()

    const newCards = gridEl.value!.querySelectorAll('.gallery-card')
    if (newCards.length) {
      gsap.set(newCards, { opacity: 0, y: 40, scale: 0.95 })
      gsap.to(newCards, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.5,
        stagger: { each: 0.06, from: 'start' },
        ease: 'power3.out',
        force3D: true,
      })
    }

    ScrollTrigger.refresh()
  },
)

onUnmounted(() => {
  ctx?.revert()
})
</script>

<template>
  <div
    ref="gridEl"
    class="grid grid-cols-12 gap-3 md:gap-5"
  >
    <GalleryCard
      v-for="(artwork, index) in filteredArtworks"
      :key="artwork.id"
      :artwork="artwork"
      :index="index"
      :full-width="getSpanClass(index) === 'col-span-12'"
      class="gallery-card"
      :class="getSpanClass(index)"
      @click="openLightbox(index)"
    />
  </div>
</template>
