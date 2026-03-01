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

    <!-- Connecting timeline (desktop only) — horizontal line with step dots -->
    <div ref="timelineEl" class="hidden lg:block relative mb-8">
      <div class="process-timeline__line absolute top-1/2 left-0 right-0 h-px bg-lavender-400/10 -translate-y-1/2 origin-left" />
      <div class="grid grid-cols-4 gap-6 relative">
        <div v-for="(step, i) in steps" :key="step.number" class="flex justify-center">
          <div class="process-timeline__dot w-3 h-3 rounded-full border-2 border-accent-red/40 bg-dark-900 relative z-10" />
        </div>
      </div>
    </div>

    <!-- Responsive grid — no pinned scroll, clean flow -->
    <div ref="gridEl" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
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
const timelineEl = ref<HTMLElement | null>(null)

useScrollReveal(headingEl, { y: 30, stagger: 0.1, children: true })

let ctx: gsap.Context | null = null

onMounted(() => {
  if (!gridEl.value || reducedMotion.value) return

  ctx = gsap.context(() => {
    // Timeline connector animation — line draws across, then dots pop in
    if (timelineEl.value) {
      const line = timelineEl.value.querySelector('.process-timeline__line')
      const dots = timelineEl.value.querySelectorAll('.process-timeline__dot')
      if (line) gsap.set(line, { scaleX: 0 })
      if (dots.length) gsap.set(dots, { scale: 0, opacity: 0 })

      ScrollTrigger.create({
        trigger: timelineEl.value,
        start: 'top 85%',
        once: true,
        onEnter: () => {
          if (line) {
            gsap.to(line, {
              scaleX: 1,
              duration: 0.8,
              ease: 'power2.out',
            })
          }
          if (dots.length) {
            gsap.to(dots, {
              scale: 1,
              opacity: 1,
              duration: 0.4,
              stagger: 0.1,
              delay: 0.4,
              ease: 'back.out(2)',
            })
          }
        },
      })
    }

    // Card entrance stagger
    const cards = gridEl.value!.children
    const accents = gridEl.value!.querySelectorAll('.process-card__accent')
    gsap.set(cards, { opacity: 0, y: 40 })
    if (accents.length) gsap.set(accents, { scaleX: 0 })

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

        // Draw accent bars after cards land
        if (accents.length) {
          gsap.to(accents, {
            scaleX: 1,
            duration: 0.5,
            stagger: 0.1,
            delay: 0.5,
            ease: 'power2.out',
          })
        }
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
