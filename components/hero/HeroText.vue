<script setup lang="ts">
/**
 * HeroText.vue
 * Name + tagline overlay with a GSAP clip-path reveal animation on mount.
 */
import gsap from 'gsap'

const nameEl = ref<HTMLElement | null>(null)
const taglineEl = ref<HTMLElement | null>(null)

onMounted(() => {
  if (!nameEl.value || !taglineEl.value) return

  const tl = gsap.timeline()

  // 1. Name reveal: slide clip-path upward
  tl.fromTo(
    nameEl.value,
    { clipPath: 'inset(100% 0 0 0)' },
    {
      clipPath: 'inset(0 0 0 0)',
      duration: 0.8,
      ease: 'power3.out',
      delay: 0.5,
    },
  )

  // 2. Tagline fade-in (overlaps by 0.3s)
  tl.fromTo(
    taglineEl.value,
    { opacity: 0, y: 20 },
    {
      opacity: 1,
      y: 0,
      duration: 0.6,
      ease: 'power2.out',
    },
    '-=0.3',
  )
})
</script>

<template>
  <div class="flex flex-col items-center justify-center text-center px-4">
    <h1
      ref="nameEl"
      class="font-display font-bold text-hero text-lavender-100 uppercase tracking-tight leading-none"
      style="clip-path: inset(100% 0 0 0)"
    >
      Brian Lapinski
    </h1>

    <p
      ref="taglineEl"
      class="font-body text-lg md:text-xl text-lavender-300 font-light mt-4 tracking-wide opacity-0"
    >
      Exploring what it means to be human through images
    </p>
  </div>
</template>
