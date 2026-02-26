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
        I didn't come to AI art through technology &mdash; I came through a need to
        understand something about myself. Every piece I create starts with a
        feeling, a question, or a moment of genuine curiosity about the human
        experience.
      </p>
      <p class="font-body text-base leading-relaxed text-lavender-300">
        I'm drawn to images that speak without words. The ones that stop you for
        a second and create a quiet connection between strangers. That's what I
        chase &mdash; not trends, not technique for its own sake, but emotional truth.
      </p>
      <p class="font-body text-base leading-relaxed text-lavender-300">
        Teaching is central to what I do. As AI Architect at
        <a
          href="https://www.linkedin.com/company/the-house-of-curiosity"
          target="_blank"
          rel="noopener noreferrer"
          class="text-accent-red hover:text-accent-red/80 transition-colors duration-200 underline decoration-accent-red/30 underline-offset-2 hover:decoration-accent-red/60"
        >The House of Curiosity</a>,
        Creative Partner at ImagineArt and Caimera, and a contributor to Creativa
        Magazine Volume 7, I help others discover their own creative voice through
        AI. My Style DNA methodology treats prompt engineering as a reproducible
        craft &mdash; giving artists a framework to translate inner vision into
        language machines can interpret.
      </p>
      <p class="font-body text-base leading-relaxed text-lavender-300">
        <a
          href="https://www.linkedin.com/company/the-house-of-curiosity"
          target="_blank"
          rel="noopener noreferrer"
          class="text-accent-red hover:text-accent-red/80 transition-colors duration-200 underline decoration-accent-red/30 underline-offset-2 hover:decoration-accent-red/60"
        >The House of Curiosity</a>
        is a home for the endlessly curious &mdash; a space where real people
        learn openly, explore ideas together, and grow through what we call
        <span class="text-lavender-200 italic">#TheCuriosityEffect</span>.
        Through free workshops, a welcoming community, and deeper coaching
        programs, THC helps creators and builders turn curiosity into craft. It's
        the philosophy behind everything I teach.
      </p>
      <p class="font-body text-base leading-relaxed text-lavender-300">
        My work has been exhibited internationally &mdash; Dream AI Gallery in New
        Jersey, Fundaci&oacute;n Nestl&eacute; Barcelona, FNAC Asturias, and Art
        Innovation Gallery in New York. Each exhibition is a conversation with a
        new audience, and that's what keeps this practice alive.
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
