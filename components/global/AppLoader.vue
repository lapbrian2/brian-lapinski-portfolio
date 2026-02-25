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
        src="/images/artworks/the-watcher.webp"
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

    <!-- Brand mark with letter-spacing animation -->
    <div class="relative z-10 flex flex-col items-center">
      <!-- Tagline above -->
      <span
        ref="taglineEl"
        class="font-body text-[9px] md:text-[10px] uppercase tracking-[0.4em] text-accent-red/80 mb-5 opacity-0"
      >
        AI Art Portfolio
      </span>

      <!-- BL monogram -->
      <span
        ref="brandEl"
        class="font-display text-6xl md:text-7xl font-bold text-lavender-100 tracking-[0.3em] opacity-0"
      >
        BL
      </span>

      <!-- Name reveal underneath -->
      <span
        ref="nameEl"
        class="font-display text-sm md:text-base font-medium text-lavender-300/70 tracking-[0.25em] mt-4 opacity-0 uppercase"
      >
        Brian Lapinski
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
const brandEl = ref<HTMLElement | null>(null)
const nameEl = ref<HTMLElement | null>(null)
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

  const tl = gsap.timeline({
    onComplete: () => {
      hidden.value = true
      emit('complete')
    },
  })

  // Bar + percentage fade
  tl.to([barEl.value?.parentElement, percentEl.value, loadingLabelEl.value], {
    opacity: 0,
    duration: 0.2,
    ease: 'power2.in',
  })

  // Lines retract
  tl.to([lineTopEl.value, lineBottomEl.value], {
    width: 0,
    duration: 0.3,
    ease: 'power2.in',
  }, '-=0.1')

  // Tagline fades
  tl.to(taglineEl.value, {
    opacity: 0,
    y: -8,
    duration: 0.25,
    ease: 'power2.in',
  }, '-=0.2')

  // Name fades
  tl.to(nameEl.value, {
    opacity: 0,
    y: 8,
    duration: 0.25,
    ease: 'power2.in',
  }, '-=0.25')

  // Brand scales up and dissolves
  tl.to(
    brandEl.value,
    {
      scale: 1.3,
      letterSpacing: '0.6em',
      opacity: 0,
      duration: 0.5,
      ease: 'power2.in',
    },
    '-=0.15',
  )

  // Image sharpens fully as loader wipes
  if (bgImgEl.value) {
    tl.to(
      bgImgEl.value,
      {
        filter: 'blur(0px) saturate(1)',
        scale: 1,
        opacity: 0.7,
        duration: 0.6,
        ease: 'power2.out',
      },
      '-=0.5',
    )
  }

  // Signal hero to start showing its first image before the wipe reveals it
  tl.call(() => emit('bridge-ready'))

  // Curtain wipe — split from center (300ms after bridge-ready)
  tl.to(
    loaderEl.value,
    {
      clipPath: 'inset(50% 0 50% 0)',
      duration: 0.6,
      ease: 'power3.inOut',
    },
    '+=0.3',
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
    emit('bridge-ready')
    emit('complete')
    return
  }

  loaderEl.value?.focus()

  // Prefetch Splitting.js while user watches loader — eliminates delay when hero text needs it
  import('splitting').catch(() => {})

  const entranceTl = gsap.timeline()

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

  // Phase 2: Brand entrance — cinematic letter-spacing resolve
  if (brandEl.value) {
    entranceTl.fromTo(brandEl.value, {
      opacity: 0,
      letterSpacing: '0.8em',
      scale: 0.95,
    }, {
      opacity: 1,
      letterSpacing: '0.3em',
      scale: 1,
      duration: 0.7,
      ease: 'power3.out',
    }, 0.3)
  }

  // Phase 2b: Tagline slides in from above
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

  // Phase 2c: Name slides in from below
  if (nameEl.value) {
    entranceTl.fromTo(nameEl.value, {
      opacity: 0,
      y: 10,
    }, {
      opacity: 1,
      y: 0,
      duration: 0.5,
      ease: 'power2.out',
    }, 0.6)
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

  // Progress simulation — slightly faster than before
  const proxy = { value: 0 }

  loadTween = gsap.to(proxy, {
    value: 100,
    duration: 1.8,
    ease: 'power1.inOut',
    delay: 0.5,
    onUpdate: () => {
      const progress = proxy.value / 100

      // Progress bar
      if (barEl.value) {
        barEl.value.style.transform = `scaleX(${progress})`
      }

      // Percentage text
      if (percentEl.value) {
        percentEl.value.textContent = `${Math.round(proxy.value)}%`
      }

      // Progressively sharpen and saturate the background image
      if (bgImgEl.value) {
        const blur = 40 - (progress * 32) // 40px -> 8px during load
        const sat = 0.4 + (progress * 0.4) // 0.4 -> 0.8
        const scale = 1.2 - (progress * 0.1) // 1.2 -> 1.1
        bgImgEl.value.style.filter = `blur(${blur}px) saturate(${sat})`
        bgImgEl.value.style.transform = `scale(${scale})`
      }

      // Overlay lightens subtly
      if (overlayEl.value) {
        const overlayOpacity = 0.75 - (progress * 0.2) // 0.75 -> 0.55
        overlayEl.value.style.backgroundColor = `rgba(0, 0, 0, ${overlayOpacity})`
      }
    },
    onComplete: () => {
      sessionStorage.setItem('bl-visited', '1')
      exitSequence()
    },
  })
})
</script>
