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
    const line = dividerEl.value!.querySelector('.divider-line')
    const diamond = dividerEl.value!.querySelector('.divider-diamond')
    gsap.set(line, { scaleX: 0 })
    if (diamond) gsap.set(diamond, { scale: 0, opacity: 0 })

    ScrollTrigger.create({
      trigger: dividerEl.value!,
      start: 'top 85%',
      once: true,
      onEnter: () => {
        gsap.to(line, { scaleX: 1, duration: 0.8, ease: 'power2.out' })
        // Diamond pops in after line finishes drawing
        if (diamond) {
          gsap.to(diamond, {
            scale: 1,
            opacity: 1,
            duration: 0.4,
            delay: 0.6,
            ease: 'back.out(3)',
          })
        }
      },
    })
  }, dividerEl.value)
})

onUnmounted(() => {
  ctx?.revert()
})
</script>

<template>
  <div ref="dividerEl" class="relative h-[60px] flex items-center justify-center overflow-hidden">
    <!-- Gradient bleed zones -->
    <div class="absolute inset-0 bg-gradient-to-b from-transparent via-dark-800/30 to-transparent" />

    <!-- Center line -->
    <div
      class="divider-line w-full max-w-[200px] h-px origin-center"
      :class="variant === 'accent' ? 'bg-accent-red/20' : 'bg-lavender-400/10'"
    />

    <!-- Center diamond ornament -->
    <div
      class="divider-diamond absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rotate-45"
      :class="variant === 'accent' ? 'bg-accent-red/40 shadow-[0_0_8px_rgba(237,84,77,0.2)]' : 'border border-lavender-400/20 bg-dark-900'"
    />
  </div>
</template>
