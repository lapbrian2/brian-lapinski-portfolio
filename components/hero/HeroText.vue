<script setup lang="ts">
import gsap from 'gsap'

const nameEl = ref<HTMLElement | null>(null)
const taglineEl = ref<HTMLElement | null>(null)
let ctx: gsap.Context | null = null

onMounted(() => {
  if (!nameEl.value || !taglineEl.value) return

  ctx = gsap.context(() => {
    const tl = gsap.timeline()

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
})

onUnmounted(() => {
  ctx?.revert()
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
