<template>
  <div
    v-if="!hidden"
    ref="loaderEl"
    class="fixed inset-0 z-[100] flex flex-col items-center justify-center cursor-pointer overflow-hidden"
    @click="skip"
  >
    <!-- Blurred artwork background that sharpens as loading progresses -->
    <div class="absolute inset-0">
      <img
        ref="bgImgEl"
        src="/images/artworks/the-watcher.webp"
        alt=""
        class="absolute inset-0 w-full h-full object-cover will-change-transform"
        style="filter: blur(40px) saturate(0.6); transform: scale(1.15); opacity: 0.5"
        loading="eager"
        draggable="false"
      />
    </div>

    <!-- Dark overlay for text contrast -->
    <div ref="overlayEl" class="absolute inset-0 bg-dark-900/70" />

    <!-- Brand mark with letter-spacing animation -->
    <span ref="brandEl" class="relative z-10 font-display text-5xl md:text-6xl font-bold text-lavender-100 mb-10 tracking-[0.2em] opacity-0">
      BL
    </span>

    <!-- Minimal loading bar -->
    <div class="relative z-10 w-32 h-px bg-white/10 overflow-hidden">
      <div
        ref="barEl"
        class="h-full bg-accent-red origin-left"
        style="transform: scaleX(0)"
      />
    </div>

    <!-- Skip hint -->
    <span
      ref="skipHintEl"
      class="absolute bottom-8 z-10 font-body text-[10px] text-lavender-400/50 uppercase tracking-[0.3em] opacity-0"
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
const bgImgEl = ref<HTMLElement | null>(null)
const overlayEl = ref<HTMLElement | null>(null)

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

  // Image sharpens fully and scales down to rest as loader wipes away
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
    duration: 2,
    ease: 'power2.inOut',
    onUpdate: () => {
      const progress = proxy.value / 100

      // Progress bar
      if (barEl.value) {
        barEl.value.style.transform = `scaleX(${progress})`
      }

      // Progressively sharpen and saturate the background image
      if (bgImgEl.value) {
        const blur = 40 - (progress * 30) // 40px -> 10px during load
        const sat = 0.6 + (progress * 0.25) // 0.6 -> 0.85
        const scale = 1.15 - (progress * 0.08) // 1.15 -> 1.07
        bgImgEl.value.style.filter = `blur(${blur}px) saturate(${sat})`
        bgImgEl.value.style.transform = `scale(${scale})`
      }

      // Overlay lightens subtly
      if (overlayEl.value) {
        const overlayOpacity = 0.7 - (progress * 0.15) // 0.7 -> 0.55
        overlayEl.value.style.backgroundColor = `rgba(24, 21, 32, ${overlayOpacity})`
      }
    },
    onComplete: () => {
      sessionStorage.setItem('bl-visited', '1')
      exitSequence()
    },
  })
})
</script>
