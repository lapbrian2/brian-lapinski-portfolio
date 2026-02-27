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
