<template>
  <section id="contact" ref="sectionEl" class="section">
    <div class="max-w-4xl mx-auto text-center">
      <!-- Large CTA heading with character animation -->
      <h2
        ref="headingEl"
        class="font-display text-hero font-bold text-lavender-100 mb-6 leading-none"
        style="perspective: 400px"
      >
        Let's Create Together
      </h2>
      <p ref="subtitleEl" class="font-body text-lg text-lavender-300 mb-16 opacity-0">
        Have a project, collaboration, or just want to talk about AI art?
      </p>
    </div>
    <ContactLinks />
  </section>
</template>

<script setup lang="ts">
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useSectionTransition } from '~/composables/useSectionTransition'
import Splitting from 'splitting'

const sectionEl = ref<HTMLElement | null>(null)
const headingEl = ref<HTMLElement | null>(null)
const subtitleEl = ref<HTMLElement | null>(null)

useSectionTransition(sectionEl, { scaleFrom: 0.95 })

let ctx: gsap.Context | null = null

onMounted(() => {
  if (!headingEl.value) return

  ctx = gsap.context(() => {
    // Character-level split animation from center
    const result = Splitting({ target: headingEl.value!, by: 'chars' })
    const chars = result[0]?.chars || []

    if (chars.length) {
      gsap.set(chars, { opacity: 0, y: 40, rotateX: -60 })

      ScrollTrigger.create({
        trigger: headingEl.value!,
        start: 'top 80%',
        once: true,
        onEnter: () => {
          gsap.to(chars, {
            opacity: 1,
            y: 0,
            rotateX: 0,
            duration: 0.7,
            stagger: { each: 0.03, from: 'center' },
            ease: 'power4.out',
            force3D: true,
          })

          // Subtitle fades in after heading
          gsap.to(subtitleEl.value, {
            opacity: 1,
            y: 0,
            duration: 0.6,
            delay: 0.5,
            ease: 'power2.out',
          })
        },
      })
    }
  }, sectionEl.value!)
})

onUnmounted(() => {
  ctx?.revert()
})
</script>

<style scoped>
:deep(.char) {
  display: inline-block;
  will-change: transform, opacity;
}
</style>
