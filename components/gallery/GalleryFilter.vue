<script setup lang="ts">
import { categories } from '~/data/artworks'

defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>

<template>
  <div class="flex flex-wrap gap-3">
    <button
      v-for="cat in categories"
      :key="cat.id"
      :class="[
        'px-5 py-2 rounded-full text-sm font-body uppercase tracking-wider transition-all duration-200 ease-in-out border',
        modelValue === cat.id
          ? 'bg-accent-red text-white border-accent-red'
          : 'bg-dark-700 text-lavender-300 border-transparent hover:bg-dark-600 hover:text-lavender-100',
      ]"
      @click="emit('update:modelValue', cat.id)"
    >
      {{ cat.label }}
    </button>
  </div>
</template>
