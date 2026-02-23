<script setup lang="ts">
/**
 * HeroMosaic — Faded artwork thumbnails floating behind the hero text.
 * Creates an atmospheric preview of the collection without being distracting.
 * Images drift slowly with parallax depth, fading in/out on a long cycle.
 */
import gsap from 'gsap'

const { artworks } = useArtworks()
const containerEl = ref<HTMLElement | null>(null)
let ctx: gsap.Context | null = null

// Pick 6 artworks spread across categories for the mosaic
const mosaicIds = [
  'the-watcher',
  'bloom-of-decay',
  'metamorphosis',
  'the-nobleman',
  'the-crossing',
  'gorgons-cry',
]

const mosaicArtworks = computed(() => {
  return mosaicIds
    .map((id) => artworks.value.find((a: any) => a.id === id))
    .filter(Boolean)
})

// Predefined positions for organic placement (% based)
const positions = [
  { x: 8, y: 12, size: 180, rotate: -6, delay: 0 },
  { x: 72, y: 8, size: 160, rotate: 4, delay: 1.5 },
  { x: 85, y: 55, size: 140, rotate: -3, delay: 0.8 },
  { x: 5, y: 62, size: 150, rotate: 5, delay: 2.2 },
  { x: 42, y: 75, size: 130, rotate: -4, delay: 1.2 },
  { x: 55, y: 15, size: 120, rotate: 7, delay: 3 },
]

onMounted(() => {
  if (!containerEl.value) return

  ctx = gsap.context(() => {
    const items = containerEl.value!.querySelectorAll('.mosaic-item')

    items.forEach((item, i) => {
      const pos = positions[i] || positions[0]

      // Slow continuous float
      gsap.to(item, {
        y: `+=${15 + Math.random() * 20}`,
        x: `+=${-8 + Math.random() * 16}`,
        rotation: pos.rotate + (Math.random() * 4 - 2),
        duration: 8 + Math.random() * 6,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
        delay: pos.delay,
      })

      // Fade pulse — breathing opacity
      gsap.to(item, {
        opacity: 0.04 + Math.random() * 0.04,
        duration: 5 + Math.random() * 4,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
        delay: pos.delay + 1,
      })
    })
  }, containerEl.value)
})

onUnmounted(() => {
  ctx?.revert()
})
</script>

<template>
  <div ref="containerEl" class="absolute inset-0 overflow-hidden pointer-events-none">
    <div
      v-for="(artwork, i) in mosaicArtworks"
      :key="artwork.id"
      class="mosaic-item absolute rounded-2xl overflow-hidden"
      :style="{
        left: `${positions[i]?.x ?? 50}%`,
        top: `${positions[i]?.y ?? 50}%`,
        width: `${positions[i]?.size ?? 140}px`,
        height: `${(positions[i]?.size ?? 140) * 1.2}px`,
        transform: `rotate(${positions[i]?.rotate ?? 0}deg)`,
        opacity: 0.06,
      }"
    >
      <NuxtImg
        :src="artwork.src"
        :alt="artwork.title"
        width="200"
        height="240"
        format="webp"
        quality="30"
        class="w-full h-full object-cover"
        loading="eager"
      />
    </div>
  </div>
</template>
