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
    likeCount: a.likeCount,
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

// Depth-based parallax intensity — larger cards move less (farther away), smaller ones move more (closer)
function getParallaxDepth(index: number): number {
  const span = spanPatterns[index % spanPatterns.length]
  if (span.includes('col-span-7')) return 25   // dominant: slow, far
  if (span.includes('col-span-6')) return 30   // balanced: medium
  if (span.includes('col-span-5')) return 35   // medium: mid-depth
  if (span.includes('col-span-4')) return 45   // small triple: fast, close
  return 30
}

// Scroll velocity skew (extracted composable)
const velocitySkew = useVelocitySkew(gridEl, '.gallery-card')

// Initial staggered entrance on scroll + depth parallax layers
onMounted(() => {
  if (!gridEl.value) return

  // Respect reduced-motion preference — show all content immediately
  if (reducedMotion.value) {
    hasRevealed = true
    return
  }

  const canHover = window.matchMedia('(hover: hover)').matches

  ctx = gsap.context(() => {
    const cards = gridEl.value!.querySelectorAll<HTMLElement>('.gallery-card')
    if (!cards.length) return

    // Clip-path curtain reveal — each card unveils like a curtain
    gsap.set(cards, { clipPath: 'inset(100% 0 0 0)', opacity: 1 })

    // Inner images counter-move for parallax unmask
    const imgs = gridEl.value!.querySelectorAll<HTMLElement>('.card-img')
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

    // Depth-based parallax layers (desktop only)
    // Each card scrolls at a different speed based on its column span —
    // creating a sense of traveling through layered depth
    if (canHover) {
      cards.forEach((card, i) => {
        const depth = getParallaxDepth(i)
        const direction = i % 2 === 0 ? 1 : -1

        gsap.to(card, {
          y: direction * depth,
          ease: 'none',
          force3D: true,
          scrollTrigger: {
            trigger: card,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        })

        // Inner image counter-parallax — "window into depth" effect
        const img = card.querySelector('.card-img')
        if (img) {
          gsap.fromTo(img,
            { y: '-6%' },
            {
              y: '6%',
              ease: 'none',
              force3D: true,
              scrollTrigger: {
                trigger: card,
                start: 'top bottom',
                end: 'bottom top',
                scrub: true,
              },
            },
          )
        }
      })
    }
  }, gridEl.value)

  // Only enable velocity skew on pointer devices
  if (canHover) {
    velocitySkew.setup()
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
  velocitySkew.cleanup()
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
