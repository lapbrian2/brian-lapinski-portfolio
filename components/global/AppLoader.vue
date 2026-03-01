<template>
  <div
    v-if="!hidden"
    ref="loaderEl"
    tabindex="0"
    class="fixed inset-0 z-[100] flex flex-col items-center justify-center cursor-pointer overflow-hidden bg-dark-900"
    @click="skip"
    @keydown="skip"
  >
    <!-- Decorative lines — cinematic framing -->
    <div ref="lineTopEl" class="absolute top-[20%] left-1/2 -translate-x-1/2 z-10 w-0 h-px bg-gradient-to-r from-transparent via-accent-red/40 to-transparent" />
    <div ref="lineBottomEl" class="absolute bottom-[20%] left-1/2 -translate-x-1/2 z-10 w-0 h-px bg-gradient-to-r from-transparent via-lavender-400/20 to-transparent" />

    <!-- Brand label -->
    <div class="relative z-10 flex flex-col items-center">
      <span
        ref="taglineEl"
        class="font-body text-[9px] md:text-[10px] uppercase tracking-[0.4em] text-accent-red/80 opacity-0"
      >
        AI Art Portfolio
      </span>
    </div>

    <!-- Minimal loading bar -->
    <div class="relative z-10 mt-12 w-40 md:w-48">
      <div class="w-full h-px bg-white/8 overflow-hidden">
        <div
          ref="barEl"
          class="h-full bg-accent-red origin-left"
          style="transform: scaleX(0)"
        />
      </div>
      <!-- Percentage counter -->
      <div class="flex justify-between mt-2">
        <span
          ref="percentEl"
          class="font-body text-[9px] text-lavender-400/40 tabular-nums tracking-wider opacity-0"
        >
          0%
        </span>
        <span
          ref="loadingLabelEl"
          class="font-body text-[9px] text-lavender-400/30 uppercase tracking-[0.2em] opacity-0"
        >
          Loading
        </span>
      </div>
    </div>

    <!-- Skip hint -->
    <span
      ref="skipHintEl"
      class="absolute bottom-8 z-10 font-body text-[10px] text-lavender-400/40 uppercase tracking-[0.3em] opacity-0"
    >
      Press any key to skip
    </span>
  </div>
</template>

<script setup lang="ts">
import gsap from 'gsap'

const loaderEl = ref<HTMLElement | null>(null)
const taglineEl = ref<HTMLElement | null>(null)
const barEl = ref<HTMLElement | null>(null)
const percentEl = ref<HTMLElement | null>(null)
const loadingLabelEl = ref<HTMLElement | null>(null)
const skipHintEl = ref<HTMLElement | null>(null)
const lineTopEl = ref<HTMLElement | null>(null)
const lineBottomEl = ref<HTMLElement | null>(null)

const hidden = ref(false)
let loadTween: gsap.core.Tween | null = null
let entranceTl: gsap.core.Timeline | null = null
let exiting = false

const emit = defineEmits<{
  complete: []
  'bridge-ready': []
}>()

function exitSequence() {
  if (exiting) return
  exiting = true
  loadTween?.kill()

  if (barEl.value) barEl.value.style.transform = 'scaleX(1)'
  if (percentEl.value) percentEl.value.textContent = '100%'

  // Signal hero to start showing its image — it renders behind us
  // at z-[1..20] while we're at z-[100]. As we dissolve, it bleeds through.
  emit('bridge-ready')

  // Smooth crossfade — loader fades out while hero fades in at the same pace.
  // No delay, no slow start. power2.out = fast initial reveal then gentle finish.
  gsap.to(loaderEl.value, {
    opacity: 0,
    duration: 1.2,
    ease: 'power2.out',
    onComplete: () => {
      hidden.value = true
      emit('complete')
    },
  })
}

function skip(e?: KeyboardEvent | MouseEvent) {
  if (e && 'key' in e && (e.key === 'Tab' || e.key === 'Shift' || e.key === 'Alt' || e.key === 'Control' || e.key === 'Meta')) return
  exitSequence()
}

onMounted(() => {
  // Session-aware: skip loader for returning visitors
  const hasVisited = sessionStorage.getItem('bl-visited')
  if (hasVisited) {
    hidden.value = true
    emit('bridge-ready')
    emit('complete')
    return
  }

  loaderEl.value?.focus()

  // Prefetch Splitting.js while user watches loader
  import('splitting').catch(() => {})

  entranceTl = gsap.timeline()

  // Phase 1: Tagline slides in
  if (taglineEl.value) {
    entranceTl.fromTo(taglineEl.value, {
      opacity: 0,
      y: -10,
    }, {
      opacity: 1,
      y: 0,
      duration: 0.5,
      ease: 'power2.out',
    }, 0.3)
  }

  // Phase 2: Decorative lines expand
  if (lineTopEl.value) {
    entranceTl.to(lineTopEl.value, {
      width: '200px',
      duration: 0.6,
      ease: 'power2.out',
    }, 0.3)
  }

  if (lineBottomEl.value) {
    entranceTl.to(lineBottomEl.value, {
      width: '160px',
      duration: 0.6,
      ease: 'power2.out',
    }, 0.4)
  }

  // Phase 3: Loading bar + labels appear
  if (percentEl.value) {
    entranceTl.to(percentEl.value, { opacity: 1, duration: 0.3 }, 0.5)
  }
  if (loadingLabelEl.value) {
    entranceTl.to(loadingLabelEl.value, { opacity: 1, duration: 0.3 }, 0.5)
  }

  // Show skip hint after a beat
  if (skipHintEl.value) {
    entranceTl.to(skipHintEl.value, { opacity: 1, duration: 0.4 }, 1.0)
  }

  // Progress simulation — bar fills over 1.8s
  const proxy = { value: 0 }

  loadTween = gsap.to(proxy, {
    value: 100,
    duration: 1.8,
    ease: 'power1.inOut',
    delay: 0.5,
    onUpdate: () => {
      if (barEl.value) {
        barEl.value.style.transform = `scaleX(${proxy.value / 100})`
      }

      if (percentEl.value) {
        percentEl.value.textContent = `${Math.round(proxy.value)}%`
      }
    },
    onComplete: () => {
      sessionStorage.setItem('bl-visited', '1')
      exitSequence()
    },
  })
})

onUnmounted(() => {
  entranceTl?.kill()
  loadTween?.kill()
})
</script>
