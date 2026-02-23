<template>
  <div ref="toolsRef">
    <p class="font-body text-xs uppercase tracking-[0.2em] text-lavender-400/60 mb-4">
      Tools
    </p>
    <h3 class="font-display text-heading font-semibold text-lavender-100 mb-8 leading-none">
      Platforms & Practice
    </h3>
    <div ref="gridRef" class="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <div
        v-for="(tool, i) in tools"
        :key="tool.name"
        class="tool-card group glass rounded-lg px-5 py-4 flex items-center gap-4 transition-all duration-300 hover:border-accent-red/20"
        @mouseenter="onCardEnter($event.currentTarget as HTMLElement)"
        @mouseleave="onCardLeave($event.currentTarget as HTMLElement)"
      >
        <span class="tool-icon flex-shrink-0 w-9 h-9 rounded-full bg-dark-700 border border-dark-600 flex items-center justify-center text-lavender-300 group-hover:border-accent-red/30 group-hover:text-accent-red transition-all duration-300">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round">
            <path :d="tool.icon" />
          </svg>
        </span>
        <div>
          <span class="font-body text-sm text-lavender-200 block leading-tight">{{ tool.name }}</span>
          <span class="font-body text-xs text-lavender-400/60 leading-tight">{{ tool.role }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const tools = [
  { name: 'Midjourney', role: 'Primary medium', icon: 'M3 3l10 10M13 3L3 13' },
  { name: 'ImagineArt', role: 'Creative Partner', icon: 'M8 2L2 8l6 6 6-6z' },
  { name: 'Caimera', role: 'Creative Partner', icon: 'M2 4h12v8H2zM5 4V2M11 4V2' },
  { name: 'Style DNA', role: 'Methodology', icon: 'M4 2c0 6 8 6 8 12M12 2c0 6-8 6-8 12' },
  { name: 'House of Curiosity', role: 'AI Architect', icon: 'M8 2L2 6v8l6 0 6 0V6z' },
  { name: 'Creativa Magazine', role: 'Contributor', icon: 'M3 2h10v12H3zM6 2v12M6 5h4M6 8h3' },
]

const toolsRef = ref<HTMLElement | null>(null)
const gridRef = ref<HTMLElement | null>(null)
let ctx: gsap.Context | null = null

function onCardEnter(el: HTMLElement) {
  gsap.to(el, { y: -2, duration: 0.3, ease: 'power2.out' })
}

function onCardLeave(el: HTMLElement) {
  gsap.to(el, { y: 0, duration: 0.4, ease: 'power2.out' })
}

onMounted(() => {
  if (!gridRef.value) return

  ctx = gsap.context(() => {
    const cards = gridRef.value!.querySelectorAll('.tool-card')

    gsap.set(cards, { opacity: 0, y: 20 })

    ScrollTrigger.create({
      trigger: gridRef.value!,
      start: 'top 85%',
      once: true,
      onEnter: () => {
        gsap.to(cards, {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: { each: 0.06, from: 'start' },
          ease: 'power3.out',
          force3D: true,
        })
      },
    })
  }, gridRef.value)
})

onUnmounted(() => {
  ctx?.revert()
})
</script>
