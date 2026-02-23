<template>
  <div
    v-if="!hidden"
    ref="loaderEl"
    class="fixed inset-0 z-[100] bg-dark-900 flex flex-col items-center justify-center cursor-pointer"
    @click="skip"
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

    <!-- Skip hint -->
    <span
      ref="skipHintEl"
      class="absolute bottom-8 font-body text-[11px] text-lavender-500 uppercase tracking-widest opacity-0"
    >
      Click to skip
    </span>
  </div>
</template>

<script setup lang="ts">
import gsap from 'gsap'

const loaderEl = ref<HTMLElement | null>(null)
const brandEl = ref<HTMLElement | null>(null)
const barEl = ref<HTMLElement | null>(null)
const skipHintEl = ref<HTMLElement | null>(null)

const hidden = ref(false)
const progress = ref(0)
let loadTween: gsap.core.Tween | null = null
let exiting = false

const emit = defineEmits<{
  complete: []
}>()

function exitSequence() {
  if (exiting) return
  exiting = true
  loadTween?.kill()

  // Snap progress to 100
  progress.value = 100
  if (barEl.value) barEl.value.style.transform = 'scaleX(1)'

  const tl = gsap.timeline({
    onComplete: () => {
      hidden.value = true
      emit('complete')
    },
  })

  tl.to(barEl.value, {
    scaleY: 0,
    opacity: 0,
    duration: 0.25,
    ease: 'power2.in',
  })

  tl.to(
    brandEl.value,
    {
      scale: 1.3,
      opacity: 0,
      duration: 0.4,
      ease: 'power2.in',
    },
    '-=0.15',
  )

  tl.to(
    loaderEl.value,
    {
      clipPath: 'inset(0 0 100% 0)',
      duration: 0.7,
      ease: 'power3.inOut',
    },
    '-=0.25',
  )
}

function skip() {
  exitSequence()
}

onMounted(() => {
  // Session-aware: skip loader for returning visitors
  const hasVisited = sessionStorage.getItem('bl-visited')
  if (hasVisited) {
    hidden.value = true
    emit('complete')
    return
  }

  // Show skip hint after a beat
  if (skipHintEl.value) {
    gsap.to(skipHintEl.value, { opacity: 1, duration: 0.4, delay: 0.8 })
  }

  const proxy = { value: 0 }

  loadTween = gsap.to(proxy, {
    value: 100,
    duration: 1.6,
    ease: 'power2.inOut',
    onUpdate: () => {
      progress.value = proxy.value
      if (barEl.value) {
        barEl.value.style.transform = `scaleX(${proxy.value / 100})`
      }
    },
    onComplete: () => {
      sessionStorage.setItem('bl-visited', '1')
      exitSequence()
    },
  })
})
</script>
