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
  if (feat.length >= 4) return feat.slice(0, 12)
  return artworks.value.slice(0, 8)
})

const sceneEl = ref<HTMLElement | null>(null)
const trackEl = ref<HTMLElement | null>(null)
const currentAngle = ref(0)
const isDragging = ref(false)
const autoRotate = ref(true)

const count = computed(() => featured.value.length)
const angleStep = computed(() => count.value > 0 ? 360 / count.value : 360)

// Radius — arc between adjacent cards >= cardWidth + gap
const radius = computed(() => {
  const n = count.value
  if (n <= 1) return 300
  const cardWidth = 280
  const gap = 40
  const minRadius = Math.round((n * (cardWidth + gap)) / (2 * Math.PI))
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
    velocity = (e.clientX - lastPointerX) / dt
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
  const flickThreshold = 0.3
  const flickCards = Math.abs(velocity) > flickThreshold
    ? Math.sign(velocity) * Math.ceil(Math.abs(velocity) / flickThreshold)
    : 0

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
      if (resumeTimer) clearTimeout(resumeTimer)
      resumeTimer = setTimeout(() => {
        resumeTimer = null
        autoRotate.value = true
        startAutoRotate()
      }, 3000)
    },
  })
}

function openArtwork(index: number, e?: MouseEvent) {
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

  let rect: SourceRect | null = null
  if (e) {
    const cardInner = (e.currentTarget as HTMLElement)?.querySelector('.card-inner')
    if (cardInner) {
      const domRect = cardInner.getBoundingClientRect()
      rect = {
        top: domRect.top,
        left: domRect.left,
        width: domRect.width,
        height: domRect.height,
        borderRadius: '14px',
      }
    }
  }

  lightbox.open(items, index, rect)
}

// Pause carousel when scrolled off-screen to save GPU
let observer: IntersectionObserver | null = null
const isVisible = ref(true)

onMounted(() => {
  nextTick(() => {
    applyRotation()
    if (!reducedMotion.value) {
      startAutoRotate()
    }

    // Observe visibility — pause 3D rotation and release GPU layers when off-screen
    if (sceneEl.value) {
      observer = new IntersectionObserver(
        ([entry]) => {
          isVisible.value = entry.isIntersecting
          if (entry.isIntersecting) {
            // Restore 3D compositing and resume rotation
            if (trackEl.value) {
              trackEl.value.style.visibility = ''
              trackEl.value.style.willChange = 'transform'
            }
            if (autoTween) autoTween.resume()
            else if (autoRotate.value) startAutoRotate()
          } else {
            // Pause rotation and release GPU layers
            if (autoTween) autoTween.pause()
            if (trackEl.value) {
              trackEl.value.style.willChange = 'auto'
              trackEl.value.style.visibility = 'hidden'
            }
          }
        },
        { threshold: 0 },
      )
      observer.observe(sceneEl.value)
    }
  })
})

onUnmounted(() => {
  stopAutoRotate()
  observer?.disconnect()
})
</script>

<template>
  <section
    v-if="featured.length >= 3"
    class="carousel-section"
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

    <!-- Desktop: Draggable 3D Carousel (original) -->
    <div v-if="!isMobile" class="carousel-wrapper">
      <div
        ref="sceneEl"
        class="carousel-scene"
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
            v-for="(artwork, i) in featured"
            :key="artwork.id"
            class="carousel-card"
            :style="{
              transform: `rotateY(${i * angleStep}deg) translateZ(${radius}px)`,
            }"
            @click.stop="openArtwork(i, $event)"
          >
            <div class="card-inner">
              <img
                :src="artwork.src"
                :alt="artwork.title"
                class="card-image"
                loading="lazy"
                draggable="false"
              />
              <div class="card-overlay">
                <h3 class="font-display text-lg font-semibold text-lavender-100 mb-1">
                  {{ artwork.title }}
                </h3>
                <p class="font-body text-xs text-lavender-400 uppercase tracking-wide">
                  {{ artwork.medium }} &middot; {{ artwork.year }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Dot indicators -->
      <div class="flex justify-center gap-1 mt-6 pb-4">
        <button
          v-for="(_, i) in featured"
          :key="i"
          class="relative flex items-center justify-center w-8 h-8 -mx-1 group"
          :aria-label="`Go to artwork ${i + 1}`"
          @click="goToCard(i)"
        >
          <span
            class="block h-2 rounded-full transition-all duration-300"
            :class="activeIndex === i ? 'bg-accent-red w-6' : 'bg-lavender-400/30 group-hover:bg-lavender-400/50 w-2'"
          />
        </button>
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
          @click="openArtwork(index)"
          @keydown.enter="openArtwork(index)"
          @keydown.space.prevent="openArtwork(index)"
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
  overflow: hidden;
}

.carousel-heading {
  font-size: clamp(2.5rem, 6vw, 5rem);
  letter-spacing: -0.03em;
}

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
  /* will-change set dynamically via IntersectionObserver */
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

/* Mobile scrollbar hide */
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

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
