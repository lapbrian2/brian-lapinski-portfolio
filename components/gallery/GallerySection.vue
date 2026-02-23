<script setup lang="ts">
import type { Artwork } from '~/types/artwork'
import { useSectionTransition } from '~/composables/useSectionTransition'
import { useScrollReveal } from '~/composables/useScrollReveal'

const { artworks } = useArtworks()
const activeCategory = ref('all')
const sectionEl = ref<HTMLElement | null>(null)
const headingEl = ref<HTMLElement | null>(null)

// Curated selection for homepage — the best 12 across all categories
const featuredIds = [
  'the-watcher',
  'bloom-of-decay',
  'the-nobleman',
  'primal-scream',
  'the-gathering',
  'metamorphosis',
  'the-crossing',
  'gorgons-cry',
  'first-encounter',
  'the-offering',
  'red-sun-garden',
  'city-vortex',
]

const selectedWorks = computed<Artwork[]>(() => {
  // Preserve curated order
  return featuredIds
    .map((id) => artworks.value.find((a: Artwork) => a.id === id))
    .filter((a): a is Artwork => !!a)
})

useSectionTransition(sectionEl, { parallaxIntensity: 0.2, scaleFrom: 0.98 })
useScrollReveal(headingEl, { y: 30, stagger: 0.1, children: true })
</script>

<template>
  <section id="work" ref="sectionEl" class="section">
    <!-- Heading area -->
    <div ref="headingEl" class="mb-16">
      <div class="flex items-center gap-3 mb-4">
        <p class="font-body text-xs uppercase tracking-[0.2em] text-lavender-400/60">
          Portfolio
        </p>
        <span class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-accent-red/10 border border-accent-red/20 text-accent-red text-[10px] font-body font-medium tabular-nums">
          {{ selectedWorks.length }}
        </span>
      </div>
      <div class="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
        <h2 class="font-display text-section font-bold text-lavender-100 leading-none">
          Selected Works
        </h2>
        <p class="font-body text-base text-lavender-300 max-w-sm md:text-right">
          A curated collection of AI-generated art exploring what it means to be human.
        </p>
      </div>
    </div>

    <!-- Filter bar -->
    <div class="mb-10">
      <GalleryFilter v-model="activeCategory" :artworks="selectedWorks" :all-artworks="artworks" />
    </div>

    <!-- Grid -->
    <GalleryGrid :category="activeCategory" :artworks="selectedWorks" />

    <!-- Explore all categories -->
    <div class="mt-16 text-center">
      <p class="font-body text-sm text-lavender-400/60 mb-5">
        Explore the full collection across {{ artworks.length }} works
      </p>
      <div class="flex flex-wrap justify-center gap-3">
        <NuxtLink
          v-for="cat in ['portraits', 'landscapes', 'abstract', 'surreal']"
          :key="cat"
          :to="`/${cat}`"
          class="px-5 py-2.5 rounded-full border border-lavender-400/20 text-lavender-400 hover:border-accent-red/40 hover:text-accent-red font-body text-sm uppercase tracking-wider transition-all duration-300"
        >
          {{ cat }}
        </NuxtLink>
      </div>
    </div>
  </section>
</template>
