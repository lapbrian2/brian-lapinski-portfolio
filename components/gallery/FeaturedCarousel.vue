<script setup lang="ts">
import { useArtworks } from '~/composables/useArtworks'

const { artworks } = useArtworks()

// Pick featured artworks, or the first 8 if none are explicitly featured
const featured = computed(() => {
  const feat = artworks.value.filter((a) => a.featured)
  if (feat.length >= 4) return feat.slice(0, 12)
  // Fallback: first 8 artworks
  return artworks.value.slice(0, 8)
})
</script>

<template>
  <section v-if="featured.length >= 3" class="py-24 overflow-hidden">
    <div class="max-w-7xl mx-auto px-6 md:px-12 mb-8 text-center">
      <p class="font-body text-xs uppercase tracking-[0.3em] text-accent-red mb-3">
        Featured Works
      </p>
      <h2 class="font-display text-2xl md:text-3xl font-bold text-lavender-100">
        Explore the Collection
      </h2>
    </div>
    <GalleryCarousel3D :artworks="featured" />
  </section>
</template>
