<template>
  <section id="contact" class="section">
    <div class="max-w-3xl mx-auto text-center">
      <h2
        ref="headingRef"
        class="font-display text-section font-bold text-lavender-100 mb-4"
      >
        Let's Connect
      </h2>
      <p class="font-body text-lg text-lavender-300 mb-16">
        Interested in collaborations, commissions, or just want to talk about AI art?
      </p>
    </div>
    <ContactLinks />
  </section>
</template>

<script setup lang="ts">
import { useScrollReveal } from '~/composables/useScrollReveal'

const headingRef = ref<HTMLElement | null>(null)

useScrollReveal(headingRef, {
  y: 30,
  duration: 0.8,
})
</script>
