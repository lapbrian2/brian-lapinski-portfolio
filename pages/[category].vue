<template>
  <div class="min-h-screen bg-dark-900 overflow-x-hidden">
    <!-- Back navigation -->
    <header class="fixed top-0 left-0 right-0 z-50 px-6 md:px-12 py-5">
      <div class="flex items-center justify-between">
        <NuxtLink
          to="/#work"
          class="inline-flex items-center gap-2 text-lavender-300 hover:text-white transition-colors group"
        >
          <svg class="w-5 h-5 transition-transform group-hover:-translate-x-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="m12 19-7-7 7-7" />
            <path d="M19 12H5" />
          </svg>
          <span class="font-body text-sm">Back to Gallery</span>
        </NuxtLink>

        <NuxtLink to="/" class="font-display text-lg font-bold text-lavender-100 hover:text-white transition-colors">
          BL
        </NuxtLink>
      </div>
    </header>

    <!-- Hero -->
    <section ref="heroEl" class="pt-32 pb-12 px-6 md:px-12">
      <div class="max-w-5xl mx-auto text-center">
        <p class="font-body text-xs uppercase tracking-[0.3em] text-accent-red mb-4">
          {{ categoryArtworks.length }} Works
        </p>
        <h1 ref="titleEl" class="font-display text-hero font-bold text-lavender-100 leading-none mb-6 capitalize">
          {{ categoryLabel }}
        </h1>
        <p class="font-body text-lg text-lavender-300 max-w-xl mx-auto">
          {{ categoryDescription }}
        </p>
      </div>
    </section>

    <!-- 3D Carousel -->
    <section class="pb-16">
      <ClientOnly>
        <GalleryCarousel3D :artworks="categoryArtworks" />
      </ClientOnly>
    </section>

    <!-- Artwork Details Grid -->
    <section class="px-6 md:px-12 pb-24">
      <div class="max-w-6xl mx-auto">
        <h2 class="font-display text-heading font-bold text-lavender-100 mb-10 text-center">
          All {{ categoryLabel }}
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="artwork in categoryArtworks"
            :key="artwork.id"
            class="group bg-dark-800/50 border border-lavender-400/10 rounded-2xl overflow-hidden hover:border-accent-red/30 transition-colors duration-300 cursor-pointer"
            @click="openLightbox(artwork)"
          >
            <div class="aspect-[4/3] overflow-hidden">
              <img
                :src="artwork.src"
                :alt="artwork.title"
                class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <div class="p-5">
              <h3 class="font-display text-lg font-semibold text-lavender-100 mb-1">{{ artwork.title }}</h3>
              <p class="font-body text-sm text-lavender-400 mb-3">{{ artwork.medium }} &middot; {{ artwork.year }}</p>
              <p class="font-body text-sm text-lavender-300/70 line-clamp-2">{{ artwork.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Category Navigation -->
    <section class="px-6 md:px-12 pb-24">
      <div class="max-w-4xl mx-auto">
        <h3 class="font-body text-xs uppercase tracking-[0.2em] text-lavender-400/60 text-center mb-6">
          Explore More
        </h3>
        <div class="flex flex-wrap justify-center gap-3">
          <NuxtLink
            v-for="cat in otherCategories"
            :key="cat.id"
            :to="`/${cat.id}`"
            class="px-6 py-3 rounded-full border font-body text-sm uppercase tracking-wider transition-all duration-300"
            :class="cat.id === category
              ? 'bg-accent-red/15 border-accent-red/40 text-accent-red'
              : 'border-lavender-400/20 text-lavender-400 hover:border-lavender-200 hover:text-lavender-200'"
          >
            {{ cat.label }}
            <span class="ml-1.5 text-[10px] opacity-60">{{ cat.count }}</span>
          </NuxtLink>
        </div>
      </div>
    </section>

    <GalleryLightbox />
  </div>
</template>

<script setup lang="ts">
import type { Artwork } from '~/types/artwork'

definePageMeta({ layout: false })

const route = useRoute()
const category = computed(() => route.params.category as string)

const validCategories = ['portraits', 'landscapes', 'abstract', 'surreal']

// Redirect if invalid category
if (!validCategories.includes(category.value)) {
  navigateTo('/')
}

const { artworks } = useArtworks()
const lightbox = useLightbox()

const categoryArtworks = computed(() =>
  artworks.value.filter((a: Artwork) => a.category === category.value)
)

const categoryLabel = computed(() => {
  return category.value.charAt(0).toUpperCase() + category.value.slice(1)
})

const categoryDescriptions: Record<string, string> = {
  portraits: 'Faces that dissolve, fracture, and reconstruct — exploring identity through the lens of artificial imagination.',
  landscapes: 'Impossible vistas and liminal spaces where architecture meets atmosphere in dreamlike harmony.',
  abstract: 'Raw emotion rendered in color and form — chaos distilled into visual frequency.',
  surreal: 'Where logic ends and wonder begins — creatures, machines, and visions from the edge of consciousness.',
}

const categoryDescription = computed(() => categoryDescriptions[category.value] || '')

const otherCategories = computed(() => {
  return validCategories.map((id) => ({
    id,
    label: id.charAt(0).toUpperCase() + id.slice(1),
    count: artworks.value.filter((a: Artwork) => a.category === id).length,
  }))
})

function openLightbox(artwork: Artwork) {
  const index = categoryArtworks.value.findIndex((a: Artwork) => a.id === artwork.id)
  const items = categoryArtworks.value.map((a: Artwork) => ({
    id: a.id,
    src: a.src,
    title: a.title,
    medium: a.medium,
    description: a.description,
    year: a.year,
  }))
  lightbox.open(items, index >= 0 ? index : 0)
}

useHead({
  title: `${categoryLabel.value} | Brian Lapinski`,
  meta: [
    { name: 'description', content: categoryDescription.value },
  ],
})
</script>
