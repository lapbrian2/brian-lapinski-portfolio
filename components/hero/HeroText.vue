<script setup lang="ts">
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useReducedMotion } from '~/composables/useMediaQuery'

const reducedMotion = useReducedMotion()

const props = defineProps<{
  ready?: boolean
}>()

const emit = defineEmits<{
  'entrance-complete': []
}>()

const containerEl = ref<HTMLElement | null>(null)
const roleEl = ref<HTMLElement | null>(null)
const nameEl = ref<HTMLElement | null>(null)
const accentLineEl = ref<HTMLElement | null>(null)
const taglineEl = ref<HTMLElement | null>(null)

let ctx: gsap.Context | null = null
let hasPlayed = false
let fallbackTimeout: ReturnType<typeof setTimeout> | null = null

async function playEntrance() {
  if (hasPlayed || !nameEl.value || !taglineEl.value || !roleEl.value) return
  hasPlayed = true

  if (reducedMotion.value) {
    gsap.set(roleEl.value, { opacity: 1, y: 0 })
    gsap.set(nameEl.value, { visibility: 'visible', opacity: 1 })
    if (accentLineEl.value) {
      gsap.set(accentLineEl.value, { opacity: 1 })
      const lineL = accentLineEl.value.querySelector('.accent-line-l')
      const lineR = accentLineEl.value.querySelector('.accent-line-r')
      const dot = accentLineEl.value.querySelector('.accent-dot')
      if (dot) gsap.set(dot, { scale: 1 })
      if (lineL) gsap.set(lineL, { scaleX: 1 })
      if (lineR) gsap.set(lineR, { scaleX: 1 })
    }
    gsap.set(taglineEl.value, { visibility: 'visible', opacity: 1 })

    // Still set up scroll parallax so content leaves viewport naturally
    ctx = gsap.context(() => {
      gsap.to(containerEl.value, {
        y: -60,
        opacity: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: '.hero-section',
          start: 'top top',
          end: '40% top',
          scrub: true,
        },
      })
    }, containerEl.value!)
    emit('entrance-complete')
    return
  }

  const { default: Splitting } = await import('splitting')

  ctx = gsap.context(() => {
    // Split name into characters
    const nameResult = Splitting({ target: nameEl.value!, by: 'chars' })
    const chars = nameResult[0]?.chars || []

    // Split tagline into words
    const tagResult = Splitting({ target: taglineEl.value!, by: 'words' })
    const words = tagResult[0]?.words || []

    const tl = gsap.timeline({ onComplete: () => emit('entrance-complete') })

    // Phase 1: Role label fades in
    tl.fromTo(
      roleEl.value,
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' },
      0.2,
    )

    // Phase 2: Name characters flip in with 3D rotation
    if (chars.length) {
      gsap.set(chars, { opacity: 0, y: 80, rotateX: -90 })
      tl.to(
        chars,
        {
          opacity: 1,
          y: 0,
          rotateX: 0,
          duration: 0.9,
          stagger: { each: 0.04, from: 'start' },
          ease: 'power4.out',
          force3D: true,
        },
        0.4,
      )
    }

    // Phase 3: Accent line draws in from center
    if (accentLineEl.value) {
      const lineL = accentLineEl.value.querySelector('.accent-line-l')
      const lineR = accentLineEl.value.querySelector('.accent-line-r')
      const dot = accentLineEl.value.querySelector('.accent-dot')

      tl.to(accentLineEl.value, { opacity: 1, duration: 0.01 }, '-=0.3')
      if (dot) tl.to(dot, { scale: 1, duration: 0.4, ease: 'back.out(3)' }, '-=0.3')
      if (lineL) tl.to(lineL, { scaleX: 1, duration: 0.5, ease: 'power2.out' }, '-=0.2')
      if (lineR) tl.to(lineR, { scaleX: 1, duration: 0.5, ease: 'power2.out' }, '<')
    }

    // Phase 4: Tagline words blur in
    if (words.length) {
      gsap.set(words, { opacity: 0, y: 20, filter: 'blur(4px)' })
      tl.to(
        words,
        {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          duration: 0.6,
          stagger: { each: 0.06, from: 'start' },
          ease: 'power2.out',
        },
        '-=0.3',
      )
    }

    // Scroll parallax: hero text fades + lifts as user scrolls away
    gsap.to(containerEl.value, {
      y: -60,
      opacity: 0,
      ease: 'none',
      scrollTrigger: {
        trigger: '.hero-section',
        start: 'top top',
        end: '40% top',
        scrub: true,
      },
    })
  }, containerEl.value!)
}

// Play when ready signal arrives (from loader)
watch(
  () => props.ready,
  (val) => {
    if (val) nextTick(playEntrance)
  },
)

onMounted(() => {
  // Fallback: if ready is already true or not provided, play after short delay
  if (props.ready !== false) {
    fallbackTimeout = setTimeout(playEntrance, 300)
  }
})

onUnmounted(() => {
  if (fallbackTimeout) clearTimeout(fallbackTimeout)
  ctx?.revert()
})
</script>

<template>
  <div ref="containerEl" class="flex flex-col items-center justify-center text-center px-4">
    <!-- Role label with accent dot -->
    <p
      ref="roleEl"
      class="flex items-center gap-2 font-body text-xs uppercase tracking-[0.25em] text-lavender-300 mb-6 opacity-0"
    >
      <span class="w-1.5 h-1.5 rounded-full bg-accent-red inline-block" />
      AI Artist & Educator
    </p>

    <!-- Name with character splitting -->
    <h1
      ref="nameEl"
      class="font-display font-bold text-hero text-lavender-100 uppercase tracking-tight leading-none"
      style="perspective: 400px"
    >
      Brian Lapinski
    </h1>

    <!-- Animated accent line -->
    <div ref="accentLineEl" class="mt-6 mb-5 flex items-center gap-3 opacity-0">
      <div class="h-px w-8 bg-accent-red/60 origin-left scale-x-0 accent-line-l" />
      <span class="w-1.5 h-1.5 rounded-full bg-accent-red/40 scale-0 accent-dot" />
      <div class="h-px w-8 bg-accent-red/60 origin-right scale-x-0 accent-line-r" />
    </div>

    <!-- Tagline with word splitting -->
    <p
      ref="taglineEl"
      class="font-body text-lg md:text-xl text-lavender-200 font-normal tracking-wide max-w-lg"
      style="text-shadow: 0 1px 8px rgba(0,0,0,0.3)"
    >
      Exploring what it means to be human through images
    </p>
  </div>
</template>

<style scoped>
:deep(.char) {
  display: inline-block;
}

:deep(.word) {
  display: inline-block;
}

:deep(.word + .whitespace) {
  width: 0.3em;
  display: inline-block;
}
</style>
