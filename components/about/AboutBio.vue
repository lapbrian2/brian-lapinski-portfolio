<template>
  <div ref="bioRef">
    <h2 class="font-display text-section font-bold text-lavender-100 mb-8">
      About
    </h2>
    <div class="space-y-6">
      <p class="font-body text-base leading-relaxed text-lavender-200">
        I'm Brian Lapinski — an AI artist exploring the intersection of artificial
        intelligence and creative vision. My work lives at the boundary where
        technology becomes art, where algorithms dream, and where prompts become
        portals to unseen worlds.
      </p>
      <p class="font-body text-base leading-relaxed text-lavender-300">
        Through tools like Midjourney, Stable Diffusion, and DALL-E, I craft
        images that challenge perception and invite viewers to question what is
        real and what is imagined. Each piece begins with an idea — a feeling, a
        concept, a fragment of a dream — and evolves through iterative dialogue
        with AI systems.
      </p>
      <p class="font-body text-base leading-relaxed text-lavender-300">
        My practice combines prompt engineering with traditional post-processing
        techniques, blending the raw output of neural networks with intentional
        artistic direction. The result is work that feels both alien and deeply
        human.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useScrollReveal } from '~/composables/useScrollReveal'

const bioRef = ref<HTMLElement | null>(null)

useScrollReveal(bioRef, {
  y: 40,
  stagger: 0.15,
  children: true,
})
</script>
