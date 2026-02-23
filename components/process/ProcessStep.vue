<template>
  <div class="process-card glass rounded-xl p-8 h-full flex flex-col relative overflow-hidden group">
    <!-- Background number watermark -->
    <span class="absolute -top-4 -right-2 font-display text-[8rem] font-bold text-lavender-100/[0.02] leading-none select-none pointer-events-none">
      {{ step.number }}
    </span>

    <!-- Top: number + accent line -->
    <div class="flex items-center gap-4 mb-6">
      <span class="font-display text-4xl font-bold text-accent-red/50 leading-none">
        {{ step.number }}
      </span>
      <div class="flex-1 h-px bg-gradient-to-r from-accent-red/20 to-transparent" />
    </div>

    <h3 class="font-display text-xl font-semibold text-lavender-100 mb-4 group-hover:text-accent-red transition-colors duration-500">
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
