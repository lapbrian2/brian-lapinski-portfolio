<template>
  <canvas
    ref="canvasEl"
    class="fixed inset-0 pointer-events-none hidden md:block"
    :style="{ zIndex: 0 }"
    aria-hidden="true"
  />
</template>

<script setup lang="ts">
import { useGPUCapability } from '~/composables/useGPUCapability'
import { useParticleField } from '~/composables/useParticleField'

const canvasEl = ref<HTMLCanvasElement | null>(null)
const { tier, canRender, particleCount } = useGPUCapability()

let particleCleanup: (() => void) | null = null

onMounted(() => {
  if (!canRender.value || !canvasEl.value) return

  const { setup, cleanup } = useParticleField(canvasEl, {
    particleCount: particleCount.value,
    gpuTier: tier.value,
  })

  setup()
  particleCleanup = cleanup
})

onUnmounted(() => {
  particleCleanup?.()
  particleCleanup = null
})
</script>
