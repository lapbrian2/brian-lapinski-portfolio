<script setup lang="ts">
import type { Artwork } from '~/data/artworks'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const props = defineProps<{
  artwork: Artwork
  index: number
}>()

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
  // Only enable magnetic + parallax on pointer devices
  if (!window.matchMedia('(hover: hover)').matches) return

  ctx = gsap.context(() => {
    // Subtle parallax offset: alternating even/odd
    const direction = props.index % 2 === 0 ? 1 : -1
    gsap.to(cardEl.value!, {
      y: direction * 20,
      ease: 'none',
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
  gsap.to(cardEl.value, { scale: 1.02, duration: 0.6, ease: 'power2.out' })
  if (titleEl.value) {
    gsap.fromTo(titleEl.value, { y: '100%', opacity: 0 }, { y: '0%', opacity: 1, duration: 0.4, ease: 'power3.out' })
  }
  if (mediumEl.value) {
    gsap.fromTo(mediumEl.value, { opacity: 0, y: 10 }, { opacity: 0.7, y: 0, duration: 0.35, delay: 0.08, ease: 'power2.out' })
  }
}

function onMouseLeave() {
  if (!cardEl.value) return
  gsap.to(cardEl.value, { scale: 1, duration: 0.5, ease: 'power2.out' })
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
  })
}

function onMouseLeaveReset() {
  if (!cardEl.value) return
  gsap.to(cardEl.value, { rotateY: 0, rotateX: 0, duration: 0.5, ease: 'power3.out' })
  onMouseLeave()
}

onUnmounted(() => {
  ctx?.revert()
})
</script>

<template>
  <div
    ref="cardEl"
    class="group relative overflow-hidden rounded-lg cursor-pointer"
    :class="aspectClasses[artwork.aspect]"
    style="perspective: 600px; transform-style: preserve-3d"
    data-cursor-text="View"
    @click="$emit('click')"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeaveReset"
    @mousemove="onMouseMove"
  >
    <!-- Real image -->
    <img
      v-if="artwork.src"
      :src="artwork.src"
      :alt="artwork.title"
      class="absolute inset-0 w-full h-full object-cover transition-opacity duration-500"
      :class="imgLoaded ? 'opacity-100' : 'opacity-0'"
      loading="lazy"
      @load="imgLoaded = true"
    >

    <!-- Placeholder (shows while image loads or if no src) -->
    <div
      v-if="!imgLoaded"
      class="absolute inset-0 w-full h-full bg-dark-700 bg-gradient-to-br from-dark-700 to-dark-800 flex items-center justify-center"
    >
      <span class="font-display text-sm text-lavender-400 text-center px-4 select-none">
        {{ artwork.title }}
      </span>
    </div>

    <!-- Hover overlay -->
    <div
      ref="overlayEl"
      class="absolute inset-0 bg-gradient-to-t from-dark-900/80 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 flex items-end"
    >
      <div class="p-6">
        <h3 ref="titleEl" class="font-display text-lg text-lavender-100">
          {{ artwork.title }}
        </h3>
        <p ref="mediumEl" class="text-sm text-lavender-300 mt-1 opacity-0">
          {{ artwork.medium }}
        </p>
      </div>
    </div>
  </div>
</template>
