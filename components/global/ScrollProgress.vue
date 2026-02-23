<template>
  <div ref="progressBar" class="scroll-progress" />
</template>

<script setup lang="ts">
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const progressBar = ref<HTMLElement | null>(null)
let ctx: gsap.Context | null = null

onMounted(() => {
  if (!progressBar.value) return

  ctx = gsap.context(() => {
    gsap.to(progressBar.value, {
      scaleX: 1,
      ease: 'none',
      scrollTrigger: {
        trigger: document.body,
        start: 'top top',
        end: 'bottom bottom',
        scrub: true,
      },
    })
  })
})

onUnmounted(() => {
  ctx?.revert()
})
</script>
