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
  'the-deep-one',
  'the-procession',
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

    <!-- Explore full collection -->
    <div class="mt-20 pt-12 border-t border-lavender-400/10">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
        <div>
          <p class="font-body text-xs uppercase tracking-[0.2em] text-lavender-400/60 mb-2">
            Full Collection
          </p>
          <p class="font-display text-xl md:text-2xl font-semibold text-lavender-100">
            Explore all {{ artworks.length }} works by category
          </p>
        </div>
        <div class="flex flex-wrap gap-3">
          <NuxtLink
            v-for="cat in ['portraits', 'landscapes', 'abstract', 'surreal']"
            :key="cat"
            :to="`/${cat}`"
            class="group px-5 py-2.5 rounded-full border border-lavender-400/20 text-lavender-400 hover:border-accent-red/40 hover:text-accent-red hover:bg-accent-red/5 font-body text-sm uppercase tracking-wider transition-all duration-300 inline-flex items-center gap-2"
          >
            {{ cat }}
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" class="opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
              <line x1="1" y1="6" x2="11" y2="6" />
              <polyline points="7 2 11 6 7 10" />
            </svg>
          </NuxtLink>
        </div>
      </div>
    </div>
  </section>
</template>
