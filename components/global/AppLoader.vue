<template>
  <div
    v-if="!hidden"
    ref="loaderEl"
    tabindex="0"
    class="fixed inset-0 z-[100] flex flex-col items-center justify-center cursor-pointer overflow-hidden"
    @click="skip"
    @keydown="skip"
  >
    <!-- Blurred artwork background that sharpens as loading progresses -->
    <div class="absolute inset-0">
      <img
        ref="bgImgEl"
        src="/images/artworks/red-shift.webp"
        alt=""
        class="absolute inset-0 w-full h-full object-cover will-change-transform"
        style="filter: blur(40px) saturate(0.4); transform: scale(1.2); opacity: 0"
        loading="eager"
        draggable="false"
      />
    </div>

    <!-- Dark overlay for text contrast -->
    <div ref="overlayEl" class="absolute inset-0 bg-dark-900" />

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
const bgImgEl = ref<HTMLElement | null>(null)
const overlayEl = ref<HTMLElement | null>(null)
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

  // Signal hero to prep its first image BEFORE the visual exit starts
  // — gives it a head start while the loader is still fully opaque
  emit('bridge-ready')

  const tl = gsap.timeline({
    onComplete: () => {
      hidden.value = true
      emit('complete')
    },
  })

  // Everything fades out together — simple, fast, unified
  const fadeTargets = [
    barEl.value?.parentElement,
    percentEl.value,
    loadingLabelEl.value,
    taglineEl.value,
    skipHintEl.value,
  ].filter(Boolean)

  tl.to(fadeTargets, {
    opacity: 0,
    duration: 0.3,
    ease: 'power2.in',
  })

  // Lines retract
  tl.to([lineTopEl.value, lineBottomEl.value], {
    width: 0,
    duration: 0.3,
    ease: 'power2.in',
  }, '-=0.2')

  // Background sharpens + overlay fades to transparent
  if (bgImgEl.value) {
    tl.to(bgImgEl.value, {
      filter: 'blur(0px) saturate(1)',
      scale: 1,
      opacity: 0.75,
      duration: 0.5,
      ease: 'power2.out',
    }, '-=0.3')
  }

  if (overlayEl.value) {
    tl.to(overlayEl.value, {
      opacity: 0,
      duration: 0.5,
      ease: 'power2.out',
    }, '<')
  }

  // Curtain wipe — split from center
  tl.to(loaderEl.value, {
    clipPath: 'inset(50% 0 50% 0)',
    duration: 0.6,
    ease: 'power3.inOut',
  }, '+=0.15')
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

  // Phase 1: Dark scene — overlay fades down, bg image fades in blurred
  if (bgImgEl.value) {
    entranceTl.to(bgImgEl.value, {
      opacity: 0.5,
      duration: 0.8,
      ease: 'power2.out',
    }, 0)
  }

  if (overlayEl.value) {
    entranceTl.to(overlayEl.value, {
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      duration: 0.8,
      ease: 'power2.out',
    }, 0)
  }

  // Phase 2: Tagline slides in
  if (taglineEl.value) {
    entranceTl.fromTo(taglineEl.value, {
      opacity: 0,
      y: -10,
    }, {
      opacity: 1,
      y: 0,
      duration: 0.5,
      ease: 'power2.out',
    }, 0.5)
  }

  // Phase 3: Decorative lines expand
  if (lineTopEl.value) {
    entranceTl.to(lineTopEl.value, {
      width: '200px',
      duration: 0.6,
      ease: 'power2.out',
    }, 0.5)
  }

  if (lineBottomEl.value) {
    entranceTl.to(lineBottomEl.value, {
      width: '160px',
      duration: 0.6,
      ease: 'power2.out',
    }, 0.6)
  }

  // Phase 4: Loading bar + labels appear
  if (percentEl.value) {
    entranceTl.to(percentEl.value, { opacity: 1, duration: 0.3 }, 0.7)
  }
  if (loadingLabelEl.value) {
    entranceTl.to(loadingLabelEl.value, { opacity: 1, duration: 0.3 }, 0.7)
  }

  // Show skip hint after a beat
  if (skipHintEl.value) {
    entranceTl.to(skipHintEl.value, { opacity: 1, duration: 0.4 }, 1.2)
  }

  // Progress simulation
  const proxy = { value: 0 }

  loadTween = gsap.to(proxy, {
    value: 100,
    duration: 1.8,
    ease: 'power1.inOut',
    delay: 0.5,
    onUpdate: () => {
      const progress = proxy.value / 100

      if (barEl.value) {
        barEl.value.style.transform = `scaleX(${progress})`
      }

      if (percentEl.value) {
        percentEl.value.textContent = `${Math.round(proxy.value)}%`
      }

      // Progressively sharpen and saturate the background image
      if (bgImgEl.value) {
        const blur = 40 - (progress * 32)
        const sat = 0.4 + (progress * 0.4)
        const scale = 1.2 - (progress * 0.1)
        bgImgEl.value.style.filter = `blur(${blur}px) saturate(${sat})`
        bgImgEl.value.style.transform = `scale(${scale})`
      }

      if (overlayEl.value) {
        const overlayOpacity = 0.75 - (progress * 0.2)
        overlayEl.value.style.backgroundColor = `rgba(0, 0, 0, ${overlayOpacity})`
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
