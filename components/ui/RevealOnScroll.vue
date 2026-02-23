<template>
  <div ref="el">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { useScrollReveal } from '~/composables/useScrollReveal'

const props = withDefaults(
  defineProps<{
    y?: number
    x?: number
    delay?: number
    duration?: number
    stagger?: number
    start?: string
    children?: boolean
  }>(),
  {
    y: 40,
    x: 0,
    delay: 0,
    duration: 0.8,
    stagger: 0,
    start: 'top 85%',
    children: false,
  },
)

const el = ref<HTMLElement | null>(null)

useScrollReveal(el, {
  y: props.y,
  x: props.x,
  delay: props.delay,
  duration: props.duration,
  stagger: props.stagger,
  start: props.start,
  children: props.children,
})
</script>
