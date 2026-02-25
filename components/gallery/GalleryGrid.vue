<script setup lang="ts">
import type { Artwork } from '~/types/artwork'
import type { SourceRect } from '~/composables/useLightbox'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useReducedMotion } from '~/composables/useMediaQuery'

const props = defineProps<{
  category: string
  artworks: Artwork[]
}>()

const lightbox = useLightbox()
const reducedMotion = useReducedMotion()
const gridEl = ref<HTMLElement | null>(null)
let ctx: gsap.Context | null = null
let hasRevealed = false
let currentFilterTween: gsap.core.Tween | null = null

const filteredArtworks = computed<Artwork[]>(() => {
  if (props.category === 'all') return props.artworks
  return props.artworks.filter((a) => a.category === props.category)
})

function openLightbox(index: number, rect: SourceRect | null) {
  const items = filteredArtworks.value.map((a) => ({
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
  }))
  lightbox.open(items, index, rect)
}

// Masonry-style varied column spans for visual rhythm
// 12-item pattern tuned for the homepage selected works
const spanPatterns = [
  'col-span-12 md:col-span-7',   // 1: The Watcher — dominant left
  'col-span-12 md:col-span-5',   // 2: Bloom of Decay — medium right
  'col-span-12 md:col-span-5',   // 3: The Nobleman — medium left
  'col-span-12 md:col-span-7',   // 4: Primal Scream — dominant right
  'col-span-12 md:col-span-4',   // 5: The Gathering — triple row
  'col-span-12 md:col-span-4',   // 6: Metamorphosis — triple row
  'col-span-12 md:col-span-4',   // 7: The Crossing — triple row
  'col-span-12 md:col-span-6',   // 8: Gorgon's Cry — balanced pair
  'col-span-12 md:col-span-6',   // 9: First Encounter — balanced pair
  'col-span-12 md:col-span-4',   // 10: The Offering — triple row
  'col-span-12 md:col-span-4',   // 11: Red Sun Garden — triple row
  'col-span-12 md:col-span-4',   // 12: City Vortex — triple row
]

function getSpanClass(index: number): string {
  return spanPatterns[index % spanPatterns.length]
}

// Scroll velocity skew
let currentSkew = 0
const skewTarget = ref(0)
let skewTickerFn: (() => void) | null = null
let lenisScrollHandler: ((e: any) => void) | null = null
let lenisInstance: any = null

function setupVelocitySkew() {
  if (!gridEl.value) return
  try {
    const { $lenis } = useNuxtApp()
    if ($lenis) {
      lenisInstance = $lenis
      lenisScrollHandler = (e: any) => {
        const velocity = e.velocity || 0
        skewTarget.value = Math.max(-3, Math.min(3, velocity * 0.8))
      }
      ;($lenis as any).on('scroll', lenisScrollHandler)
    }
  } catch {}

  // Smooth lerp the skew onto cards
  skewTickerFn = () => {
    currentSkew += (skewTarget.value - currentSkew) * 0.1
    skewTarget.value *= 0.95 // decay
    if (Math.abs(currentSkew) < 0.01) currentSkew = 0
    if (!gridEl.value) return
    const cards = gridEl.value.querySelectorAll('.gallery-card')
    gsap.set(cards, { skewY: currentSkew, force3D: true })
  }
  gsap.ticker.add(skewTickerFn)
}

// Initial staggered entrance on scroll
onMounted(() => {
  if (!gridEl.value) return

  // Respect reduced-motion preference — show all content immediately
  if (reducedMotion.value) {
    hasRevealed = true
    return
  }

  ctx = gsap.context(() => {
    const cards = gridEl.value!.querySelectorAll('.gallery-card')
    if (!cards.length) return

    // Clip-path curtain reveal — each card unveils like a curtain
    gsap.set(cards, { clipPath: 'inset(100% 0 0 0)', opacity: 1 })

    // Inner images counter-move for parallax unmask
    const imgs = gridEl.value!.querySelectorAll('.card-img')
    gsap.set(imgs, { y: 40 })

    const revealCards = () => {
      hasRevealed = true
      gsap.to(cards, {
        clipPath: 'inset(0% 0 0 0)',
        duration: 1,
        stagger: { each: 0.1, from: 'start' },
        ease: 'power3.inOut',
        force3D: true,
      })
      // Image slides up as the frame opens
      gsap.to(imgs, {
        y: 0,
        duration: 1.2,
        stagger: { each: 0.1, from: 'start' },
        ease: 'power3.out',
        force3D: true,
      })
    }

    ScrollTrigger.create({
      trigger: gridEl.value!,
      start: 'top 90%',
      once: true,
      onEnter: revealCards,
    })

    // Safety net: if ScrollTrigger hasn't fired after 2.5s, reveal cards anyway
    setTimeout(() => {
      if (!hasRevealed) revealCards()
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

    // Kill any in-progress filter animation to prevent stacking
    if (currentFilterTween) {
      currentFilterTween.kill()
      currentFilterTween = null
    }

    const cards = gridEl.value.querySelectorAll('.gallery-card')

    // Quick exit — curtain closes upward
    // gsap.to returns a Tween, not a Promise, so wrap in a real Promise
    await new Promise<void>((resolve) => {
      currentFilterTween = gsap.to(cards, {
        clipPath: 'inset(0 0 100% 0)',
        duration: 0.35,
        stagger: 0.03,
        ease: 'power2.in',
        onComplete: resolve,
      })
    })

    currentFilterTween = null

    // Wait a frame for Vue to re-render filtered list
    await nextTick()
    await nextTick()

    const newCards = gridEl.value!.querySelectorAll('.gallery-card')
    if (newCards.length) {
      const newImgs = gridEl.value!.querySelectorAll('.card-img')
      gsap.set(newCards, { clipPath: 'inset(100% 0 0 0)', opacity: 1 })
      gsap.set(newImgs, { y: 30 })
      currentFilterTween = gsap.to(newCards, {
        clipPath: 'inset(0% 0 0 0)',
        duration: 0.7,
        stagger: { each: 0.06, from: 'start' },
        ease: 'power3.inOut',
        force3D: true,
        overwrite: 'auto',
      })
      gsap.to(newImgs, {
        y: 0,
        duration: 0.9,
        stagger: { each: 0.06, from: 'start' },
        ease: 'power3.out',
        force3D: true,
        overwrite: 'auto',
      })
    }

    ScrollTrigger.refresh()
  },
)

onUnmounted(() => {
  if (currentFilterTween) {
    currentFilterTween.kill()
    currentFilterTween = null
  }
  if (skewTickerFn) gsap.ticker.remove(skewTickerFn)
  if (lenisScrollHandler && lenisInstance) {
    lenisInstance.off('scroll', lenisScrollHandler)
  }
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
      @click="openLightbox(index, $event)"
    />
  </div>
</template>
