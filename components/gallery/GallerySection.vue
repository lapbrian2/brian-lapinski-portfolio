<script setup lang="ts">
import { useSectionTransition } from '~/composables/useSectionTransition'
import { useScrollReveal } from '~/composables/useScrollReveal'

const { artworks } = useArtworks()
const activeCategory = ref('all')
const sectionEl = ref<HTMLElement | null>(null)
const headingEl = ref<HTMLElement | null>(null)

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
          {{ artworks.length }}
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
      <GalleryFilter v-model="activeCategory" :artworks="artworks" />
    </div>

    <!-- Grid -->
    <GalleryGrid :category="activeCategory" :artworks="artworks" />
  </section>
</template>
