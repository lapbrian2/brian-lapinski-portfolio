<script setup lang="ts">
import gsap from 'gsap'
import { useIsMobile, useReducedMotion } from '~/composables/useMediaQuery'
import type { SourceRect } from '~/composables/useLightbox'

const { artworks } = useArtworks()
const lightbox = useLightbox()
const isMobile = useIsMobile()
const reducedMotion = useReducedMotion()

const featured = computed(() => {
  const feat = artworks.value.filter((a) => a.featured)
  if (feat.length >= 4) return feat.slice(0, 8)
  return artworks.value.slice(0, 8)
})

const activeIndex = ref(0)
const stageEl = ref<HTMLElement | null>(null)
const cardEls = ref<HTMLElement[]>([])
const isTransitioning = ref(false)

// Navigation
function goTo(index: number) {
  const clamped = Math.max(0, Math.min(featured.value.length - 1, index))
  if (clamped === activeIndex.value || isTransitioning.value) return
  isTransitioning.value = true
  activeIndex.value = clamped
  animateCards()
}

function next() {
  if (activeIndex.value < featured.value.length - 1) {
    goTo(activeIndex.value + 1)
  } else {
    goTo(0) // wrap around
  }
}

function prev() {
  if (activeIndex.value > 0) {
    goTo(activeIndex.value - 1)
  } else {
    goTo(featured.value.length - 1) // wrap around
  }
}

function onCardClick(index: number) {
  if (index === activeIndex.value) {
    openLightbox(index)
  } else {
    goTo(index)
  }
}

function openLightbox(index: number) {
  const card = cardEls.value[index]
  let rect: SourceRect | null = null
  if (card) {
    const domRect = card.getBoundingClientRect()
    rect = {
      top: domRect.top,
      left: domRect.left,
      width: domRect.width,
      height: domRect.height,
      borderRadius: '12px',
    }
  }
  const items = featured.value.map((a) => ({
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

// 3D transform for each card based on offset from active
function getCardTransform(index: number) {
  const offset = index - activeIndex.value
  const absOffset = Math.abs(offset)
  const dir = offset < 0 ? -1 : offset > 0 ? 1 : 0

  if (absOffset > 3) {
    return { x: dir * 900, rotateY: dir * -60, z: -600, scale: 0.5, opacity: 0, zIndex: 1 }
  }

  if (absOffset === 0) {
    return { x: 0, rotateY: 0, z: 0, scale: 1, opacity: 1, zIndex: 10 }
  }

  // Flanking cards — stagger depth and rotation
  const xStep = 320
  const rotateStep = 40
  const zStep = 180
  const scaleStep = 0.12

  return {
    x: dir * (xStep * absOffset),
    rotateY: dir * (-rotateStep),
    z: -(zStep * absOffset),
    scale: Math.max(0.6, 1 - scaleStep * absOffset),
    opacity: Math.max(0, 1 - absOffset * 0.25),
    zIndex: 10 - absOffset,
  }
}

function animateCards() {
  const cards = cardEls.value
  if (!cards.length) return

  const tl = gsap.timeline({
    onComplete: () => { isTransitioning.value = false },
  })

  cards.forEach((card, i) => {
    if (!card) return
    const t = getCardTransform(i)
    tl.to(card, {
      x: t.x,
      rotateY: t.rotateY,
      z: t.z,
      scale: t.scale,
      opacity: t.opacity,
      zIndex: t.zIndex,
      duration: 0.6,
      ease: 'power3.out',
      force3D: true,
    }, 0)
  })
}

// Set initial positions
function initCards() {
  const cards = cardEls.value
  cards.forEach((card, i) => {
    if (!card) return
    const t = getCardTransform(i)
    gsap.set(card, {
      x: t.x,
      rotateY: t.rotateY,
      z: t.z,
      scale: t.scale,
      opacity: t.opacity,
      zIndex: t.zIndex,
      force3D: true,
    })
  })
}

// Keyboard navigation
function onKeydown(e: KeyboardEvent) {
  if (e.key === 'ArrowLeft') { e.preventDefault(); prev() }
  if (e.key === 'ArrowRight') { e.preventDefault(); next() }
}

// Auto-advance timer
let autoTimer: ReturnType<typeof setInterval> | null = null

function startAuto() {
  stopAuto()
  autoTimer = setInterval(next, 5000)
}

function stopAuto() {
  if (autoTimer) { clearInterval(autoTimer); autoTimer = null }
}

onMounted(() => {
  nextTick(() => {
    initCards()
    startAuto()
  })
})

onUnmounted(() => {
  stopAuto()
})
</script>

<template>
  <section
    v-if="featured.length >= 3"
    class="carousel-section overflow-hidden"
    @keydown="onKeydown"
    tabindex="0"
    @mouseenter="stopAuto"
    @mouseleave="startAuto"
  >
    <!-- Heading -->
    <div class="max-w-7xl mx-auto px-6 md:px-12 pt-12 pb-4 text-center">
      <p class="font-body text-xs uppercase tracking-[0.3em] text-accent-red mb-4">
        Featured Works
      </p>
      <h2 class="font-display font-bold text-lavender-100 leading-none carousel-heading">
        The Collection
      </h2>
    </div>

    <!-- Desktop: 3D Coverflow Carousel -->
    <div v-if="!isMobile" class="carousel-viewport relative">
      <div ref="stageEl" class="carousel-stage">
        <div
          v-for="(artwork, index) in featured"
          :key="artwork.id"
          :ref="(el) => { if (el) cardEls[index] = el as HTMLElement }"
          class="carousel-card group"
          :class="{ 'is-active': index === activeIndex }"
          role="button"
          :tabindex="index === activeIndex ? 0 : -1"
          :aria-label="index === activeIndex ? `View ${artwork.title}` : artwork.title"
          @click="onCardClick(index)"
        >
          <img
            :src="artwork.src"
            :alt="artwork.title"
            class="absolute inset-0 w-full h-full object-cover transition-transform duration-700"
            :class="index === activeIndex ? 'group-hover:scale-105' : ''"
            loading="lazy"
            draggable="false"
          />

          <!-- Bottom overlay -->
          <div
            class="absolute inset-x-0 bottom-0 pointer-events-none z-[3]"
            :style="{
              background: `linear-gradient(to top, ${artwork.dominantColor || '#000000'}cc 0%, ${artwork.dominantColor || '#000000'}40 50%, transparent 100%)`,
            }"
          >
            <div class="px-5 pt-14 pb-5">
              <h3 class="font-display text-lg text-lavender-100 leading-tight">
                {{ artwork.title }}
              </h3>
              <p class="text-xs text-lavender-400 mt-1.5 uppercase tracking-wide">
                {{ artwork.medium }} &middot; {{ artwork.year }}
              </p>
            </div>
          </div>

          <!-- View indicator on active card -->
          <div
            v-if="index === activeIndex"
            class="absolute top-4 right-4 z-[4] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          >
            <span class="w-9 h-9 rounded-full border border-lavender-400/30 flex items-center justify-center text-lavender-300 bg-dark-900/50 backdrop-blur-sm">
              <svg width="14" height="14" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
                <line x1="2" y1="10" x2="10" y2="2" />
                <polyline points="4 2 10 2 10 8" />
              </svg>
            </span>
          </div>
        </div>
      </div>

      <!-- Navigation arrows -->
      <button
        class="carousel-nav carousel-nav--prev"
        aria-label="Previous artwork"
        @click="prev"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="13 4 7 10 13 16" />
        </svg>
      </button>
      <button
        class="carousel-nav carousel-nav--next"
        aria-label="Next artwork"
        @click="next"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="7 4 13 10 7 16" />
        </svg>
      </button>

      <!-- Dot indicators -->
      <div class="flex items-center justify-center gap-2 mt-6 pb-4">
        <button
          v-for="(_, i) in featured"
          :key="i"
          class="carousel-dot"
          :class="{ 'is-active': i === activeIndex }"
          :aria-label="`Go to artwork ${i + 1}`"
          @click="goTo(i)"
        />
      </div>
    </div>

    <!-- Mobile: Horizontal swipe strip -->
    <div v-else class="px-4 pb-12">
      <div class="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 -mx-4 px-4 scrollbar-hide">
        <div
          v-for="(artwork, index) in featured"
          :key="artwork.id"
          class="snap-center flex-shrink-0 relative overflow-hidden rounded-xl cursor-pointer"
          style="width: 75vw; max-width: 320px; height: 420px"
          role="button"
          :tabindex="0"
          :aria-label="`View ${artwork.title}`"
          @click="openLightbox(index)"
          @keydown.enter="openLightbox(index)"
          @keydown.space.prevent="openLightbox(index)"
        >
          <img
            :src="artwork.src"
            :alt="artwork.title"
            class="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
          />
          <div
            class="absolute inset-x-0 bottom-0 pointer-events-none"
            :style="{
              background: `linear-gradient(to top, ${artwork.dominantColor || '#000000'}cc 0%, transparent 100%)`,
            }"
          >
            <div class="px-4 pt-8 pb-4">
              <h3 class="font-display text-base text-lavender-100 leading-tight">
                {{ artwork.title }}
              </h3>
              <p class="text-[10px] text-lavender-400 mt-1 uppercase tracking-wide">
                {{ artwork.medium }} &middot; {{ artwork.year }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.carousel-section {
  outline: none;
}

.carousel-heading {
  font-size: clamp(2.5rem, 6vw, 5rem);
  letter-spacing: -0.03em;
}

/* Viewport constrains the 3D space */
.carousel-viewport {
  padding: 2rem 0 0;
}

.carousel-stage {
  position: relative;
  width: 100%;
  height: clamp(400px, 52vh, 560px);
  perspective: 1200px;
  perspective-origin: 50% 50%;
}

/* Each card is absolutely positioned, GSAP handles transforms */
.carousel-card {
  position: absolute;
  left: 50%;
  top: 50%;
  width: clamp(300px, 28vw, 420px);
  height: clamp(380px, 48vh, 530px);
  margin-left: calc(clamp(300px, 28vw, 420px) / -2);
  margin-top: calc(clamp(380px, 48vh, 530px) / -2);
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transform-style: preserve-3d;
  backface-visibility: hidden;
  will-change: transform, opacity;
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.4);
  transition: box-shadow 0.4s ease;
}

.carousel-card.is-active {
  box-shadow: 0 16px 60px rgba(0, 0, 0, 0.6), 0 0 40px rgba(237, 84, 77, 0.08);
}

.carousel-card:not(.is-active) {
  cursor: pointer;
}

/* Navigation arrows */
.carousel-nav {
  position: absolute;
  top: 50%;
  transform: translateY(calc(-50% - 1rem));
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 1px solid rgba(201, 210, 231, 0.12);
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(8px);
  color: rgba(218, 226, 242, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 20;
}

.carousel-nav:hover {
  border-color: rgba(237, 84, 77, 0.4);
  color: #ed544d;
  background: rgba(0, 0, 0, 0.7);
}

.carousel-nav--prev {
  left: max(1rem, 4vw);
}

.carousel-nav--next {
  right: max(1rem, 4vw);
}

/* Dot indicators */
.carousel-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(201, 210, 231, 0.15);
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 0;
}

.carousel-dot:hover {
  background: rgba(201, 210, 231, 0.3);
}

.carousel-dot.is-active {
  background: #ed544d;
  width: 24px;
  border-radius: 4px;
}

/* Mobile scrollbar hide */
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>
