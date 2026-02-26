<script setup lang="ts">
import gsap from 'gsap'
import { useReducedMotion } from '~/composables/useMediaQuery'
import type { Artwork } from '~/types/artwork'
import type { SourceRect } from '~/composables/useLightbox'

const props = defineProps<{
  artworks: Artwork[]
}>()

const lightbox = useLightbox()
const reducedMotion = useReducedMotion()

const containerEl = ref<HTMLElement | null>(null)
const trackEl = ref<HTMLElement | null>(null)
const sceneEl = ref<HTMLElement | null>(null)
const currentAngle = ref(0)
const isDragging = ref(false)
const autoRotate = ref(true)

// Track which images have loaded
const loadedImages = reactive(new Set<string>())

const count = computed(() => props.artworks.length)
const angleStep = computed(() => count.value > 0 ? 360 / count.value : 360)

// Radius — ensures cards never overlap: arc between adjacent cards >= cardWidth + gap
const radius = computed(() => {
  const n = count.value
  if (n <= 1) return 300
  // Card width is 280px desktop. We need each card's arc-length > cardWidth + gap.
  // Arc = 2 * PI * r / n, so r = n * (cardWidth + gap) / (2 * PI)
  const cardWidth = 280
  const gap = 40 // minimum 40px gap between cards
  const minRadius = Math.round((n * (cardWidth + gap)) / (2 * Math.PI))
  // Clamp: at least 300, no upper limit — let the 3D perspective handle it
  return Math.max(300, minRadius)
})

// Perspective scales with radius so depth effect stays proportional
const perspective = computed(() => Math.max(1600, radius.value * 2.2))

// Active card index based on current rotation
const activeIndex = computed(() => {
  if (count.value === 0) return 0
  const step = angleStep.value
  const normalized = (((-currentAngle.value % 360) + 360) % 360)
  return Math.round(normalized / step) % count.value
})

let dragStartX = 0
let dragStartAngle = 0
let autoTween: gsap.core.Tween | null = null
let resumeTimer: ReturnType<typeof setTimeout> | null = null

// Velocity tracking for momentum flick
let lastPointerX = 0
let lastPointerTime = 0
let velocity = 0

function startAutoRotate() {
  if (!autoRotate.value || !trackEl.value || count.value === 0) return
  stopAutoRotate()
  autoTween = gsap.to(currentAngle, {
    value: currentAngle.value - 360,
    duration: 80,
    ease: 'none',
    repeat: -1,
    onUpdate: applyRotation,
  })
}

function stopAutoRotate() {
  if (resumeTimer) {
    clearTimeout(resumeTimer)
    resumeTimer = null
  }
  if (autoTween) {
    autoTween.kill()
    autoTween = null
  }
}

function applyRotation() {
  if (!trackEl.value) return
  trackEl.value.style.transform = `rotateY(${currentAngle.value}deg)`
}

function onPointerDown(e: PointerEvent) {
  isDragging.value = true
  autoRotate.value = false
  stopAutoRotate()
  dragStartX = e.clientX
  dragStartAngle = currentAngle.value
  lastPointerX = e.clientX
  lastPointerTime = performance.now()
  velocity = 0
  ;(e.target as HTMLElement)?.setPointerCapture?.(e.pointerId)
}

function onPointerMove(e: PointerEvent) {
  if (!isDragging.value) return

  const now = performance.now()
  const dt = now - lastPointerTime
  if (dt > 0) {
    velocity = (e.clientX - lastPointerX) / dt // px/ms
  }
  lastPointerX = e.clientX
  lastPointerTime = now

  const delta = e.clientX - dragStartX
  const sensitivity = e.pointerType === 'touch' ? 0.45 : 0.3
  currentAngle.value = dragStartAngle + delta * sensitivity
  applyRotation()
}

function onPointerUp() {
  if (!isDragging.value) return
  isDragging.value = false

  const step = angleStep.value
  const nearestSnap = Math.round(currentAngle.value / step) * step

  // Determine flick offset based on velocity
  const flickThreshold = 0.3 // px/ms
  const flickCards = Math.abs(velocity) > flickThreshold
    ? Math.sign(velocity) * Math.ceil(Math.abs(velocity) / flickThreshold)
    : 0

  // Clamp flick to a maximum of 3 cards in either direction
  const maxFlick = 3
  const clampedFlick = Math.max(-maxFlick, Math.min(maxFlick, flickCards))
  const targetAngle = nearestSnap + clampedFlick * step

  const isFlick = clampedFlick !== 0

  gsap.to(currentAngle, {
    value: targetAngle,
    duration: isFlick ? 0.8 : 0.6,
    ease: 'power3.out',
    overwrite: true,
    onUpdate: applyRotation,
    onComplete: () => {
      autoRotate.value = true
      startAutoRotate()
    },
  })
}

function goToCard(index: number) {
  autoRotate.value = false
  stopAutoRotate()
  const target = -index * angleStep.value
  gsap.to(currentAngle, {
    value: target,
    duration: 0.8,
    ease: 'power3.out',
    overwrite: true,
    onUpdate: applyRotation,
    onComplete: () => {
      if (resumeTimer) {
        clearTimeout(resumeTimer)
      }
      resumeTimer = setTimeout(() => {
        resumeTimer = null
        autoRotate.value = true
        startAutoRotate()
      }, 3000)
    },
  })
}

function getCarouselCardRect(e: MouseEvent): SourceRect | null {
  const cardInner = (e.currentTarget as HTMLElement)?.querySelector('.card-inner')
  if (!cardInner) return null
  const domRect = cardInner.getBoundingClientRect()
  const computedStyle = window.getComputedStyle(cardInner)
  return {
    top: domRect.top,
    left: domRect.left,
    width: domRect.width,
    height: domRect.height,
    borderRadius: computedStyle.borderRadius,
  }
}

function openArtwork(index: number, e: MouseEvent) {
  const items = props.artworks.map((a) => ({
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
  const rect = getCarouselCardRect(e)
  lightbox.open(items, index, rect)
}

function onImageLoad(id: string) {
  loadedImages.add(id)
}

onMounted(() => {
  nextTick(() => {
    applyRotation()
    if (!reducedMotion.value) {
      startAutoRotate()
    }
  })
})

onUnmounted(() => {
  stopAutoRotate()
})
</script>

<template>
  <div class="carousel-wrapper" ref="containerEl">
    <div
      ref="sceneEl"
      class="carousel-scene"
      data-cursor-drag
      :style="{ perspective: `${perspective}px` }"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
      @pointercancel="onPointerUp"
    >
      <div
        ref="trackEl"
        class="carousel-track"
      >
        <div
          v-for="(artwork, i) in artworks"
          :key="artwork.id"
          class="carousel-card"
          :style="{
            transform: `rotateY(${i * angleStep}deg) translateZ(${radius}px)`,
          }"
          :data-artwork-id="artwork.id"
          @click.stop="openArtwork(i, $event)"
        >
          <div class="card-inner">
            <!-- Shimmer placeholder -->
            <div
              v-if="!loadedImages.has(artwork.id)"
              class="absolute inset-0 bg-dark-700 overflow-hidden"
            >
              <div class="shimmer absolute inset-0" />
            </div>

            <NuxtImg
              :src="artwork.src"
              :alt="artwork.title"
              width="560"
              height="760"
              sizes="280px"
              class="card-image transition-opacity duration-500"
              :class="loadedImages.has(artwork.id) ? 'opacity-100' : 'opacity-0'"
              draggable="false"
              @load="onImageLoad(artwork.id)"
            />
            <div class="card-overlay">
              <h3 class="card-title">{{ artwork.title }}</h3>
              <p class="card-medium">{{ artwork.medium }} &middot; {{ artwork.year }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Dot indicators -->
    <div class="flex justify-center gap-1 mt-8">
      <button
        v-for="(_, i) in artworks"
        :key="i"
        class="relative flex items-center justify-center w-8 h-8 -mx-1 group"
        @click="goToCard(i)"
      >
        <span
          class="block h-2 rounded-full transition-all duration-300"
          :class="activeIndex === i ? 'bg-accent-red w-6' : 'bg-lavender-400/30 group-hover:bg-lavender-400/50 w-2'"
        />
      </button>
    </div>
  </div>
</template>

<style scoped>
.carousel-wrapper {
  width: 100%;
  padding: 2rem 0;
}

.carousel-scene {
  width: 100%;
  height: 520px;
  overflow: visible;
  cursor: grab;
  touch-action: pan-y;
}

.carousel-scene:active {
  cursor: grabbing;
}

.carousel-track {
  width: 100%;
  height: 100%;
  position: relative;
  transform-style: preserve-3d;
  transform: rotateY(0deg);
  will-change: transform;
}

.carousel-card {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 280px;
  height: 380px;
  margin-left: -140px;
  margin-top: -190px;
  transform-style: preserve-3d;
  will-change: transform;
}

.card-inner {
  width: 100%;
  height: 100%;
  border-radius: 14px;
  overflow: hidden;
  position: relative;
  box-shadow:
    0 25px 50px -12px rgba(0, 0, 0, 0.6),
    inset 0 0 0 1px rgba(255, 255, 255, 0.06);
  transition: box-shadow 0.3s ease;
  cursor: pointer;
}

.card-inner:hover {
  box-shadow:
    0 25px 60px -8px rgba(237, 84, 77, 0.25),
    inset 0 0 0 1px rgba(237, 84, 77, 0.15);
}

.card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center top;
  pointer-events: none;
  user-select: none;
}

.card-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 1.5rem;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.85), transparent);
  opacity: 0;
  transform: translateY(8px);
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.card-inner:hover .card-overlay {
  opacity: 1;
  transform: translateY(0);
}

.card-title {
  font-family: 'PP Neue Montreal', sans-serif;
  font-weight: 700;
  font-size: 1.125rem;
  color: white;
  margin-bottom: 0.25rem;
}

.card-medium {
  font-family: 'PP Neue Montreal', sans-serif;
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.6);
}

/* shimmer class is defined globally in assets/css/main.css */

@media (max-width: 768px) {
  .carousel-scene {
    height: 420px;
  }

  .carousel-card {
    width: 220px;
    height: 300px;
    margin-left: -110px;
    margin-top: -150px;
  }
}
</style>
