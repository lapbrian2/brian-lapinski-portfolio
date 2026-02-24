<script setup lang="ts">
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

defineProps<{
  variant?: 'default' | 'accent'
}>()

const dividerEl = ref<HTMLElement | null>(null)
let ctx: gsap.Context | null = null

onMounted(() => {
  if (!dividerEl.value) return

  ctx = gsap.context(() => {
    gsap.fromTo(
      dividerEl.value!.querySelector('.divider-line'),
      { scaleX: 0 },
      {
        scaleX: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: dividerEl.value!,
          start: 'top 90%',
          end: 'top 50%',
          scrub: 1,
        },
      },
    )
  }, dividerEl.value)
})

onUnmounted(() => {
  ctx?.revert()
})
</script>

<template>
  <div ref="dividerEl" class="relative h-[120px] flex items-center justify-center overflow-hidden">
    <!-- Gradient bleed zones -->
    <div class="absolute inset-0 bg-gradient-to-b from-transparent via-dark-800/30 to-transparent" />

    <!-- Center line -->
    <div
      class="divider-line w-full max-w-[200px] h-px origin-center"
      :class="variant === 'accent' ? 'bg-accent-red/20' : 'bg-lavender-400/10'"
    />
  </div>
</template>
