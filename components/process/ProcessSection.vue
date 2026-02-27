<template>
  <section id="process" ref="sectionEl" class="section relative">
    <div ref="headingEl">
      <p class="font-body text-xs uppercase tracking-[0.2em] text-lavender-300 mb-4">
        Process
      </p>
      <div class="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
        <h2 class="font-display font-bold text-lavender-100 leading-none process-heading">
          From Feeling to Form
        </h2>
        <p class="font-body text-base text-lavender-300 max-w-sm md:text-right">
          How AI art comes to life &mdash; a reproducible creative methodology.
        </p>
      </div>
    </div>

    <!-- Responsive grid — no pinned scroll, clean flow -->
    <div ref="gridEl" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <ProcessStep v-for="step in steps" :key="step.number" :step="step" />
    </div>
  </section>
</template>

<script setup lang="ts">
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useReducedMotion } from '~/composables/useMediaQuery'
import { useScrollReveal } from '~/composables/useScrollReveal'

interface ProcessStepData {
  number: string
  title: string
  description: string
}

const steps: ProcessStepData[] = [
  {
    number: '01',
    title: 'Intention & Feeling',
    description:
      'Every piece starts with a feeling or a question about what it means to be human. I don\'t chase trends \u2014 I follow what resonates emotionally and personally.',
  },
  {
    number: '02',
    title: 'Style DNA & Prompt Craft',
    description:
      'Using my Style DNA methodology, I treat prompt engineering as a reproducible craft. Detailed prompts capture mood, composition, and narrative \u2014 translating inner vision into language AI can interpret.',
  },
  {
    number: '03',
    title: 'Generation & Dialogue',
    description:
      'Through Midjourney and ImagineArt, I generate and iterate \u2014 not randomly, but systematically. Each batch reveals new possibilities, guiding a creative dialogue between human intent and machine capability.',
  },
  {
    number: '04',
    title: 'Curation & Connection',
    description:
      'From hundreds of generations, I select the images that speak without words \u2014 the ones that create a quiet connection between people. The final piece is about emotional truth, not technical perfection.',
  },
]

const reducedMotion = useReducedMotion()
const sectionEl = ref<HTMLElement | null>(null)
const headingEl = ref<HTMLElement | null>(null)
const gridEl = ref<HTMLElement | null>(null)

useScrollReveal(headingEl, { y: 30, stagger: 0.1, children: true })

let ctx: gsap.Context | null = null

onMounted(() => {
  if (!gridEl.value || reducedMotion.value) return

  ctx = gsap.context(() => {
    const cards = gridEl.value!.children
    gsap.set(cards, { opacity: 0, y: 40 })
    ScrollTrigger.create({
      trigger: gridEl.value!,
      start: 'top 85%',
      once: true,
      onEnter: () => {
        gsap.to(cards, {
          opacity: 1,
          y: 0,
          duration: 0.7,
          stagger: 0.12,
          ease: 'power3.out',
          force3D: true,
          onComplete() {
            this.targets().forEach((el: HTMLElement) => gsap.set(el, { clearProps: 'transform,willChange,force3D' }))
          },
        })
      },
    })
  }, gridEl.value)
})

onUnmounted(() => {
  ctx?.revert()
})
</script>

<style scoped>
.process-heading {
  font-size: clamp(2.5rem, 6vw, 5rem);
  letter-spacing: -0.03em;
}
</style>
