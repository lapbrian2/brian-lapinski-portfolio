<template>
  <div ref="toolsRef">
    <h3 class="font-display text-heading font-semibold text-lavender-100 mb-8">
      Tools & Platforms
    </h3>
    <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
      <div
        v-for="tool in tools"
        :key="tool.name"
        class="glass rounded-lg p-4 text-center transition-all duration-300 hover:border-accent-red/30 hover:shadow-lg hover:shadow-accent-red/5"
      >
        <span class="text-2xl mb-2 block">{{ tool.icon }}</span>
        <span class="font-body text-sm text-lavender-200">{{ tool.name }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useScrollReveal } from '~/composables/useScrollReveal'

const tools = [
  { name: 'Midjourney', icon: '🎨' },
  { name: 'ImagineArt', icon: '✨' },
  { name: 'Caimera', icon: '📸' },
  { name: 'Style DNA', icon: '🧬' },
  { name: 'House of Curiosity', icon: '🏛️' },
  { name: 'Creativa Mag', icon: '📖' },
]

const toolsRef = ref<HTMLElement | null>(null)

useScrollReveal(toolsRef, {
  y: 30,
  stagger: 0.08,
  children: true,
  start: 'top 85%',
})
</script>
