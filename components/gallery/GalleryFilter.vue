<script setup lang="ts">
import gsap from 'gsap'
import { categories } from '~/data/artworks'

defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const containerEl = ref<HTMLElement | null>(null)
const pillEl = ref<HTMLElement | null>(null)

function movePill(catId: string) {
  if (!containerEl.value || !pillEl.value) return
  const btn = containerEl.value.querySelector(`[data-filter="${catId}"]`) as HTMLElement
  if (!btn) return

  const containerRect = containerEl.value.getBoundingClientRect()
  const btnRect = btn.getBoundingClientRect()

  gsap.to(pillEl.value, {
    x: btnRect.left - containerRect.left,
    width: btnRect.width,
    duration: 0.45,
    ease: 'power3.out',
  })
}

function selectFilter(catId: string) {
  emit('update:modelValue', catId)
  movePill(catId)
}

onMounted(() => {
  nextTick(() => {
    // Position pill on the initial active button
    movePill(categories[0].id)
  })
})
</script>

<template>
  <div ref="containerEl" class="relative flex flex-wrap gap-2">
    <!-- Sliding pill indicator -->
    <div
      ref="pillEl"
      class="absolute top-0 left-0 h-full rounded-full bg-accent-red/15 border border-accent-red/40 pointer-events-none"
      style="will-change: transform, width"
    />

    <button
      v-for="cat in categories"
      :key="cat.id"
      :data-filter="cat.id"
      :class="[
        'relative z-10 px-5 py-2 rounded-full text-sm font-body uppercase tracking-wider transition-colors duration-300 cursor-hover',
        modelValue === cat.id
          ? 'text-accent-red font-medium'
          : 'text-lavender-400 hover:text-lavender-200',
      ]"
      @click="selectFilter(cat.id)"
    >
      {{ cat.label }}
    </button>
  </div>
</template>
