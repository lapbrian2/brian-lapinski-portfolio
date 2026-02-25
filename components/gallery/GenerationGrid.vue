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

let typingInterval: ReturnType<typeof setInterval> | null = null
let ctx: gsap.Context | null = null

function getGlowStyle(artwork: Artwork) {
  const c = artwork.dominantColor || '#181520'
  return {
    boxShadow: `inset 0 0 40px ${c}55, inset 0 0 80px ${c}25`,
    background: `
      linear-gradient(to right, ${c}20 0%, transparent 12%, transparent 88%, ${c}20 100%),
      linear-gradient(to bottom, ${c}20 0%, transparent 12%, transparent 88%, ${c}20 100%)
    `,
  }
}

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

function handleMouseEnter(index: number) {
  if (!canHover.value || !gridEl.value) return
  hoveredIndex.value = index

  const cells = gridEl.value.querySelectorAll('.grid-cell')
  const hoveredCell = cells[index]
  if (!hoveredCell) return

  gsap.to(hoveredCell, { scale: 1.05, zIndex: 10, duration: 0.5, ease: 'power3.out' })
  gsap.to(hoveredCell.querySelector('.cell-img'), { scale: 1.08, duration: 0.6, ease: 'power2.out' })

  cells.forEach((cell, i) => {
    if (i !== index) {
      gsap.to(cell, { scale: 0.97, duration: 0.5, ease: 'power3.out' })
    }
  })

  startTyping(props.artworks[index]?.rawPrompt)
}

function handleMouseLeave() {
  if (!canHover.value || !gridEl.value) return
  hoveredIndex.value = null

  const cells = gridEl.value.querySelectorAll('.grid-cell')
  gsap.to(cells, { scale: 1, zIndex: 1, duration: 0.5, ease: 'power3.out' })

  const imgs = gridEl.value.querySelectorAll('.cell-img')
  gsap.to(imgs, { scale: 1, duration: 0.5, ease: 'power2.out' })

  stopTyping()
}

function handleClick(index: number) {
  const cell = cellEls.value[index]
  let rect: SourceRect | null = null
  if (cell) {
    const domRect = cell.getBoundingClientRect()
    rect = { top: domRect.top, left: domRect.left, width: domRect.width, height: domRect.height, borderRadius: '0px' }
  }
  const items = props.artworks.map(a => ({
    id: a.id, src: a.src, title: a.title, medium: a.medium,
    description: a.description, year: a.year,
    rawPrompt: a.rawPrompt, mjVersion: a.mjVersion,
    refinementNotes: a.refinementNotes, promptNodes: a.promptNodes,
  }))
  lightbox.open(items, index, rect)
}

onMounted(() => {
  canHover.value = window.matchMedia('(hover: hover)').matches
  if (!gridEl.value) return

  ctx = gsap.context(() => {
    const cells = gridEl.value!.querySelectorAll('.grid-cell')
    gsap.set(cells, { clipPath: 'inset(100% 0 0 0)', opacity: 1 })

    let hasRevealed = false
    const reveal = () => {
      if (hasRevealed) return
      hasRevealed = true
      gsap.to(cells, {
        clipPath: 'inset(0% 0 0 0)',
        duration: 0.9,
        stagger: { each: 0.12, from: 'start' },
        ease: 'power3.inOut',
        force3D: true,
      })
    }

    ScrollTrigger.create({
      trigger: gridEl.value!,
      start: 'top 85%',
      once: true,
      onEnter: reveal,
    })

    setTimeout(() => { if (!hasRevealed) reveal() }, 2500)
  }, gridEl.value)
})

onUnmounted(() => {
  stopTyping()
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
      :class="`cell-${index}`"
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
      @mouseleave="handleMouseLeave"
    >
      <!-- Image -->
      <NuxtImg
        :src="artwork.src"
        :alt="artwork.title"
        class="cell-img absolute inset-0 w-full h-full object-cover"
        width="800"
        height="600"
        sizes="(max-width: 768px) 50vw, 33vw"
        quality="100"
        :loading="index < 4 ? 'eager' : 'lazy'"
      />

      <!-- Dominant color glow overlay -->
      <div
        class="absolute inset-0 pointer-events-none z-[2]"
        :style="getGlowStyle(artwork)"
      />

      <!-- Typewriter prompt overlay (desktop only, hovered cell) -->
      <div
        v-if="hoveredIndex === index && canHover"
        class="absolute inset-0 z-[5] flex items-end"
      >
        <div class="w-full p-5 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
          <code class="font-mono text-[11px] leading-relaxed text-white/80 block">
            {{ typedText }}<span class="animate-pulse">|</span>
          </code>
        </div>
      </div>

      <!-- Mobile title strip -->
      <div
        class="absolute inset-x-0 bottom-0 pointer-events-none md:hidden z-[3]"
        :style="{ background: `linear-gradient(to top, ${artwork.dominantColor || '#181520'}cc 0%, transparent 100%)` }"
      >
        <div class="px-3 pt-6 pb-2.5">
          <h3 class="font-display text-sm text-lavender-100 leading-tight truncate">{{ artwork.title }}</h3>
          <p class="text-[10px] text-lavender-400 mt-0.5 uppercase tracking-wide truncate">{{ artwork.medium }} &middot; {{ artwork.year }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.generation-grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 0;
  overflow: hidden;
}
.grid-cell { position: relative; overflow: hidden; cursor: pointer; }
.cell-0 { grid-column: 1 / 8; }
.cell-1 { grid-column: 8 / 13; }
.cell-2 { grid-column: 1 / 7; }
.cell-3 { grid-column: 7 / 13; }
.cell-4 { grid-column: 1 / 6; }
.cell-5 { grid-column: 6 / 13; }

/* Force consistent row heights */
.grid-cell { aspect-ratio: 4/3; }
.cell-1, .cell-4 { aspect-ratio: 3/4; }

@media (max-width: 767px) {
  .generation-grid {
    grid-template-columns: 1fr 1fr;
  }
  .cell-0, .cell-1, .cell-2, .cell-3, .cell-4, .cell-5 {
    grid-column: auto;
    aspect-ratio: 1;
  }
}
</style>
