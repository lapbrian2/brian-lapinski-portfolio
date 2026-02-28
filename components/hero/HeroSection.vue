<script setup lang="ts">
import gsap from 'gsap'
import { useReducedMotion } from '~/composables/useMediaQuery'

const props = defineProps<{
  ready?: boolean
}>()

// Hero artwork cycle — 4 diverse pieces spanning every style
const heroImages = [
  { src: '/images/artworks/red-shift.webp', alt: 'Red Shift — cyberpunk motorcycle in neon cityscape' },
  { src: '/images/artworks/silk-valley.webp', alt: 'Silk Valley — misty mountain landscape draped in golden light' },
  { src: '/images/artworks/the-deep.webp', alt: 'The Deep — explorer in bioluminescent underwater cavern' },
  { src: '/images/artworks/the-threshold.webp', alt: 'The Threshold — figure standing before a luminous gateway' },
]

// Preload only the first hero image — subsequent images load lazily as needed
useHead({
  link: [
    {
      rel: 'preload',
      as: 'image',
      href: heroImages[0].src,
    },
  ],
})

const emit = defineEmits<{
  'first-frame-ready': []
}>()

const heroTextDone = ref(false)

const prefersReducedMotion = useReducedMotion()
const activeIndex = ref(0)
const imgEls = ref<HTMLElement[]>([])
let cycleTl: gsap.core.Timeline | null = null
let kenBurnsTween: gsap.core.Tween | null = null
let cycleStarted = false
let firstFrameShown = false
let cycleTimeout: ReturnType<typeof setTimeout> | null = null
let crossfadeTl: gsap.core.Timeline | null = null

// Phase A: Immediately bring the first image to target opacity (no Ken Burns yet).
// This runs as soon as the loader signals bridge-ready, giving the hero a visible
// background before the loader's curtain wipe reveals it.
function showFirstImage(): void {
  if (firstFrameShown || imgEls.value.length < 2) return
  firstFrameShown = true

  if (!imgEls.value?.length) return
  imgEls.value.forEach((el, i) => {
    gsap.set(el, { opacity: 0, scale: 1 })
  })

  gsap.to(imgEls.value[0], {
    opacity: 0.65,
    duration: 0.3,
    ease: 'power2.out',
    onComplete: () => emit('first-frame-ready'),
  })
}

// Phase B: Start the Ken Burns zoom and crossfade cycle.
// Called shortly after the first frame is visible.
function startCycle(): void {
  if (cycleStarted || imgEls.value.length < 2) return
  cycleStarted = true

  // Ken Burns on first image — quick zoom to feel alive
  kenBurnsTween = gsap.to(imgEls.value[0], { scale: 1.08, duration: 1.6, ease: 'none', force3D: true })

  const scheduleNext = () => {
    cycleTl = gsap.timeline()
    cycleTl.call(crossfade, [], '+=1.0')
  }

  const crossfade = () => {
    const current = activeIndex.value
    const next = (current + 1) % heroImages.length
    const currentEl = imgEls.value[current]
    const nextEl = imgEls.value[next]
    if (!currentEl || !nextEl) return

    crossfadeTl?.kill()
    gsap.set(nextEl, { scale: 1, opacity: 0 })

    crossfadeTl = gsap.timeline({
      onComplete: () => {
        activeIndex.value = next
        scheduleNext()
      },
    })

    crossfadeTl.to(currentEl, { opacity: 0, duration: 0.5, ease: 'power2.inOut' }, 0)
    crossfadeTl.to(nextEl, { opacity: 0.65, duration: 0.5, ease: 'power2.inOut' }, 0)
    crossfadeTl.to(nextEl, { scale: 1.08, duration: 1.6, ease: 'none', force3D: true }, 0)
  }

  scheduleNext()
}

// When ready flips to true, show the first image immediately,
// then kick off Ken Burns + crossfade cycle after a short beat
// (skip cycle entirely for reduced-motion users — just show static image).
function tryStart(): void {
  if (!props.ready || imgEls.value.length < 2) return
  showFirstImage()
  if (!prefersReducedMotion.value) {
    cycleTimeout = setTimeout(startCycle, 400)
  }
}

// Watch both ready prop and imgEls population — for returning visitors,
// ready becomes true before refs are assigned, so we need both triggers
watch(() => props.ready, tryStart, { immediate: true })
watch(() => imgEls.value.length, tryStart)

onUnmounted(() => {
  if (cycleTimeout) clearTimeout(cycleTimeout)
  crossfadeTl?.kill()
  cycleTl?.kill()
  kenBurnsTween?.kill()
})
</script>

<template>
  <section class="hero-section relative h-screen w-full overflow-hidden bg-dark-900">
    <!-- Artwork background layer — crossfading Ken Burns cycle -->
    <div class="absolute inset-0 z-[1]">
      <img
        v-for="(img, i) in heroImages"
        :key="img.src"
        :ref="(el) => { if (el) imgEls[i] = el as HTMLElement }"
        :src="img.src"
        :alt="img.alt"
        class="absolute inset-0 w-full h-full object-cover hero-img"
        style="opacity: 0"
        :loading="i === 0 ? 'eager' : 'lazy'"
        :fetchpriority="i === 0 ? 'high' : undefined"
        decoding="async"
        draggable="false"
      />
    </div>

    <!-- Gradient overlay — protects text legibility -->
    <div class="absolute inset-0 z-[2] pointer-events-none hero-overlay" />

    <!-- Ambient gradient orbs — subtle color accents on top -->
    <div class="hero-glow absolute inset-0 z-[3] pointer-events-none" />

    <!-- Text overlay -->
    <div class="absolute inset-0 z-20 flex items-center justify-center">
      <HeroText :ready="ready" style="text-shadow: 0 2px 20px rgba(0,0,0,0.5)" @entrance-complete="heroTextDone = true" />
    </div>

    <!-- Scroll indicator pinned to bottom center -->
    <div class="absolute bottom-10 left-1/2 -translate-x-1/2 z-20">
      <ScrollIndicator :ready="heroTextDone" />
    </div>
  </section>
</template>

<style scoped>
.hero-img {
  will-change: transform, opacity;
}

.hero-overlay {
  background:
    linear-gradient(to bottom,
      rgba(0, 0, 0, 0.72) 0%,
      rgba(0, 0, 0, 0.4) 30%,
      rgba(0, 0, 0, 0.38) 50%,
      rgba(0, 0, 0, 0.5) 70%,
      rgba(0, 0, 0, 0.88) 100%
    );
}

.hero-glow {
  background:
    radial-gradient(ellipse 60% 50% at 25% 35%, rgba(237, 84, 77, 0.04) 0%, transparent 60%),
    radial-gradient(ellipse 50% 60% at 75% 65%, rgba(0, 122, 255, 0.025) 0%, transparent 60%);
}
</style>
