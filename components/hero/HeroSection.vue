<script setup lang="ts">
import gsap from 'gsap'

defineProps<{
  ready?: boolean
}>()

// Hero artwork cycle — 4 signature pieces as immersive background
const heroImages = [
  '/images/artworks/the-watcher.webp',
  '/images/artworks/bloom-of-decay.webp',
  '/images/artworks/metamorphosis.webp',
  '/images/artworks/the-crossing.webp',
]

const activeIndex = ref(0)
const imgEls = ref<HTMLElement[]>([])
let cycleTl: gsap.core.Timeline | null = null
let kenBurnsTween: gsap.core.Tween | null = null

onMounted(() => {
  if (imgEls.value.length < 2) return

  // Set initial state: first image visible, rest hidden
  imgEls.value.forEach((el, i) => {
    gsap.set(el, { opacity: i === 0 ? 0.4 : 0, scale: 1 })
  })

  // Ken Burns on first image — fast zoom to feel alive
  kenBurnsTween = gsap.to(imgEls.value[0], { scale: 1.1, duration: 2.5, ease: 'none' })

  // Start crossfade cycle — rapid fire, no dead time
  const scheduleNext = () => {
    cycleTl = gsap.timeline()
    cycleTl.call(crossfade, [], '+=0.8')
  }

  const crossfade = () => {
    const current = activeIndex.value
    const next = (current + 1) % heroImages.length
    const currentEl = imgEls.value[current]
    const nextEl = imgEls.value[next]
    if (!currentEl || !nextEl) return

    // Reset next image scale
    gsap.set(nextEl, { scale: 1, opacity: 0 })

    const tl = gsap.timeline({
      onComplete: () => {
        activeIndex.value = next
        scheduleNext()
      },
    })

    // Crossfade — rapid, almost overlapping
    tl.to(currentEl, { opacity: 0, duration: 0.6, ease: 'power2.inOut' }, 0)
    tl.to(nextEl, { opacity: 0.45, duration: 0.6, ease: 'power2.inOut' }, 0)
    // Ken Burns on incoming image
    tl.to(nextEl, { scale: 1.1, duration: 2.5, ease: 'none' }, 0)
  }

  scheduleNext()
})

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
        class="absolute inset-0 w-full h-full object-cover will-change-transform"
        style="opacity: 0"
        loading="eager"
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
      <HeroText :ready="ready" />
    </div>

    <!-- Scroll indicator pinned to bottom center -->
    <div class="absolute bottom-10 left-1/2 -translate-x-1/2 z-20">
      <ScrollIndicator />
    </div>
  </section>
</template>

<style scoped>
.hero-overlay {
  background:
    linear-gradient(to bottom,
      rgba(24, 21, 32, 0.7) 0%,
      rgba(24, 21, 32, 0.3) 35%,
      rgba(24, 21, 32, 0.25) 50%,
      rgba(24, 21, 32, 0.4) 70%,
      rgba(24, 21, 32, 0.85) 100%
    );
}

.hero-glow {
  background:
    radial-gradient(ellipse 60% 50% at 25% 35%, rgba(237, 84, 77, 0.04) 0%, transparent 60%),
    radial-gradient(ellipse 50% 60% at 75% 65%, rgba(0, 122, 255, 0.025) 0%, transparent 60%);
}
</style>
