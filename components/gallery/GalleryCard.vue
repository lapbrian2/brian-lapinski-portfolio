<script setup lang="ts">
import type { Artwork } from '~/data/artworks'

defineProps<{
  artwork: Artwork
  index: number
}>()

defineEmits<{
  click: []
}>()

const aspectClasses: Record<Artwork['aspect'], string> = {
  tall: 'aspect-[3/4]',
  wide: 'aspect-[4/3]',
  square: 'aspect-square',
}
</script>

<template>
  <div
    class="group relative overflow-hidden rounded-lg cursor-pointer transition-transform duration-300 hover:scale-[1.02]"
    :class="aspectClasses[artwork.aspect]"
    @click="$emit('click')"
  >
    <!-- Placeholder image / colored background -->
    <div
      class="absolute inset-0 w-full h-full bg-dark-700 bg-gradient-to-br from-dark-700 to-dark-800 flex items-center justify-center"
    >
      <span class="font-display text-sm text-lavender-400 text-center px-4 select-none">
        {{ artwork.title }}
      </span>
    </div>

    <!-- Hover overlay -->
    <div
      class="absolute inset-0 bg-gradient-to-t from-dark-900/80 to-transparent opacity-0 translate-y-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0 flex items-end"
    >
      <div class="p-6">
        <h3 class="font-display text-lg text-lavender-100">
          {{ artwork.title }}
        </h3>
        <p class="text-sm text-lavender-300 mt-1">
          {{ artwork.medium }}
        </p>
      </div>
    </div>
  </div>
</template>
