<script setup lang="ts">
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

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
let ctx: gsap.Context | null = null
let velocityOffset = 0
let velocityTarget = 0
let tickerFn: (() => void) | null = null
let lenisScrollHandler: ((e: any) => void) | null = null
let lenisInstance: any = null

onMounted(() => {
  if (!containerEl.value || !stripEl.value) return

  ctx = gsap.context(() => {
    const dir = props.direction === 'left' ? -1 : 1

    gsap.to(stripEl.value!, {
      xPercent: dir * -50,
      ease: 'none',
      scrollTrigger: {
        trigger: containerEl.value!,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 0.5 * props.speed,
      },
    })
  }, containerEl.value)

  // Velocity-reactive: layer additional movement based on scroll speed
  try {
    const { $lenis } = useNuxtApp()
    if ($lenis) {
      lenisInstance = $lenis
      const dir = props.direction === 'left' ? -1 : 1
      lenisScrollHandler = (e: any) => {
        const velocity = e.velocity || 0
        velocityTarget = velocity * dir * 2.5
      }
      ;($lenis as any).on('scroll', lenisScrollHandler)
    }
  } catch {}

  // Smooth lerp the velocity offset and apply via GSAP ticker
  tickerFn = () => {
    velocityOffset += (velocityTarget - velocityOffset) * 0.08
    velocityTarget *= 0.92 // decay
    if (Math.abs(velocityOffset) < 0.01) velocityOffset = 0
    if (stripEl.value && Math.abs(velocityOffset) > 0.01) {
      gsap.set(stripEl.value, { x: `+=${velocityOffset * 0.5}`, overwrite: false })
    }
  }
  gsap.ticker.add(tickerFn)
})

onUnmounted(() => {
  if (tickerFn) gsap.ticker.remove(tickerFn)
  if (lenisScrollHandler && lenisInstance) {
    lenisInstance.off('scroll', lenisScrollHandler)
  }
  ctx?.revert()
})

const repeated = computed(() => {
  const sep = ' \u2014 '
  return (props.text + sep).repeat(8)
})
</script>

<template>
  <div ref="containerEl" class="overflow-hidden py-8 md:py-14">
    <div
      ref="stripEl"
      class="marquee-text whitespace-nowrap font-display text-[4rem] md:text-[7rem] lg:text-[9rem] font-bold leading-none select-none uppercase tracking-tight"
    >
      {{ repeated }}
    </div>
  </div>
</template>

<style scoped>
.marquee-text {
  color: transparent;
  -webkit-text-stroke: 1.5px rgba(201, 210, 231, 0.25);
  text-stroke: 1.5px rgba(201, 210, 231, 0.25);
  text-shadow: 0 0 60px rgba(237, 84, 77, 0.06);
}
</style>
