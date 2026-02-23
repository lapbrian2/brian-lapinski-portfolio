<template>
  <div class="glass rounded-xl p-8 h-full flex flex-col">
    <span class="font-display text-5xl font-bold text-accent-red/40 mb-4">
      {{ step.number }}
    </span>
    <h3 class="font-display text-xl font-semibold text-lavender-100 mb-4">
      {{ step.title }}
    </h3>
    <p class="font-body text-sm leading-relaxed text-lavender-300 flex-1">
      {{ step.description }}
    </p>
  </div>
</template>

<script setup lang="ts">
interface ProcessStepData {
  number: string
  title: string
  description: string
}

defineProps<{
  step: ProcessStepData
}>()
</script>
