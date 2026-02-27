<script setup lang="ts">
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useIsMobile } from '~/composables/useMediaQuery'

const props = withDefaults(defineProps<{
  text?: string
  speed?: number
  direction?: 'left' | 'right'
}>(), {
  text: 'Selected Works',
  speed: 1,
  direction: 'left',
})

const containerEl = ref<HTMLElement | null>(null)
const stripEl = ref<HTMLElement | null>(null)
const fillEl = ref<HTMLElement | null>(null)
const isMobile = useIsMobile()
let ctx: gsap.Context | null = null

function onMouseMove(e: MouseEvent) {
  if (isMobile.value || !containerEl.value) return
  const rect = containerEl.value.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top
  containerEl.value.style.setProperty('--mx', `${x}px`)
  containerEl.value.style.setProperty('--my', `${y}px`)
}

function onMouseEnter() {
  if (isMobile.value || !fillEl.value) return
  gsap.to(fillEl.value, { opacity: 1, duration: 0.3, ease: 'power2.out', overwrite: true })
}

function onMouseLeave() {
  if (isMobile.value || !fillEl.value) return
  gsap.to(fillEl.value, { opacity: 0, duration: 0.4, ease: 'power2.in', overwrite: true })
}

onMounted(() => {
  if (!containerEl.value || !stripEl.value) return

  ctx = gsap.context(() => {
    const dir = props.direction === 'left' ? -1 : 1

    // Scroll-driven translate for both layers
    const targets = [stripEl.value!]
    if (fillEl.value) targets.push(fillEl.value)

    targets.forEach(el => {
      gsap.to(el, {
        xPercent: dir * -50,
        ease: 'none',
        scrollTrigger: {
          trigger: containerEl.value!,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 0.5 * props.speed,
        },
      })
    })
  }, containerEl.value)
})

onUnmounted(() => {
  ctx?.revert()
})

const repeated = computed(() => {
  const sep = ' \u2014 '
  return (props.text + sep).repeat(8)
})
</script>

<template>
  <div
    ref="containerEl"
    class="marquee-wrap overflow-hidden py-8 md:py-14 relative"
    @mousemove="onMouseMove"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
  >
    <!-- Base layer: outlined text -->
    <div
      ref="stripEl"
      class="marquee-text marquee-text--outline whitespace-nowrap font-display text-[4rem] md:text-[7rem] lg:text-[9rem] font-bold leading-none select-none uppercase tracking-tight"
    >
      {{ repeated }}
    </div>

    <!-- Fill layer: solid text with radial mask following cursor (desktop only) -->
    <div
      v-if="!isMobile"
      ref="fillEl"
      class="marquee-text marquee-text--fill whitespace-nowrap font-display text-[4rem] md:text-[7rem] lg:text-[9rem] font-bold leading-none select-none uppercase tracking-tight"
      aria-hidden="true"
      :style="{ opacity: 0 }"
    >
      {{ repeated }}
    </div>
  </div>
</template>

<style scoped>
.marquee-wrap {
  --mx: -200px;
  --my: 50%;
}

.marquee-text--outline {
  color: transparent;
  -webkit-text-stroke: 1.5px rgba(201, 210, 231, 0.25);
  text-stroke: 1.5px rgba(201, 210, 231, 0.25);
  text-shadow: 0 0 60px rgba(237, 84, 77, 0.06);
}

.marquee-text--fill {
  position: absolute;
  top: 0;
  left: 0;
  padding-top: inherit;
  padding-bottom: inherit;
  color: rgba(218, 226, 242, 0.6);
  -webkit-text-stroke: 0;
  text-stroke: 0;
  pointer-events: none;
  /* Radial gradient mask centered on cursor */
  -webkit-mask-image: radial-gradient(
    circle 200px at var(--mx) var(--my),
    black 0%,
    transparent 100%
  );
  mask-image: radial-gradient(
    circle 200px at var(--mx) var(--my),
    black 0%,
    transparent 100%
  );
}

@media (min-width: 768px) {
  .marquee-text--fill {
    -webkit-mask-image: radial-gradient(
      circle 300px at var(--mx) var(--my),
      black 0%,
      transparent 100%
    );
    mask-image: radial-gradient(
      circle 300px at var(--mx) var(--my),
      black 0%,
      transparent 100%
    );
  }
}
</style>
