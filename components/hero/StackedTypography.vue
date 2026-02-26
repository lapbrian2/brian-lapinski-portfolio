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
// Higher speed = moves faster relative to scroll (more parallax depth)
const lines = [
  { text: 'AI', speed: 1.6, outlined: false },
  { text: 'Artist', speed: 0.8, outlined: true },
  { text: 'Educator', speed: 1.3, outlined: false },
  { text: 'Creative', speed: 0.6, outlined: true },
  { text: 'Visionary', speed: 1.1, outlined: false },
]

onMounted(() => {
  if (!sectionEl.value || !stackEl.value || !lineEls.value.length) return

  // Reduced motion: show everything static, no parallax
  if (reducedMotion.value) return

  ctx = gsap.context(() => {
    if (isMobile.value) {
      // Mobile: simple fade-in stagger, no parallax
      gsap.set(lineEls.value, { opacity: 0, y: 40 })
      ScrollTrigger.create({
        trigger: sectionEl.value!,
        start: 'top 85%',
        once: true,
        onEnter: () => {
          gsap.to(lineEls.value, {
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.12,
            ease: 'power3.out',
            force3D: true,
          })
        },
      })
      return
    }

    // Desktop: each line scrolls at a different speed via yPercent scrub
    lines.forEach((line, i) => {
      const el = lineEls.value[i]
      if (!el) return

      // Each line gets a different yPercent range based on its speed multiplier
      // This creates the parallax depth effect where lines separate as you scroll
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

    // Overall section opacity: fade in when entering
    gsap.fromTo(
      stackEl.value!,
      { opacity: 0.3 },
      {
        opacity: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionEl.value!,
          start: 'top 80%',
          end: 'top 20%',
          scrub: true,
        },
      },
    )
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
