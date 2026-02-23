<template>
  <div ref="headingEl" class="mb-12">
    <h2 class="font-display text-section font-bold text-lavender-100">
      {{ title }}
    </h2>
    <p v-if="subtitle" class="font-body text-lg text-lavender-300 mt-2 max-w-2xl">
      {{ subtitle }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { useScrollReveal } from '~/composables/useScrollReveal'

defineProps<{
  title: string
  subtitle?: string
}>()

const headingEl = ref<HTMLElement | null>(null)

useScrollReveal(headingEl, {
  y: 30,
  duration: 0.7,
})
</script>
