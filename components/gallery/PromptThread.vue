<template>
  <section ref="threadEl" class="prompt-thread px-6 md:px-12 pb-24">
    <div class="max-w-6xl mx-auto relative">
      <!-- Vertical timeline line -->
      <div ref="lineEl" class="thread-line" />

      <!-- Nodes -->
      <PromptThreadNode
        v-for="(artwork, index) in artworks"
        :key="artwork.id"
        :artwork="artwork"
        :index="index"
        :side="index % 2 === 0 ? 'left' : 'right'"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { provide, toRef } from 'vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import type { Artwork } from '~/types/artwork'

const props = defineProps<{
  artworks: Artwork[]
}>()

const lightbox = useLightbox()
const artworksRef = toRef(props, 'artworks')
provide('threadArtworks', artworksRef)
provide('threadLightbox', lightbox)

const threadEl = ref<HTMLElement | null>(null)
const lineEl = ref<HTMLElement | null>(null)
let ctx: gsap.Context | null = null

onMounted(() => {
  if (!threadEl.value || !lineEl.value) return

  ctx = gsap.context(() => {
    gsap.fromTo(lineEl.value!,
      { scaleY: 0 },
      {
        scaleY: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: threadEl.value!,
          start: 'top 80%',
          end: 'bottom 20%',
          scrub: 1,
        },
      }
    )
  }, threadEl.value)
})

onUnmounted(() => { ctx?.revert() })
</script>

<style scoped>
.thread-line {
  position: absolute;
  left: 50%;
  top: 0;
  bottom: 0;
  width: 1px;
  background: linear-gradient(
    to bottom,
    transparent 0%,
    rgba(201, 210, 231, 0.12) 5%,
    rgba(201, 210, 231, 0.12) 95%,
    transparent 100%
  );
  transform: translateX(-50%);
  transform-origin: top center;
}

@media (max-width: 767px) {
  .thread-line {
    left: 20px;
  }
}
</style>
