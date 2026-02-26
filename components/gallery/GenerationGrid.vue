<script setup lang="ts">
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import type { Artwork } from '~/types/artwork'
import type { SourceRect } from '~/composables/useLightbox'

const props = defineProps<{ artworks: Artwork[] }>()

const lightbox = useLightbox()

const gridEl = ref<HTMLElement | null>(null)
const cellEls = ref<HTMLElement[]>([])
const canHover = ref(false)
const hoveredIndex = ref<number | null>(null)
const typedText = ref('')
const loadedImages = reactive(new Set<string>())

let typingInterval: ReturnType<typeof setInterval> | null = null
let ctx: gsap.Context | null = null

// Velocity skew (extracted composable)
const velocitySkew = useVelocitySkew(gridEl, '.grid-cell')

// Aspect ratio classes — use artwork's own aspect, never force a uniform ratio
const aspectClasses: Record<string, string> = {
  tall: 'aspect-[3/4]',
  wide: 'aspect-[4/3]',
  square: 'aspect-square',
}

// --- Dominant color glow seam overlay (always visible, subtle edge vignette) ---
function getGlowStyle(artwork: Artwork) {
  const c = artwork.dominantColor || '#000000'
  return {
    boxShadow: `inset 0 0 40px ${c}55, inset 0 0 80px ${c}25`,
    background: `
      linear-gradient(to right, ${c}20 0%, transparent 12%, transparent 88%, ${c}20 100%),
      linear-gradient(to bottom, ${c}20 0%, transparent 12%, transparent 88%, ${c}20 100%)
    `,
  }
}

// --- Typing effect for prompt overlay ---
function startTyping(rawPrompt: string | null | undefined) {
  stopTyping()
  if (!rawPrompt) return
  typedText.value = ''
  let charIndex = 0
  const displayPrompt = rawPrompt.slice(0, 120) + (rawPrompt.length > 120 ? '...' : '')
  typingInterval = setInterval(() => {
    if (charIndex < displayPrompt.length) {
      typedText.value = displayPrompt.slice(0, ++charIndex)
    } else {
      if (typingInterval) clearInterval(typingInterval)
    }
  }, 25)
}

function stopTyping() {
  if (typingInterval) { clearInterval(typingInterval); typingInterval = null }
  typedText.value = ''
}

// --- 3D tilt on mouse move ---
function onMouseMove(e: MouseEvent, index: number) {
  const cell = cellEls.value[index]
  if (!cell || !canHover.value) return
  const rect = cell.getBoundingClientRect()
  const centerX = rect.left + rect.width / 2
  const centerY = rect.top + rect.height / 2
  const offsetX = (e.clientX - centerX) * 0.015
  const offsetY = (e.clientY - centerY) * 0.015
  gsap.to(cell, {
    rotateY: offsetX,
    rotateX: -offsetY,
    duration: 0.4,
    ease: 'power2.out',
    force3D: true,
  })
}

// --- Hover: scale + dominant color box-shadow glow ---
function handleMouseEnter(index: number) {
  if (!canHover.value || !gridEl.value) return
  hoveredIndex.value = index

  const cells = gridEl.value.querySelectorAll('.grid-cell')
  const hoveredCell = cells[index]
  if (!hoveredCell) return

  const glowColor = props.artworks[index]?.dominantColor || '#ed544d'

  // Scale up hovered cell with real box-shadow glow
  gsap.to(hoveredCell, {
    scale: 1.05,
    zIndex: 10,
    boxShadow: `0 0 60px ${glowColor}50, 0 0 120px ${glowColor}20`,
    duration: 0.5,
    ease: 'power3.out',
  })

  // Zoom the image inside for extra depth
  const img = hoveredCell.querySelector('.cell-img')
  if (img) gsap.to(img, { scale: 1.08, duration: 0.6, ease: 'power2.out' })

  // Shrink siblings for focus effect
  cells.forEach((cell, i) => {
    if (i !== index) {
      gsap.to(cell, { scale: 0.97, duration: 0.5, ease: 'power3.out' })
    }
  })

  startTyping(props.artworks[index]?.rawPrompt)
}

// --- Mouse leave: reset all transforms ---
function handleMouseLeave(index: number) {
  if (!canHover.value || !gridEl.value) return
  hoveredIndex.value = null

  const cells = gridEl.value.querySelectorAll('.grid-cell')

  // Reset scale, zIndex, boxShadow on all cells
  gsap.to(cells, {
    scale: 1,
    zIndex: 1,
    boxShadow: '0 0 0px transparent',
    duration: 0.5,
    ease: 'power3.out',
  })

  // Reset image zoom
  const imgs = gridEl.value.querySelectorAll('.cell-img')
  gsap.to(imgs, { scale: 1, duration: 0.5, ease: 'power2.out' })

  // Reset 3D tilt on the cell we're leaving
  const cell = cellEls.value[index]
  if (cell) {
    gsap.to(cell, {
      rotateY: 0,
      rotateX: 0,
      duration: 0.5,
      ease: 'power3.out',
    })
  }

  stopTyping()
}

// --- Click to open lightbox ---
function handleClick(index: number) {
  const cell = cellEls.value[index]
  let rect: SourceRect | null = null
  if (cell) {
    const domRect = cell.getBoundingClientRect()
    rect = {
      top: domRect.top,
      left: domRect.left,
      width: domRect.width,
      height: domRect.height,
      borderRadius: '0px',
    }
  }
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
    likeCount: a.likeCount,
  }))
  lightbox.open(items, index, rect)
}

// --- Mount: scrub-linked per-card reveals, parallax, velocity skew ---

onMounted(() => {
  canHover.value = window.matchMedia('(hover: hover)').matches
  if (!gridEl.value) return

  // Check reduced motion preference
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const cells = gridEl.value.querySelectorAll<HTMLElement>('.grid-cell')
  const imgs = gridEl.value.querySelectorAll<HTMLElement>('.cell-img')

  if (!cells.length) return

  // If reduced motion, skip all animations — just show everything
  if (prefersReduced) {
    gsap.set(cells, { clipPath: 'inset(0% 0 0 0)', opacity: 1 })
    gsap.set(imgs, { y: 0, filter: 'blur(0px) saturate(1)' })
    return
  }

  // Initial state: clip-path hides cells from bottom, images blurred + desaturated
  gsap.set(cells, { clipPath: 'inset(100% 0 0 0)', opacity: 1 })
  gsap.set(imgs, { y: 40, filter: 'blur(20px) saturate(0)' })

  ctx = gsap.context(() => {
    // Per-card scrub-linked reveal — each card unmasks as you scroll through it
    cells.forEach((cell, i) => {
      const img = cell.querySelector('.cell-img')

      // Check if cell is already past reveal point (already in viewport on page load)
      const cellRect = cell.getBoundingClientRect()
      const viewportH = window.innerHeight
      const alreadyVisible = cellRect.top < viewportH * 0.95

      if (alreadyVisible) {
        // Already in viewport — show immediately, no scrubbed reveal
        gsap.set(cell, { clipPath: 'inset(0% 0 0 0)' })
        if (img) gsap.set(img, { y: 0, filter: 'blur(0px) saturate(1)' })
      } else {
        // Below viewport — use scrub-linked reveal as card enters
        gsap.fromTo(cell,
          { clipPath: 'inset(100% 0 0 0)' },
          {
            clipPath: 'inset(0% 0 0 0)',
            ease: 'none',
            force3D: true,
            scrollTrigger: {
              trigger: cell,
              start: 'top 95%',
              end: 'top 45%',
              scrub: 0.8,
            },
          },
        )

        // Image slides up + blur/desaturate resolves, also scrubbed
        if (img) {
          gsap.fromTo(img,
            { y: 40, filter: 'blur(20px) saturate(0)' },
            {
              y: 0,
              filter: 'blur(0px) saturate(1)',
              ease: 'none',
              force3D: true,
              scrollTrigger: {
                trigger: cell,
                start: 'top 95%',
                end: 'top 50%',
                scrub: 0.8,
              },
            },
          )
        }
      }

      // Per-cell alternating parallax drift (desktop only)
      if (canHover.value) {
        const direction = i % 2 === 0 ? 1 : -1
        gsap.to(cell, {
          y: direction * 15,
          ease: 'none',
          force3D: true,
          scrollTrigger: {
            trigger: cell,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        })
      }
    })
  }, gridEl.value)

  // Safety net: if any cells are still hidden after 2s (edge case), force reveal
  setTimeout(() => {
    if (!gridEl.value) return
    const stillHidden = gridEl.value.querySelectorAll<HTMLElement>('.grid-cell')
    stillHidden.forEach((cell) => {
      const style = window.getComputedStyle(cell)
      if (style.clipPath && style.clipPath.includes('100%')) {
        gsap.set(cell, { clipPath: 'inset(0% 0 0 0)' })
        const img = cell.querySelector('.cell-img')
        if (img) gsap.set(img, { y: 0, filter: 'blur(0px) saturate(1)' })
      }
    })
  }, 2000)

  // Velocity skew on pointer devices only
  if (canHover.value) {
    velocitySkew.setup()
  }
})

// --- Cleanup ---
onUnmounted(() => {
  stopTyping()
  velocitySkew.cleanup()
  ctx?.revert()
})
</script>

<template>
  <div ref="gridEl" class="generation-grid">
    <div
      v-for="(artwork, index) in artworks"
      :key="artwork.id"
      :ref="(el) => { if (el) cellEls[index] = el as HTMLElement }"
      class="grid-cell"
      :class="[`cell-${index}`, aspectClasses[artwork.aspect] || 'aspect-square']"
      style="perspective: 600px; transform-style: preserve-3d"
      :data-artwork-id="artwork.id"
      :data-dominant-color="artwork.dominantColor"
      data-cursor-text="View"
      role="button"
      :tabindex="0"
      :aria-label="`View ${artwork.title}`"
      @click="handleClick(index)"
      @keydown.enter="handleClick(index)"
      @keydown.space.prevent="handleClick(index)"
      @mouseenter="handleMouseEnter(index)"
      @mouseleave="handleMouseLeave(index)"
      @mousemove="onMouseMove($event, index)"
    >
      <!-- Image -->
      <NuxtImg
        :src="artwork.src"
        :alt="artwork.title"
        class="cell-img absolute inset-0 w-full h-full object-cover transition-opacity duration-500"
        :class="loadedImages.has(artwork.id) ? 'opacity-100' : 'opacity-0'"
        width="800"
        height="600"
        sizes="(max-width: 768px) 50vw, 33vw"
        :loading="index < 4 ? 'eager' : 'lazy'"
        @load="loadedImages.add(artwork.id)"
      />

      <!-- Shimmer loading placeholder -->
      <div
        v-if="!loadedImages.has(artwork.id)"
        class="absolute inset-0 bg-dark-700 overflow-hidden z-[1]"
      >
        <div class="shimmer absolute inset-0" />
      </div>

      <!-- Dominant color glow seam overlay (always visible) -->
      <div
        class="absolute inset-0 pointer-events-none z-[2]"
        :style="getGlowStyle(artwork)"
      />

      <!-- Desktop hover overlay with typing prompt + title/medium -->
      <div
        class="absolute inset-0 hidden md:flex flex-col justify-end z-[5] transition-opacity duration-300"
        :class="hoveredIndex === index ? 'opacity-100' : 'opacity-0 pointer-events-none'"
        :style="{
          background: `linear-gradient(to top, ${artwork.dominantColor || '#000000'}dd 0%, ${artwork.dominantColor || '#000000'}30 40%, transparent 100%)`,
        }"
      >
        <div class="p-5">
          <!-- Typing prompt -->
          <code
            v-if="hoveredIndex === index && typedText"
            class="font-mono text-[10px] leading-relaxed text-white/60 block mb-3 line-clamp-2"
          >
            {{ typedText }}<span class="animate-pulse">|</span>
          </code>
          <!-- Title and medium -->
          <h3 class="font-display text-base md:text-lg text-lavender-100 leading-tight">
            {{ artwork.title }}
          </h3>
          <p class="text-xs text-lavender-400 mt-1 tracking-wide uppercase">
            {{ artwork.medium }} &middot; {{ artwork.year }}
          </p>
        </div>
      </div>

      <!-- Mobile title strip (always visible on mobile) -->
      <div
        class="absolute inset-x-0 bottom-0 pointer-events-none md:hidden z-[3]"
        :style="{
          background: `linear-gradient(to top, ${artwork.dominantColor || '#000000'}cc 0%, transparent 100%)`,
        }"
      >
        <div class="px-3 pt-6 pb-2.5">
          <h3 class="font-display text-sm text-lavender-100 leading-tight truncate">
            {{ artwork.title }}
          </h3>
          <p class="text-[10px] text-lavender-400 mt-0.5 uppercase tracking-wide truncate">
            {{ artwork.medium }} &middot; {{ artwork.year }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.generation-grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  grid-auto-rows: auto;
  gap: 0;
  overflow: hidden;
}

.grid-cell {
  position: relative;
  overflow: hidden;
  cursor: pointer;
}

/* Column span pattern for visual variety */
.cell-0 { grid-column: span 7; }
.cell-1 { grid-column: span 5; }
.cell-2 { grid-column: span 5; }
.cell-3 { grid-column: span 7; }
.cell-4 { grid-column: span 6; }
.cell-5 { grid-column: span 6; }

/* Mobile: 2 columns, each cell spans 1 */
@media (max-width: 767px) {
  .generation-grid {
    grid-template-columns: 1fr 1fr;
  }
  .cell-0,
  .cell-1,
  .cell-2,
  .cell-3,
  .cell-4,
  .cell-5 {
    grid-column: span 1;
  }
}

/* Shimmer loading animation */
.shimmer {
  background: linear-gradient(
    90deg,
    rgba(17, 17, 24, 0) 0%,
    rgba(17, 17, 24, 0.4) 50%,
    rgba(17, 17, 24, 0) 100%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
</style>
