<template>
  <div ref="toolsRef">
    <h3 class="font-display text-heading font-semibold text-lavender-100 mb-8">
      Tools & Platforms
    </h3>
    <div ref="gridRef" class="grid grid-cols-2 sm:grid-cols-3 gap-4">
      <div
        v-for="(tool, i) in tools"
        :key="tool.name"
        class="tool-card glass rounded-lg p-4 text-center transition-colors duration-300 hover:border-accent-red/30 hover:shadow-lg hover:shadow-accent-red/5 cursor-default"
        @mouseenter="onCardEnter($event.currentTarget as HTMLElement)"
        @mouseleave="onCardLeave($event.currentTarget as HTMLElement)"
      >
        <span class="tool-icon text-2xl mb-2 block">{{ tool.icon }}</span>
        <span class="font-body text-sm text-lavender-200">{{ tool.name }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const tools = [
  { name: 'Midjourney', icon: '🎨' },
  { name: 'ImagineArt', icon: '✨' },
  { name: 'Caimera', icon: '📸' },
  { name: 'Style DNA', icon: '🧬' },
  { name: 'House of Curiosity', icon: '🏛️' },
  { name: 'Creativa Mag', icon: '📖' },
]

const toolsRef = ref<HTMLElement | null>(null)
const gridRef = ref<HTMLElement | null>(null)
let ctx: gsap.Context | null = null

function onCardEnter(el: HTMLElement) {
  gsap.to(el, { y: -4, scale: 1.03, duration: 0.3, ease: 'power2.out' })
  const icon = el.querySelector('.tool-icon')
  if (icon) gsap.to(icon, { rotate: 5, duration: 0.3, ease: 'power2.out' })
}

function onCardLeave(el: HTMLElement) {
  gsap.to(el, { y: 0, scale: 1, duration: 0.4, ease: 'power2.out' })
  const icon = el.querySelector('.tool-icon')
  if (icon) gsap.to(icon, { rotate: 0, duration: 0.4, ease: 'power2.out' })
}

onMounted(() => {
  if (!gridRef.value) return

  ctx = gsap.context(() => {
    const cards = gridRef.value!.querySelectorAll('.tool-card')

    gsap.set(cards, { opacity: 0, y: 30, scale: 0.95 })

    ScrollTrigger.create({
      trigger: gridRef.value!,
      start: 'top 85%',
      once: true,
      onEnter: () => {
        gsap.to(cards, {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.6,
          stagger: { each: 0.06, grid: 'auto', from: 'center' },
          ease: 'power3.out',
          force3D: true,
        })
      },
    })

    // Subtle floating icons
    const icons = gridRef.value!.querySelectorAll('.tool-icon')
    icons.forEach((icon, i) => {
      gsap.to(icon, {
        y: -3,
        duration: 2 + i * 0.3,
        yoyo: true,
        repeat: -1,
        ease: 'sine.inOut',
        delay: i * 0.2,
      })
    })
  }, gridRef.value)
})

onUnmounted(() => {
  ctx?.revert()
})
</script>
