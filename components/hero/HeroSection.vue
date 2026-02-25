<script setup lang="ts">
import gsap from 'gsap'

const props = defineProps<{
  ready?: boolean
}>()

// Hero artwork cycle — 4 signature pieces as immersive background
const heroImages = [
  '/images/artworks/the-watcher.webp',
  '/images/artworks/bloom-of-decay.webp',
  '/images/artworks/metamorphosis.webp',
  '/images/artworks/the-crossing.webp',
]

// Preload only the first hero image — subsequent images load lazily as needed
useHead({
  link: [
    {
      rel: 'preload',
      as: 'image',
      href: heroImages[0],
    },
  ],
})

const emit = defineEmits<{
  'first-frame-ready': []
}>()

const heroTextDone = ref(false)

const activeIndex = ref(0)
const imgEls = ref<HTMLElement[]>([])
let cycleTl: gsap.core.Timeline | null = null
let kenBurnsTween: gsap.core.Tween | null = null
let cycleStarted = false
let firstFrameShown = false

// Phase A: Immediately bring the first image to target opacity (no Ken Burns yet).
// This runs as soon as the loader signals bridge-ready, giving the hero a visible
// background before the loader's curtain wipe reveals it.
function showFirstImage(): void {
  if (firstFrameShown || imgEls.value.length < 2) return
  firstFrameShown = true

  imgEls.value.forEach((el, i) => {
    gsap.set(el, { opacity: 0, scale: 1 })
  })

  gsap.to(imgEls.value[0], {
    opacity: 0.55,
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

  // Ken Burns on first image — fast zoom to feel alive
  kenBurnsTween = gsap.to(imgEls.value[0], { scale: 1.1, duration: 2.5, ease: 'none', force3D: true })

  const scheduleNext = () => {
    cycleTl = gsap.timeline()
    cycleTl.call(crossfade, [], '+=2.0')
  }

  const crossfade = () => {
    const current = activeIndex.value
    const next = (current + 1) % heroImages.length
    const currentEl = imgEls.value[current]
    const nextEl = imgEls.value[next]
    if (!currentEl || !nextEl) return

    gsap.set(nextEl, { scale: 1, opacity: 0 })

    const tl = gsap.timeline({
      onComplete: () => {
        activeIndex.value = next
        scheduleNext()
      },
    })

    tl.to(currentEl, { opacity: 0, duration: 0.6, ease: 'power2.inOut' }, 0)
    tl.to(nextEl, { opacity: 0.55, duration: 0.6, ease: 'power2.inOut' }, 0)
    tl.to(nextEl, { scale: 1.1, duration: 2.5, ease: 'none', force3D: true }, 0)
  }

  scheduleNext()
}

// When ready flips to true, show the first image immediately,
// then kick off Ken Burns + crossfade cycle after a short beat.
watch(() => props.ready, (isReady) => {
  if (!isReady) return
  showFirstImage()
  setTimeout(startCycle, 400)
}, { immediate: true })

onUnmounted(() => {
  cycleTl?.kill()
  kenBurnsTween?.kill()
})
</script>

<template>
  <section class="hero-section relative h-screen w-full overflow-hidden bg-dark-900">
    <!-- Artwork background layer — crossfading Ken Burns cycle -->
    <div class="absolute inset-0 z-[1]">
      <img
        v-for="(src, i) in heroImages"
        :key="src"
        :ref="(el) => { if (el) imgEls[i] = el as HTMLElement }"
        :src="src"
        alt=""
        class="absolute inset-0 w-full h-full object-cover hero-img"
        style="opacity: 0"
        :loading="i === 0 ? 'eager' : 'lazy'"
        draggable="false"
      />
    </div>

    <!-- Gradient overlay — protects text legibility -->
    <div class="absolute inset-0 z-[2] pointer-events-none hero-overlay" />

    <!-- Ambient gradient orbs — subtle color accents on top -->
    <div class="hero-glow absolute inset-0 z-[3] pointer-events-none" />

    <!-- Horizontal rule accent — thin line at ~70% down -->
    <div class="absolute left-0 right-0 z-10 pointer-events-none" style="top: 68%">
      <div class="hero-rule mx-auto h-px max-w-[200px] bg-gradient-to-r from-transparent via-lavender-400/15 to-transparent" />
    </div>

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
      rgba(24, 21, 32, 0.7) 0%,
      rgba(24, 21, 32, 0.35) 35%,
      rgba(24, 21, 32, 0.3) 50%,
      rgba(24, 21, 32, 0.45) 70%,
      rgba(24, 21, 32, 0.85) 100%
    );
}

.hero-glow {
  background:
    radial-gradient(ellipse 60% 50% at 25% 35%, rgba(237, 84, 77, 0.04) 0%, transparent 60%),
    radial-gradient(ellipse 50% 60% at 75% 65%, rgba(0, 122, 255, 0.025) 0%, transparent 60%);
}
</style>
