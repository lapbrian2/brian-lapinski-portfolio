<script setup lang="ts">
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const sectionEl = ref<HTMLElement | null>(null)
const imageEl = ref<HTMLElement | null>(null)
const textEl = ref<HTMLElement | null>(null)
let ctx: gsap.Context | null = null

// Signature piece — The Watcher as the showcase
const showcase = {
  title: 'The Watcher',
  medium: 'Midjourney · 2025',
  description: 'A sentient eye erupts from organic matter, crowned with lightning — the boundary between seeing and being seen dissolves.',
  src: '/images/artworks/the-watcher.webp',
}

onMounted(() => {
  if (!sectionEl.value || !imageEl.value || !textEl.value) return

  ctx = gsap.context(() => {
    // Parallax image — drifts slower than scroll for depth
    gsap.fromTo(imageEl.value!, { scale: 1.15, y: '-8%' }, {
      scale: 1,
      y: '8%',
      ease: 'none',
      scrollTrigger: {
        trigger: sectionEl.value!,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
      },
    })

    // Text elements reveal as section enters viewport
    const textChildren = textEl.value!.children
    gsap.fromTo(textChildren, { x: -40, opacity: 0 }, {
      x: 0,
      opacity: 1,
      stagger: 0.08,
      ease: 'none',
      scrollTrigger: {
        trigger: sectionEl.value!,
        start: 'top 70%',
        end: 'top 20%',
        scrub: 1,
      },
    })
  }, sectionEl.value)
})

onUnmounted(() => {
  ctx?.revert()
})
</script>

<template>
  <section ref="sectionEl" class="relative h-screen w-full overflow-hidden">
    <!-- Full-viewport image -->
    <div class="absolute inset-0">
      <img
        ref="imageEl"
        :src="showcase.src"
        :alt="showcase.title"
        class="w-full h-full object-cover will-change-transform"
        loading="lazy"
        draggable="false"
      />
    </div>

    <!-- Gradient overlays for text legibility -->
    <div class="absolute inset-0 bg-gradient-to-r from-dark-900/80 via-dark-900/30 to-transparent pointer-events-none" />
    <div class="absolute inset-0 bg-gradient-to-t from-dark-900/70 via-transparent to-dark-900/40 pointer-events-none" />

    <!-- Text content — left-aligned, vertically centered -->
    <div ref="textEl" class="absolute inset-0 flex flex-col justify-center px-8 md:px-16 lg:px-24 max-w-3xl">
      <p class="font-body text-xs uppercase tracking-[0.2em] text-lavender-300 mb-4">
        Featured Work
      </p>
      <h2 class="font-display text-4xl md:text-6xl lg:text-7xl font-bold text-lavender-100 leading-none mb-6">
        {{ showcase.title }}
      </h2>
      <p class="font-body text-sm md:text-base text-lavender-300/80 max-w-lg leading-relaxed mb-4">
        {{ showcase.description }}
      </p>
      <p class="font-body text-xs uppercase tracking-[0.15em] text-lavender-400/50">
        {{ showcase.medium }}
      </p>
    </div>
  </section>
</template>
