<template>
  <section id="process" ref="sectionEl" class="overflow-hidden md:pb-24">
    <div class="max-w-[1400px] mx-auto px-6 md:px-12 pt-24 md:pt-32">
      <div ref="headingEl">
        <p class="font-body text-xs uppercase tracking-[0.2em] text-lavender-300 mb-4">
          Process
        </p>
        <div class="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
          <h2 class="font-display text-section font-bold text-lavender-100 leading-none">
            From Feeling to Form
          </h2>
          <p class="font-body text-base text-lavender-300 max-w-sm md:text-right">
            How AI art comes to life &mdash; a reproducible creative methodology.
          </p>
        </div>
      </div>
    </div>

    <!-- Desktop: scroll-pinned horizontal -->
    <div v-if="!isMobile" ref="desktopEl" class="relative">
      <!-- Progress line -->
      <div class="absolute top-0 left-0 w-full h-px bg-dark-700">
        <div ref="progressEl" class="h-full bg-accent-red origin-left" style="transform: scaleX(0)" />
      </div>

      <div class="h-screen flex items-center">
        <div ref="stripEl" class="flex gap-6 pl-6 pr-6 md:pl-12 md:pr-12 md:gap-8">
          <div v-for="step in steps" :key="step.number" class="process-card-wrap flex-shrink-0" style="width: calc(25vw - 48px); min-width: 280px; max-width: 380px">
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
import { useIsMobile, useReducedMotion } from '~/composables/useMediaQuery'
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
const reducedMotion = useReducedMotion()
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
    // Respect reduced-motion preference — skip scroll-driven animations
    if (reducedMotion.value) return

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

    setupDesktopScroll()
  })
})

function setupDesktopScroll() {
  ctx?.revert()

  if (!desktopEl.value || !stripEl.value) return

  ctx = gsap.context(() => {
    // Calculate how far the strip overflows the viewport
    const getScrollAmount = () => {
      return -(stripEl.value!.scrollWidth - window.innerWidth)
    }

    // Use a standard GSAP tween with scrub — most reliable approach
    gsap.to(stripEl.value!, {
      x: getScrollAmount,
      ease: 'none',
      scrollTrigger: {
        trigger: desktopEl.value!,
        start: 'top top',
        end: () => `+=${Math.abs(getScrollAmount())}`,
        pin: true,
        scrub: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          if (progressEl.value) {
            progressEl.value.style.transform = `scaleX(${self.progress})`
          }
        },
      },
    })
  }, desktopEl.value)
}

let resizeTimer: ReturnType<typeof setTimeout> | null = null

function onResize() {
  if (isMobile.value) return
  if (resizeTimer) clearTimeout(resizeTimer)
  resizeTimer = setTimeout(() => {
    setupDesktopScroll()
  }, 200)
}

onMounted(() => {
  window.addEventListener('resize', onResize, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('resize', onResize)
  if (resizeTimer) clearTimeout(resizeTimer)
  ctx?.revert()
})
</script>
