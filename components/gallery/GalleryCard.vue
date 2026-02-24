<script setup lang="ts">
import type { Artwork } from '~/types/artwork'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const props = withDefaults(defineProps<{
  artwork: Artwork
  index: number
  fullWidth?: boolean
}>(), {
  fullWidth: false,
})

defineEmits<{
  click: []
}>()

const aspectClasses: Record<Artwork['aspect'], string> = {
  tall: 'aspect-[3/4]',
  wide: 'aspect-[4/3]',
  square: 'aspect-square',
}

const imgLoaded = ref(false)
const cardEl = ref<HTMLElement | null>(null)
const overlayEl = ref<HTMLElement | null>(null)
const titleEl = ref<HTMLElement | null>(null)
const mediumEl = ref<HTMLElement | null>(null)

let ctx: gsap.Context | null = null

onMounted(() => {
  if (!cardEl.value) return

  // Safety: force imgLoaded after timeout in case @load doesn't fire (SSR hydration edge case)
  setTimeout(() => {
    if (!imgLoaded.value) imgLoaded.value = true
  }, 3000)

  // Only enable magnetic + parallax on pointer devices
  if (!window.matchMedia('(hover: hover)').matches) return

  ctx = gsap.context(() => {
    // Subtle parallax offset: alternating even/odd
    const direction = props.index % 2 === 0 ? 1 : -1
    gsap.to(cardEl.value!, {
      y: direction * 20,
      ease: 'none',
      force3D: true,
      scrollTrigger: {
        trigger: cardEl.value!,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
      },
    })
  }, cardEl.value)
})

function onMouseEnter() {
  if (!cardEl.value) return
  const glowColor = props.artwork.dominantColor || '#ed544d'
  gsap.to(cardEl.value, {
    scale: 1.02,
    boxShadow: `0 0 50px ${glowColor}40, 0 0 100px ${glowColor}18`,
    duration: 0.6,
    ease: 'power2.out',
    force3D: true,
  })
  // Zoom the image itself
  const img = cardEl.value.querySelector('.card-img')
  if (img) gsap.to(img, { scale: 1.08, duration: 0.8, ease: 'power2.out' })
  if (titleEl.value) {
    gsap.fromTo(titleEl.value, { y: '100%', opacity: 0 }, { y: '0%', opacity: 1, duration: 0.4, ease: 'power3.out' })
  }
  if (mediumEl.value) {
    gsap.fromTo(mediumEl.value, { opacity: 0, y: 10 }, { opacity: 0.7, y: 0, duration: 0.35, delay: 0.08, ease: 'power2.out' })
  }
}

function onMouseLeave() {
  if (!cardEl.value) return
  gsap.to(cardEl.value, { scale: 1, boxShadow: '0 0 0 transparent', duration: 0.5, ease: 'power2.out' })
  const img = cardEl.value.querySelector('.card-img')
  if (img) gsap.to(img, { scale: 1, duration: 0.6, ease: 'power2.out' })
}

function onMouseMove(e: MouseEvent) {
  if (!cardEl.value) return
  const rect = cardEl.value.getBoundingClientRect()
  const centerX = rect.left + rect.width / 2
  const centerY = rect.top + rect.height / 2
  const offsetX = (e.clientX - centerX) * 0.015
  const offsetY = (e.clientY - centerY) * 0.015

  gsap.to(cardEl.value, {
    rotateY: offsetX,
    rotateX: -offsetY,
    duration: 0.4,
    ease: 'power2.out',
    force3D: true,
  })
}

function onMouseLeaveReset() {
  if (!cardEl.value) return
  gsap.to(cardEl.value, { rotateY: 0, rotateX: 0, duration: 0.5, ease: 'power3.out', clearProps: 'boxShadow' })
  onMouseLeave()
}

onUnmounted(() => {
  ctx?.revert()
})
</script>

<template>
  <div
    ref="cardEl"
    class="gallery-card group relative overflow-hidden rounded-lg cursor-pointer focus-visible:ring-2 focus-visible:ring-accent-red/60 focus-visible:ring-offset-2 focus-visible:ring-offset-dark-900 outline-none"
    :class="fullWidth ? 'aspect-[21/9]' : aspectClasses[artwork.aspect]"
    style="perspective: 600px; transform-style: preserve-3d"
    role="button"
    :tabindex="0"
    :aria-label="`View ${artwork.title}`"
    data-cursor-text="View"
    @click="$emit('click')"
    @keydown.enter="$emit('click')"
    @keydown.space.prevent="$emit('click')"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeaveReset"
    @mousemove="onMouseMove"
  >
    <!-- Real image with zoom on hover -->
    <NuxtImg
      v-if="artwork.src"
      :src="artwork.src"
      :alt="artwork.title"
      width="800"
      height="600"
      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
      quality="100"
      class="card-img absolute inset-0 w-full h-full object-cover transition-opacity duration-500"
      :class="imgLoaded ? 'opacity-100' : 'opacity-0'"
      :loading="index < 4 ? 'eager' : 'lazy'"
      @load="imgLoaded = true"
    />

    <!-- Shimmer loading placeholder -->
    <div
      v-if="!imgLoaded"
      class="absolute inset-0 w-full h-full bg-dark-700 overflow-hidden"
    >
      <div class="shimmer absolute inset-0" />
    </div>

    <!-- Hover overlay — tinted with artwork's dominant color -->
    <div
      ref="overlayEl"
      class="absolute inset-0 opacity-0 transition-opacity duration-400 group-hover:opacity-100 flex items-end"
      :style="{
        background: `linear-gradient(to top, ${artwork.dominantColor || '#181520'}dd 0%, ${artwork.dominantColor || '#181520'}30 40%, transparent 100%)`,
      }"
    >
      <div class="p-5 md:p-6 w-full">
        <div class="flex items-start justify-between gap-3">
          <div>
            <h3 ref="titleEl" class="font-display text-base md:text-lg text-lavender-100 leading-tight">
              {{ artwork.title }}
            </h3>
            <p ref="mediumEl" class="text-xs text-lavender-400 mt-1.5 opacity-0 tracking-wide uppercase">
              {{ artwork.medium }} &middot; {{ artwork.year }}
            </p>
          </div>
          <span class="flex-shrink-0 w-8 h-8 rounded-full border border-lavender-400/30 flex items-center justify-center text-lavender-300 group-hover:border-accent-red/50 group-hover:text-accent-red transition-all duration-300 mt-0.5">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
              <line x1="2" y1="10" x2="10" y2="2" />
              <polyline points="4 2 10 2 10 8" />
            </svg>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.shimmer {
  background: linear-gradient(
    90deg,
    rgba(42, 34, 64, 0) 0%,
    rgba(42, 34, 64, 0.4) 50%,
    rgba(42, 34, 64, 0) 100%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

.gallery-card {
  will-change: transform;
}

.card-img {
  will-change: transform;
}
</style>
