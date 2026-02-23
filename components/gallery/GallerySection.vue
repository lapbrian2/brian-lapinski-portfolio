<script setup lang="ts">
import { useSectionTransition } from '~/composables/useSectionTransition'
import { useScrollReveal } from '~/composables/useScrollReveal'

const activeCategory = ref('all')
const sectionEl = ref<HTMLElement | null>(null)
const headingEl = ref<HTMLElement | null>(null)

useSectionTransition(sectionEl, { parallaxIntensity: 0.2, scaleFrom: 0.98 })
useScrollReveal(headingEl, { y: 30, stagger: 0.1, children: true })
</script>

<template>
  <section id="work" ref="sectionEl" class="section">
    <!-- Heading area -->
    <div ref="headingEl" class="mb-12">
      <h2 class="font-display text-section font-bold text-lavender-100">
        Selected Works
      </h2>
      <p class="font-body text-lg text-lavender-300 mt-2">
        A curated collection of AI-generated art
      </p>
    </div>

    <!-- Filter bar -->
    <div class="mb-8">
      <GalleryFilter v-model="activeCategory" />
    </div>

    <!-- Grid -->
    <GalleryGrid :category="activeCategory" />
  </section>
</template>
