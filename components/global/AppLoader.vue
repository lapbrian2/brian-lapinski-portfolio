<template>
  <div
    v-if="!hidden"
    ref="loaderEl"
    class="fixed inset-0 z-[100] bg-dark-900 flex flex-col items-center justify-center"
  >
    <span ref="brandEl" class="font-display text-6xl font-bold text-lavender-100 mb-8">
      BL
    </span>

    <!-- Loading bar -->
    <div class="w-48 h-[2px] bg-dark-700 rounded-full overflow-hidden">
      <div
        ref="barEl"
        class="h-full bg-accent-red rounded-full origin-left"
        style="transform: scaleX(0)"
      />
    </div>

    <span class="font-body text-xs text-lavender-400 mt-3 tabular-nums">
      {{ Math.round(progress) }}
    </span>
  </div>
</template>

<script setup lang="ts">
import gsap from 'gsap'

const loaderEl = ref<HTMLElement | null>(null)
const brandEl = ref<HTMLElement | null>(null)
const barEl = ref<HTMLElement | null>(null)

const hidden = ref(false)
const progress = ref(0)

const emit = defineEmits<{
  complete: []
}>()

onMounted(() => {
  const proxy = { value: 0 }

  gsap.to(proxy, {
    value: 100,
    duration: 1.8,
    ease: 'power2.inOut',
    onUpdate: () => {
      progress.value = proxy.value
      if (barEl.value) {
        barEl.value.style.transform = `scaleX(${proxy.value / 100})`
      }
    },
    onComplete: () => {
      // Curtain exit sequence
      const tl = gsap.timeline({
        onComplete: () => {
          hidden.value = true
          emit('complete')
        },
      })

      // 1. Bar shrinks to nothing
      tl.to(barEl.value, {
        scaleY: 0,
        opacity: 0,
        duration: 0.3,
        ease: 'power2.in',
      })

      // 2. Brand scales up and fades
      tl.to(
        brandEl.value,
        {
          scale: 1.3,
          opacity: 0,
          duration: 0.5,
          ease: 'power2.in',
        },
        '-=0.2',
      )

      // 3. Curtain rises via clip-path
      tl.to(
        loaderEl.value,
        {
          clipPath: 'inset(0 0 100% 0)',
          duration: 0.8,
          ease: 'power3.inOut',
        },
        '-=0.3',
      )
    },
  })
})
</script>
