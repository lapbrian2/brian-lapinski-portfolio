<template>
  <div
    v-if="!hidden"
    ref="loaderEl"
    class="fixed inset-0 z-[100] bg-dark-900 flex flex-col items-center justify-center cursor-pointer"
    @click="skip"
  >
    <!-- Brand mark with letter-spacing animation -->
    <span ref="brandEl" class="font-display text-5xl md:text-6xl font-bold text-lavender-100 mb-10 tracking-[0.2em] opacity-0">
      BL
    </span>

    <!-- Minimal loading bar -->
    <div class="w-32 h-px bg-dark-700 overflow-hidden">
      <div
        ref="barEl"
        class="h-full bg-accent-red origin-left"
        style="transform: scaleX(0)"
      />
    </div>

    <!-- Skip hint -->
    <span
      ref="skipHintEl"
      class="absolute bottom-8 font-body text-[10px] text-lavender-500/60 uppercase tracking-[0.3em] opacity-0"
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
let loadTween: gsap.core.Tween | null = null
let exiting = false

const emit = defineEmits<{
  complete: []
}>()

function exitSequence() {
  if (exiting) return
  exiting = true
  loadTween?.kill()

  if (barEl.value) barEl.value.style.transform = 'scaleX(1)'

  const tl = gsap.timeline({
    onComplete: () => {
      hidden.value = true
      emit('complete')
    },
  })

  // Bar fades
  tl.to(barEl.value, {
    scaleY: 0,
    opacity: 0,
    duration: 0.2,
    ease: 'power2.in',
  })

  // Brand scales up and fades
  tl.to(
    brandEl.value,
    {
      scale: 1.2,
      letterSpacing: '0.5em',
      opacity: 0,
      duration: 0.5,
      ease: 'power2.in',
    },
    '-=0.1',
  )

  // Curtain wipe up
  tl.to(
    loaderEl.value,
    {
      clipPath: 'inset(0 0 100% 0)',
      duration: 0.7,
      ease: 'power3.inOut',
    },
    '-=0.3',
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

  // Entrance: brand fades in with tracking
  if (brandEl.value) {
    gsap.fromTo(brandEl.value, {
      opacity: 0,
      letterSpacing: '0.6em',
      y: 8,
    }, {
      opacity: 1,
      letterSpacing: '0.2em',
      y: 0,
      duration: 0.6,
      ease: 'power2.out',
    })
  }

  // Show skip hint after a beat
  if (skipHintEl.value) {
    gsap.to(skipHintEl.value, { opacity: 1, duration: 0.4, delay: 1 })
  }

  const proxy = { value: 0 }

  loadTween = gsap.to(proxy, {
    value: 100,
    duration: 1.8,
    ease: 'power2.inOut',
    onUpdate: () => {
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
