<script setup lang="ts">
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useIsMobile, useReducedMotion } from '~/composables/useMediaQuery'
import { useArtworks } from '~/composables/useArtworks'

const sectionEl = ref<HTMLElement | null>(null)
const scrollWrapperEl = ref<HTMLElement | null>(null)
const imageEl = ref<HTMLElement | null>(null)
const textEl = ref<HTMLElement | null>(null)
const isMobile = useIsMobile()
const reducedMotion = useReducedMotion()
let ctx: gsap.Context | null = null
let xTo: gsap.QuickToFunc | null = null
let yTo: gsap.QuickToFunc | null = null

// Data-driven showcase: feature leviathan (unique to this section), fall back to static
const { artworks } = useArtworks()
const staticFallback = {
  title: 'Leviathan',
  medium: 'Midjourney · 2025',
  description: 'A diver with a single light encounters the mouth of something vast and dark — the sublime terror of being small in an enormous world.',
  src: '/images/artworks/leviathan.webp',
}
const showcase = computed(() => {
  const found = artworks.value.find(a => a.id === 'leviathan')
    || artworks.value.find(a => a.featured)
  if (found) {
    return {
      title: found.title,
      medium: `${found.medium} · ${found.year}`,
      description: found.description,
      src: found.src,
    }
  }
  return staticFallback
})

// Mouse-driven depth parallax — image follows cursor subtly
function onMouseMove(e: MouseEvent) {
  if (!sectionEl.value || !xTo || !yTo) return
  const rect = sectionEl.value.getBoundingClientRect()
  const nx = (e.clientX - rect.left) / rect.width - 0.5
  const ny = (e.clientY - rect.top) / rect.height - 0.5
  xTo(nx * -20)
  yTo(ny * -15)
}

onMounted(() => {
  if (!sectionEl.value || !scrollWrapperEl.value || !imageEl.value || !textEl.value) return

  // Respect reduced-motion preference
  if (reducedMotion.value) return

  ctx = gsap.context(() => {
    // Scroll parallax — applied to wrapper so it doesn't conflict with mouse offset
    gsap.fromTo(scrollWrapperEl.value!, { scale: 1.15, y: '-8%' }, {
      scale: 1,
      y: '8%',
      ease: 'none',
      scrollTrigger: {
        trigger: sectionEl.value!,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
      },
    })

    // Mouse-driven depth — image shifts subtly with cursor (desktop only)
    if (!isMobile.value) {
      xTo = gsap.quickTo(imageEl.value!, 'x', { duration: 0.8, ease: 'power2.out' })
      yTo = gsap.quickTo(imageEl.value!, 'y', { duration: 0.8, ease: 'power2.out' })
    }

    // Text elements reveal as section enters viewport
    const textChildren = textEl.value!.children
    gsap.fromTo(textChildren, { x: -40, opacity: 0 }, {
      x: 0,
      opacity: 1,
      stagger: 0.08,
      ease: 'none',
      scrollTrigger: {
        trigger: sectionEl.value!,
        start: 'top 70%',
        end: 'top 20%',
        scrub: 1,
      },
    })
  }, sectionEl.value)
})

onUnmounted(() => {
  xTo = null
  yTo = null
  ctx?.revert()
})
</script>

<template>
  <section
    id="work"
    ref="sectionEl"
    class="relative h-screen w-full overflow-hidden"
    @mousemove="onMouseMove"
  >
    <!-- Full-viewport image: outer wrapper for scroll parallax, inner img for mouse depth -->
    <div class="absolute inset-0">
      <div ref="scrollWrapperEl" class="showcase-scroll-wrapper absolute will-change-transform">
        <img
          ref="imageEl"
          :src="showcase.src"
          :alt="showcase.title"
          class="w-full h-full object-cover will-change-transform"
          loading="lazy"
          draggable="false"
        />
      </div>
    </div>

    <!-- Gradient overlays for text legibility -->
    <div class="absolute inset-0 bg-gradient-to-r from-dark-900/80 via-dark-900/30 to-transparent pointer-events-none" />
    <div class="absolute inset-0 bg-gradient-to-t from-dark-900/70 via-transparent to-dark-900/40 pointer-events-none" />

    <!-- Text content — left-aligned, vertically centered -->
    <div ref="textEl" class="absolute inset-0 flex flex-col justify-center px-8 md:px-16 lg:px-24 max-w-3xl">
      <p class="font-body text-xs uppercase tracking-[0.2em] text-lavender-300 mb-4">
        Featured Work
      </p>
      <h2 class="font-display text-4xl md:text-6xl lg:text-7xl font-bold text-lavender-100 leading-none mb-6">
        {{ showcase.title }}
      </h2>
      <p class="font-body text-sm md:text-base text-lavender-300/80 max-w-lg leading-relaxed mb-4">
        {{ showcase.description }}
      </p>
      <p class="font-body text-xs uppercase tracking-[0.15em] text-lavender-400/50">
        {{ showcase.medium }}
      </p>
    </div>
  </section>
</template>

<style scoped>
/* Oversized wrapper gives scroll + mouse parallax room without clipping */
.showcase-scroll-wrapper {
  inset: -5%;
  width: 110%;
  height: 110%;
}
</style>
