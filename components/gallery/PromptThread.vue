<template>
  <section ref="threadEl" class="prompt-thread px-6 md:px-12 pb-24">
    <div class="max-w-6xl mx-auto relative">
      <!-- Vertical timeline line -->
      <div ref="lineEl" class="thread-line" />
      <!-- Glowing dot at line leading edge -->
      <div ref="dotEl" class="thread-glow-dot" />

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
const dotEl = ref<HTMLElement | null>(null)
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

    // Glowing dot follows the leading edge of the line
    if (dotEl.value) {
      gsap.fromTo(dotEl.value,
        { top: '0%', opacity: 0 },
        {
          top: '100%',
          opacity: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: threadEl.value!,
            start: 'top 80%',
            end: 'bottom 20%',
            scrub: 1,
            onEnter: () => gsap.set(dotEl.value!, { opacity: 1 }),
            onLeaveBack: () => gsap.set(dotEl.value!, { opacity: 0 }),
          },
        }
      )
    }
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

.thread-glow-dot {
  position: absolute;
  left: 50%;
  top: 0;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--color-accent-red, #ed544d);
  transform: translate(-50%, -50%);
  opacity: 0;
  z-index: 3;
  box-shadow:
    0 0 8px rgba(237, 84, 77, 0.6),
    0 0 24px rgba(237, 84, 77, 0.25);
}

@media (max-width: 767px) {
  .thread-line {
    left: 20px;
  }
  .thread-glow-dot {
    left: 20px;
  }
}
</style>
