<template>
  <section id="process" ref="sectionEl" class="overflow-hidden">
    <div class="max-w-[1400px] mx-auto px-6 md:px-12 pt-24 md:pt-32">
      <h2 ref="headingEl" class="font-display text-section font-bold text-lavender-100 mb-4">
        Process
      </h2>
      <p class="font-body text-lg text-lavender-300 mb-12 max-w-2xl">
        From concept to final piece &mdash; how AI art comes to life.
      </p>
    </div>

    <!-- Desktop: scroll-pinned horizontal -->
    <div v-if="!isMobile" ref="desktopEl" class="relative">
      <!-- Progress line -->
      <div class="absolute top-0 left-0 w-full h-px bg-dark-700">
        <div ref="progressEl" class="h-full bg-accent-red origin-left" style="transform: scaleX(0)" />
      </div>

      <div class="h-screen flex items-center">
        <div ref="stripEl" class="flex gap-6 pl-12 pr-24">
          <div v-for="step in steps" :key="step.number" class="w-[380px] flex-shrink-0">
            <ProcessStep :step="step" />
          </div>
        </div>
      </div>
    </div>

    <!-- Mobile: vertical stack with stagger -->
    <div v-else ref="mobileEl" class="px-6 pb-24 space-y-6">
      <ProcessStep v-for="step in steps" :key="step.number" :step="step" />
    </div>
  </section>
</template>

<script setup lang="ts">
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useIsMobile } from '~/composables/useMediaQuery'
import { useSectionTransition } from '~/composables/useSectionTransition'
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

const isMobile = useIsMobile()
const sectionEl = ref<HTMLElement | null>(null)
const headingEl = ref<HTMLElement | null>(null)
const desktopEl = ref<HTMLElement | null>(null)
const stripEl = ref<HTMLElement | null>(null)
const progressEl = ref<HTMLElement | null>(null)
const mobileEl = ref<HTMLElement | null>(null)

useSectionTransition(sectionEl, { parallaxIntensity: 0.15 })
useScrollReveal(headingEl, { y: 30, stagger: 0.1, children: true })

let ctx: gsap.Context | null = null

onMounted(() => {
  nextTick(() => {
    if (isMobile.value) {
      // Mobile: stagger step cards
      if (mobileEl.value) {
        ctx = gsap.context(() => {
          const cards = mobileEl.value!.children
          gsap.set(cards, { opacity: 0, y: 40 })
          ScrollTrigger.create({
            trigger: mobileEl.value!,
            start: 'top 85%',
            once: true,
            onEnter: () => {
              gsap.to(cards, {
                opacity: 1,
                y: 0,
                duration: 0.7,
                stagger: 0.12,
                ease: 'power2.out',
              })
            },
          })
        }, mobileEl.value)
      }
      return
    }

    // Desktop: scroll-pinned horizontal scroll
    if (!desktopEl.value || !stripEl.value) return

    ctx = gsap.context(() => {
      const stripWidth = stripEl.value!.scrollWidth
      const viewWidth = window.innerWidth

      ScrollTrigger.create({
        trigger: desktopEl.value!,
        start: 'top top',
        end: `+=${stripWidth}`,
        pin: true,
        scrub: 1,
        onUpdate: (self) => {
          gsap.set(stripEl.value!, {
            x: -self.progress * (stripWidth - viewWidth + 48),
          })
          if (progressEl.value) {
            progressEl.value.style.transform = `scaleX(${self.progress})`
          }
        },
      })
    }, desktopEl.value)
  })
})

onUnmounted(() => {
  ctx?.revert()
})
</script>
