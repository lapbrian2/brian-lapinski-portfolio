<template>
  <div ref="bioRef">
    <p class="font-body text-xs uppercase tracking-[0.2em] text-lavender-300 mb-4">
      About
    </p>
    <h2 class="font-display text-section font-bold text-lavender-100 mb-10 leading-none">
      The Artist
    </h2>
    <div class="space-y-6">
      <p class="font-body text-base leading-relaxed text-lavender-200">
        I spent fifteen years on manufacturing floors &mdash; supervising
        production lines, earning a Lean Six Sigma Black Belt from Villanova,
        building systems that turned chaos into process. I have no formal art
        training. What I brought to AI image generation was something different:
        the belief that creativity, like manufacturing, can be both deeply
        personal and rigorously reproducible.
      </p>
      <p class="font-body text-base leading-relaxed text-lavender-300">
        That belief became
        <span class="text-lavender-200 font-medium">Style DNA</span> &mdash; my
        methodology for reverse-engineering visual styles into reproducible
        parameters. Where most creators treat prompting as improvisation, I treat
        it as constraint satisfaction: isolating the variables that define a look,
        then systematically dialing them until the output matches the intent. The
        methodology behind the output matters as much as the output itself.
      </p>
      <p class="font-body text-base leading-relaxed text-lavender-300">
        Today I serve as AI Architect and co-founder at
        <a
          href="https://www.linkedin.com/company/the-house-of-curiosity"
          target="_blank"
          rel="noopener noreferrer"
          class="text-accent-red hover:text-accent-red/80 transition-colors duration-200 underline decoration-accent-red/30 underline-offset-2 hover:decoration-accent-red/60"
        >The House of Curiosity</a>,
        where I designed the
        <span class="text-lavender-200 font-medium">7 AI Fluencies</span>
        curriculum and the
        <span class="text-lavender-200 font-medium">4D Framework</span>
        in partnership with Anthropic. As Creative Partner at ImagineArt and
        Caimera, I bridge the gap between what AI tools can do and what artists
        actually need. Everything I build is meant to be taught, shared, and
        improved by others.
      </p>
      <p class="font-body text-base leading-relaxed text-lavender-300">
        I work from the Pocono region of Pennsylvania, where I live with my two
        kids, Noah and Maddie. The quiet out here is good for the work &mdash;
        every piece still starts with a feeling or a question about what it means
        to be human, and the images I chase are the ones that create a connection
        between strangers without a single word.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useReducedMotion } from '~/composables/useMediaQuery'

const bioRef = ref<HTMLElement | null>(null)
const reducedMotion = useReducedMotion()
let ctx: gsap.Context | null = null

onMounted(() => {
  if (!bioRef.value) return

  // Respect reduced-motion preference
  if (reducedMotion.value) return

  ctx = gsap.context(() => {
    const paragraphs = bioRef.value!.querySelectorAll('p')

    paragraphs.forEach((p, i) => {
      gsap.set(p, { opacity: 0, y: 30 + i * 10 })
      ScrollTrigger.create({
        trigger: p,
        start: 'top 88%',
        once: true,
        onEnter: () => {
          gsap.to(p, {
            opacity: 1,
            y: 0,
            duration: 0.8,
            delay: i * 0.1,
            ease: 'power2.out',
            force3D: true,
          })
        },
      })
    })
  }, bioRef.value)
})

onUnmounted(() => {
  ctx?.revert()
})
</script>
