<template>
  <div ref="nodeEl" class="thread-node-wrap" :class="`side-${side}`">
    <!-- Timeline dot -->
    <div class="thread-dot" :style="{ borderColor: artwork.dominantColor || '#ed544d' }" />

    <!-- Content row -->
    <div class="node-content" :class="side === 'left' ? 'md:flex-row' : 'md:flex-row-reverse'">

      <!-- Image side -->
      <div
        ref="imageWrapEl"
        class="node-image"
        :data-artwork-id="artwork.id"
        :data-dominant-color="artwork.dominantColor"
        data-cursor-text="View"
        role="button"
        :tabindex="0"
        :aria-label="`View ${artwork.title}`"
        style="perspective: 600px; transform-style: preserve-3d"
        @click="handleClick"
        @keydown.enter="handleClick"
        @keydown.space.prevent="handleClick"
        @mouseenter="onImageMouseEnter"
        @mouseleave="onImageMouseLeave"
        @mousemove="onImageMouseMove"
      >
        <NuxtImg
          :src="artwork.src"
          :alt="artwork.title"
          class="w-full h-auto transition-opacity duration-500"
          :class="imgLoaded ? 'opacity-100' : 'opacity-0'"
          width="800"
          height="600"
          sizes="(max-width: 768px) 100vw, 50vw"
          quality="100"
          loading="lazy"
          style="object-fit: cover;"
          @load="imgLoaded = true"
        />
        <div v-if="!imgLoaded" class="absolute inset-0 bg-dark-700 overflow-hidden">
          <div class="node-shimmer absolute inset-0" />
        </div>
      </div>

      <!-- Text side -->
      <div ref="textEl" class="node-text">
        <!-- Dominant color accent stripe (desktop only) -->
        <div
          class="accent-stripe hidden md:block"
          :style="{ backgroundColor: artwork.dominantColor || '#ed544d' }"
        />

        <h3 class="font-display text-xl md:text-2xl font-semibold text-lavender-100 mb-2">
          {{ artwork.title }}
        </h3>

        <p class="font-body text-xs uppercase tracking-[0.15em] text-lavender-400 mb-4">
          {{ artwork.medium }} &middot; {{ artwork.year }}
        </p>

        <!-- Raw prompt in monospace -->
        <div v-if="artwork.rawPrompt" class="mb-4">
          <p class="text-[10px] uppercase tracking-[0.2em] text-lavender-400/40 mb-2">Raw Prompt</p>
          <code class="block text-xs leading-relaxed font-mono text-lavender-200/70 whitespace-pre-wrap break-words bg-white/[0.02] border border-white/[0.06] rounded-lg p-3 max-h-32 overflow-y-auto">{{ artwork.rawPrompt }}</code>
        </div>

        <!-- Refinement notes -->
        <div v-if="artwork.refinementNotes" class="mb-3">
          <p class="text-[10px] uppercase tracking-[0.2em] text-lavender-400/40 mb-2">Artist Notes</p>
          <p class="text-sm leading-relaxed font-body text-lavender-300/60 italic">{{ artwork.refinementNotes }}</p>
        </div>

        <!-- Description -->
        <p v-if="artwork.description" class="text-sm text-lavender-300/50 leading-relaxed">
          {{ artwork.description }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { inject, type Ref } from 'vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import type { Artwork } from '~/types/artwork'
import type { SourceRect } from '~/composables/useLightbox'

const props = defineProps<{
  artwork: Artwork
  index: number
  side: 'left' | 'right'
}>()

const allArtworks = inject<Ref<Artwork[]>>('threadArtworks')
const lightbox = inject<ReturnType<typeof useLightbox>>('threadLightbox')

const nodeEl = ref<HTMLElement | null>(null)
const imageWrapEl = ref<HTMLElement | null>(null)
const textEl = ref<HTMLElement | null>(null)
const imgLoaded = ref(false)
let ctx: gsap.Context | null = null

function onImageMouseMove(e: MouseEvent) {
  if (!imageWrapEl.value) return
  const rect = imageWrapEl.value.getBoundingClientRect()
  const centerX = rect.left + rect.width / 2
  const centerY = rect.top + rect.height / 2
  const offsetX = (e.clientX - centerX) * 0.012
  const offsetY = (e.clientY - centerY) * 0.012
  gsap.to(imageWrapEl.value, {
    rotateY: offsetX,
    rotateX: -offsetY,
    duration: 0.4,
    ease: 'power2.out',
    force3D: true,
  })
}

function onImageMouseEnter() {
  if (!imageWrapEl.value) return
  const glowColor = props.artwork.dominantColor || '#ed544d'
  gsap.to(imageWrapEl.value, {
    scale: 1.02,
    boxShadow: `0 0 50px ${glowColor}40, 0 0 100px ${glowColor}18`,
    duration: 0.6,
    ease: 'power2.out',
  })
}

function onImageMouseLeave() {
  if (!imageWrapEl.value) return
  gsap.to(imageWrapEl.value, {
    rotateY: 0, rotateX: 0,
    scale: 1,
    boxShadow: '0 0 0 transparent',
    duration: 0.5,
    ease: 'power3.out',
  })
}

onMounted(() => {
  if (!nodeEl.value) return

  // Check reduced motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  ctx = gsap.context(() => {
    const imageDir = props.side === 'left' ? -60 : 60
    const textDir = props.side === 'left' ? 30 : -30

    // Image slides in from its side
    if (imageWrapEl.value) {
      gsap.set(imageWrapEl.value, { x: imageDir, opacity: 0 })
      ScrollTrigger.create({
        trigger: nodeEl.value!,
        start: 'top 80%',
        once: true,
        onEnter: () => {
          gsap.to(imageWrapEl.value!, {
            x: 0, opacity: 1,
            duration: 0.8,
            ease: 'power3.out',
            force3D: true,
          })
        },
      })

      // Continuous scroll parallax on the image itself
      const img = imageWrapEl.value.querySelector('img')
      if (img) {
        gsap.fromTo(img,
          { y: '-5%' },
          {
            y: '5%',
            ease: 'none',
            scrollTrigger: {
              trigger: imageWrapEl.value,
              start: 'top bottom',
              end: 'bottom top',
              scrub: true,
            },
          }
        )
      }
    }

    // Text children stagger from opposite side
    if (textEl.value) {
      const children = textEl.value.children
      gsap.set(children, { x: textDir, opacity: 0 })
      ScrollTrigger.create({
        trigger: nodeEl.value!,
        start: 'top 75%',
        once: true,
        onEnter: () => {
          gsap.to(children, {
            x: 0, opacity: 1,
            duration: 0.7,
            stagger: 0.08,
            ease: 'power3.out',
            delay: 0.15,
            force3D: true,
          })
        },
      })
    }

    // Timeline dot scales in
    const dot = nodeEl.value!.querySelector('.thread-dot')
    if (dot) {
      gsap.set(dot, { scale: 0 })
      ScrollTrigger.create({
        trigger: nodeEl.value!,
        start: 'top 80%',
        once: true,
        onEnter: () => {
          gsap.to(dot, {
            scale: 1,
            duration: 0.4,
            ease: 'back.out(2)',
            delay: 0.1,
          })
        },
      })
    }
  }, nodeEl.value)
})

onUnmounted(() => { ctx?.revert() })

function handleClick() {
  if (!lightbox || !allArtworks?.value) return
  const artworks = allArtworks.value
  const index = artworks.findIndex(a => a.id === props.artwork.id)

  const items = artworks.map(a => ({
    id: a.id, src: a.src, title: a.title, medium: a.medium,
    description: a.description, year: a.year,
    rawPrompt: a.rawPrompt, mjVersion: a.mjVersion,
    refinementNotes: a.refinementNotes, promptNodes: a.promptNodes,
  }))

  let rect: SourceRect | null = null
  if (imageWrapEl.value) {
    const domRect = imageWrapEl.value.getBoundingClientRect()
    rect = {
      top: domRect.top, left: domRect.left,
      width: domRect.width, height: domRect.height,
      borderRadius: '2px',
    }
  }

  lightbox.open(items, index >= 0 ? index : 0, rect)
}
</script>

<style scoped>
.thread-node-wrap {
  position: relative;
  padding: 3rem 0;
}

.node-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  align-items: flex-start;
}

@media (min-width: 768px) {
  .node-content {
    flex-direction: row;
    gap: 3rem;
  }
}

.node-image {
  position: relative;
  width: 100%;
  overflow: hidden;
  cursor: pointer;
  border-radius: 2px;
}

@media (min-width: 768px) {
  .node-image {
    flex: 0 0 55%;
    max-width: 55%;
  }
}

.node-image img {
  transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}
.node-image:hover img {
  transform: scale(1.03);
}

.node-text {
  flex: 1;
  position: relative;
  padding-top: 0.5rem;
}

@media (min-width: 768px) {
  .node-text {
    padding-top: 1rem;
  }
}

.accent-stripe {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 3px;
  border-radius: 2px;
  opacity: 0.5;
}

/* Stripe position depends on side */
.side-left .accent-stripe {
  right: -1.5rem;
}
.side-right .accent-stripe {
  left: -1.5rem;
}

/* Timeline dot */
.thread-dot {
  position: absolute;
  left: 50%;
  top: 4.5rem;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #181520;
  border: 2px solid;
  transform: translateX(-50%);
  z-index: 2;
}

/* Mobile: dot on left, content indented */
@media (max-width: 767px) {
  .thread-dot {
    left: 20px;
    top: 0.5rem;
  }
  .thread-node-wrap {
    padding-left: 48px;
  }
  .accent-stripe {
    display: none !important;
  }
}

.node-shimmer {
  background: linear-gradient(90deg, rgba(42, 34, 64, 0) 0%, rgba(42, 34, 64, 0.4) 50%, rgba(42, 34, 64, 0) 100%);
  background-size: 200% 100%;
  animation: node-shimmer 1.5s infinite;
}
@keyframes node-shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
</style>
