<script setup lang="ts">
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useIsMobile, useReducedMotion } from '~/composables/useMediaQuery'

const sectionEl = ref<HTMLElement | null>(null)
const stackEl = ref<HTMLElement | null>(null)
const lineEls = ref<HTMLElement[]>([])
const isMobile = useIsMobile()
const reducedMotion = useReducedMotion()

let ctx: gsap.Context | null = null

// Identity words + parallax speed multiplier for each line
const lines = [
  { text: 'AI', speed: 1.6, outlined: false },
  { text: 'Artist', speed: 0.8, outlined: true },
  { text: 'Educator', speed: 1.3, outlined: false },
  { text: 'Creative', speed: 0.6, outlined: true },
  { text: 'Visionary', speed: 1.1, outlined: false },
]

onMounted(async () => {
  if (!sectionEl.value || !stackEl.value || !lineEls.value.length) return

  // Reduced motion: show everything static, no parallax
  if (reducedMotion.value) return

  gsap.registerPlugin(ScrollTrigger)

  if (isMobile.value) {
    // Mobile: fade-in + scale stagger, no character splitting
    ctx = gsap.context(() => {
      gsap.set(lineEls.value, { opacity: 0, y: 40, scale: 0.9 })
      ScrollTrigger.create({
        trigger: sectionEl.value!,
        start: 'top 85%',
        once: true,
        onEnter: () => {
          gsap.to(lineEls.value, {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.8,
            stagger: 0.12,
            ease: 'power3.out',
            force3D: true,
          })
        },
      })
    }, sectionEl.value)
    return
  }

  // Desktop: character-level entrance + parallax scrub

  // Dynamically import Splitting.js (same pattern as HeroText.vue)
  const { default: Splitting } = await import('splitting')

  // Split each word into characters
  const textEls = lineEls.value.map(el => el.querySelector('.stacked-type__text'))
  const allCharsPerLine: HTMLElement[][] = []

  textEls.forEach((textEl) => {
    if (!textEl) {
      allCharsPerLine.push([])
      return
    }
    const result = Splitting({ target: textEl, by: 'chars' })
    allCharsPerLine.push(result[0]?.chars || [])
  })

  // Hide all characters initially
  allCharsPerLine.forEach((chars) => {
    if (chars.length) gsap.set(chars, { opacity: 0 })
  })

  ctx = gsap.context(() => {
    // Scroll-triggered entrance — fires once when section enters viewport
    ScrollTrigger.create({
      trigger: sectionEl.value!,
      start: 'top 75%',
      once: true,
      onEnter: () => {
        const tl = gsap.timeline()

        lines.forEach((line, i) => {
          const chars = allCharsPerLine[i]
          if (!chars.length) return

          const lineDelay = i * 0.15

          if (line.outlined) {
            // Outlined text: slide in horizontally with rotateY
            // Alternate direction for visual rhythm
            const fromLeft = i === 1 // "Artist" from left, "Creative" from right
            gsap.set(chars, {
              opacity: 0,
              x: fromLeft ? -30 : 30,
              rotateY: fromLeft ? 45 : -45,
            })
            tl.to(chars, {
              opacity: 1,
              x: 0,
              rotateY: 0,
              duration: 0.8,
              stagger: { each: 0.03, from: fromLeft ? 'start' : 'end' },
              ease: 'power4.out',
              force3D: true,
            }, lineDelay)
          } else {
            // Filled text: 3D flip from below, staggered from center
            gsap.set(chars, {
              opacity: 0,
              y: 60,
              rotateX: -90,
            })
            tl.to(chars, {
              opacity: 1,
              y: 0,
              rotateX: 0,
              duration: 0.9,
              stagger: { each: 0.03, from: 'center' },
              ease: 'power4.out',
              force3D: true,
            }, lineDelay)
          }
        })
      },
    })

    // Parallax scrub: each line scrolls at a different speed via yPercent
    lines.forEach((line, i) => {
      const el = lineEls.value[i]
      if (!el) return

      const yDistance = (line.speed - 1) * 100

      gsap.fromTo(
        el,
        { yPercent: -yDistance * 0.5 },
        {
          yPercent: yDistance * 0.5,
          ease: 'none',
          force3D: true,
          scrollTrigger: {
            trigger: sectionEl.value!,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 0.8,
          },
        },
      )
    })
  }, sectionEl.value)
})

onUnmounted(() => {
  ctx?.revert()
})
</script>

<template>
  <section ref="sectionEl" class="stacked-type relative overflow-hidden bg-dark-900">
    <div ref="stackEl" class="stacked-type__stack relative">
      <div
        v-for="(line, index) in lines"
        :key="line.text"
        :ref="(el) => { if (el) lineEls[index] = el as HTMLElement }"
        class="stacked-type__line"
        :aria-label="line.text"
        style="perspective: 600px"
      >
        <span
          class="stacked-type__text font-display font-bold uppercase leading-none select-none"
          :class="line.outlined ? 'stacked-type__text--outlined' : 'stacked-type__text--filled'"
        >
          {{ line.text }}
        </span>
      </div>
    </div>

    <!-- Gradient fades for cinematic edge blending -->
    <div class="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-dark-900 to-transparent pointer-events-none z-10" />
    <div class="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-dark-900 to-transparent pointer-events-none z-10" />
  </section>
</template>

<style scoped>
.stacked-type {
  min-height: 300vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stacked-type__stack {
  position: sticky;
  top: 0;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0;
  width: 100%;
  padding: 0 1rem;
}

.stacked-type__line {
  width: 100%;
  text-align: center;
  will-change: transform;
  line-height: 0.85;
}

.stacked-type__text {
  font-size: var(--text-stacked);
  letter-spacing: -0.04em;
  white-space: nowrap;
}

/* Filled text — solid lavender */
.stacked-type__text--filled {
  color: #dae2f2;
}

/* Outlined text — stroke only, transparent fill */
.stacked-type__text--outlined {
  color: transparent;
  -webkit-text-stroke: 2px rgba(218, 226, 242, 0.25);
}

/* Splitting.js character spans */
:deep(.char) {
  display: inline-block;
}

/* Mobile */
@media (max-width: 767px) {
  .stacked-type {
    min-height: auto;
    padding: 6rem 0;
  }

  .stacked-type__stack {
    position: relative;
    height: auto;
  }

  .stacked-type__text {
    font-size: var(--text-stacked-mobile);
  }
}
</style>
