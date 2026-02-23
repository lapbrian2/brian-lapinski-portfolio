<template>
  <div ref="bioRef">
    <h2 class="font-display text-section font-bold text-lavender-100 mb-8">
      About
    </h2>
    <div class="space-y-6">
      <p class="font-body text-base leading-relaxed text-lavender-200">
        I use images as a way to explore what it means to be human. My work is
        rooted in personal exploration, emotion, and connection — not trends or
        technique for its own sake.
      </p>
      <p class="font-body text-base leading-relaxed text-lavender-300">
        I'm interested in images that speak without words and create a quiet
        connection between people. Through creating and teaching, I see
        image-making as a form of self-discovery and shared understanding.
      </p>
      <p class="font-body text-base leading-relaxed text-lavender-300">
        As AI Architect at The House of Curiosity, Creative Partner at ImagineArt
        and Caimera, and a contributor to Creativa Magazine Volume 7, my practice
        bridges art and education — using my Style DNA methodology to treat image
        generation as a reproducible craft rather than random experimentation.
      </p>
      <p class="font-body text-base leading-relaxed text-lavender-300">
        My work has been exhibited internationally including Dream AI Gallery (NJ),
        Fundaci&oacute;n Nestl&eacute; Barcelona, FNAC Asturias, and Art Innovation
        Gallery New York.
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
