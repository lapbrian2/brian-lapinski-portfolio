<template>
  <div class="process-card glass rounded-xl p-8 h-full flex flex-col relative overflow-hidden group hover:-translate-y-1 transition-transform duration-500">
    <!-- Background number watermark -->
    <span class="absolute -top-4 -right-2 font-display text-[8rem] font-bold text-lavender-100/[0.02] leading-none select-none pointer-events-none">
      {{ step.number }}
    </span>

    <!-- Accent top bar — draws in on reveal -->
    <div class="process-card__accent absolute top-0 left-0 right-0 h-[2px] bg-accent-red/40 origin-left" />

    <!-- Top: icon + number -->
    <div class="flex items-center gap-4 mb-6">
      <div class="process-card__icon flex-shrink-0 w-10 h-10 rounded-full bg-accent-red/8 border border-accent-red/15 flex items-center justify-center transition-all duration-500 group-hover:bg-accent-red/15 group-hover:border-accent-red/30">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="text-accent-red/70 group-hover:text-accent-red transition-colors duration-500">
          <!-- Step-specific icon paths -->
          <template v-if="step.number === '01'">
            <!-- Heart / feeling -->
            <path d="M9 15.5s-6-4.35-6-8.15A3.36 3.36 0 0 1 6.3 4C7.5 4 8.5 4.8 9 5.5c.5-.7 1.5-1.5 2.7-1.5A3.36 3.36 0 0 1 15 7.35c0 3.8-6 8.15-6 8.15z" />
          </template>
          <template v-else-if="step.number === '02'">
            <!-- DNA / craft -->
            <path d="M4 3c0 5 10 5 10 10M14 3c0 5-10 5-10 10" />
            <line x1="5" y1="8" x2="13" y2="8" />
          </template>
          <template v-else-if="step.number === '03'">
            <!-- Iterate / dialogue -->
            <path d="M3 9a6 6 0 0 1 10.5-4" />
            <polyline points="14 3 14 6 11 6" />
            <path d="M15 9a6 6 0 0 1-10.5 4" />
            <polyline points="4 15 4 12 7 12" />
          </template>
          <template v-else>
            <!-- Curate / select -->
            <rect x="3" y="3" width="12" height="12" rx="2" />
            <path d="M6.5 9.5L8 11l3.5-4" />
          </template>
        </svg>
      </div>
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
