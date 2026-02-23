<script setup lang="ts">
import { artworks, type Artwork } from '~/data/artworks'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const props = defineProps<{
  category: string
}>()

const lightbox = useLightbox()
const gridEl = ref<HTMLElement | null>(null)
let ctx: gsap.Context | null = null
let hasRevealed = false

const filteredArtworks = computed<Artwork[]>(() => {
  if (props.category === 'all') return artworks
  return artworks.filter((a) => a.category === props.category)
})

function openLightbox(index: number) {
  const items = filteredArtworks.value.map((a) => ({
    src: a.src,
    title: a.title,
    medium: a.medium,
  }))
  lightbox.open(items, index)
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
      start: 'top 85%',
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
    class="grid gap-6"
    style="grid-template-columns: repeat(auto-fill, minmax(300px, 1fr))"
  >
    <GalleryCard
      v-for="(artwork, index) in filteredArtworks"
      :key="artwork.id"
      :artwork="artwork"
      :index="index"
      class="gallery-card"
      @click="openLightbox(index)"
    />
  </div>
</template>
