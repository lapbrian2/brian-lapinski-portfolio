<script setup lang="ts">
import { artworks, type Artwork } from '~/data/artworks'

const props = defineProps<{
  category: string
}>()

const lightbox = useLightbox()

const filteredArtworks = computed<Artwork[]>(() => {
  if (props.category === 'all') return artworks
  return artworks.filter((a) => a.category === props.category)
})

function openLightbox(index: number) {
  const items = filteredArtworks.value.map((a) => ({
    src: a.src,
    title: a.title,
    medium: a.medium,
  }))
  lightbox.open(items, index)
}
</script>

<template>
  <div
    class="grid gap-6"
    style="grid-template-columns: repeat(auto-fill, minmax(300px, 1fr))"
  >
    <TransitionGroup
      name="gallery"
      tag="div"
      class="contents"
    >
      <GalleryCard
        v-for="(artwork, index) in filteredArtworks"
        :key="artwork.id"
        :artwork="artwork"
        :index="index"
        @click="openLightbox(index)"
      />
    </TransitionGroup>
  </div>
</template>

<style scoped>
.gallery-enter-active,
.gallery-leave-active {
  transition: all 0.4s cubic-bezier(0.25, 0.1, 0.25, 1);
}

.gallery-enter-from {
  opacity: 0;
  transform: translateY(16px) scale(0.96);
}

.gallery-leave-to {
  opacity: 0;
  transform: translateY(-12px) scale(0.96);
}

.gallery-move {
  transition: transform 0.4s cubic-bezier(0.25, 0.1, 0.25, 1);
}
</style>
