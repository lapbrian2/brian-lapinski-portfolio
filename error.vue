<script setup lang="ts">
import type { NuxtError } from '#app'
import gsap from 'gsap'
import { useReducedMotion } from '~/composables/useMediaQuery'
import { validCategorySlugs } from '~/data/artworks'

const props = defineProps<{
  error: NuxtError
}>()

const is404 = computed(() => props.error.statusCode === 404)
const reducedMotion = useReducedMotion()

useHead({
  title: computed(() => is404.value ? 'Page Not Found — Brian Lapinski' : 'Error — Brian Lapinski'),
  meta: [
    { name: 'robots', content: 'noindex, nofollow' },
  ],
})

const containerEl = ref<HTMLElement | null>(null)
const titleEl = ref<HTMLElement | null>(null)
const glitchEl = ref<HTMLElement | null>(null)

function goHome() {
  clearError({ redirect: '/' })
}

function goGallery() {
  clearError({ redirect: '/gallery' })
}

// Scramble/decode glyphs — a mix of unicode and ASCII for visual texture
const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&*+=?/<>[]{}|~'

function scrambleDecode(chars: HTMLElement[]) {
  const originals = chars.map(el => el.textContent || '')

  // Set all chars to random glyphs initially with accent color
  chars.forEach(el => {
    el.textContent = GLYPHS[Math.floor(Math.random() * GLYPHS.length)]
    el.style.color = 'rgba(237, 84, 77, 0.6)'
    el.style.opacity = '1'
  })

  // Decode each char sequentially with cycling effect
  chars.forEach((el, i) => {
    const original = originals[i]
    if (original === ' ') {
      el.textContent = ' '
      el.style.color = ''
      return
    }

    const startDelay = 200 + i * 80 // Stagger start per character
    let cycles = 0
    const maxCycles = 4 + Math.floor(Math.random() * 4) // 4-7 cycles

    setTimeout(() => {
      const interval = setInterval(() => {
        cycles++
        if (cycles >= maxCycles) {
          // Final: show real character
          clearInterval(interval)
          el.textContent = original
          el.style.color = ''
          // Flash accent on decode
          gsap.fromTo(el,
            { color: '#ed544d' },
            { color: '', duration: 0.4, ease: 'power2.out' },
          )
        } else {
          // Cycle through random glyphs
          el.textContent = GLYPHS[Math.floor(Math.random() * GLYPHS.length)]
          // Gradually warm up the color
          const progress = cycles / maxCycles
          el.style.color = `rgba(237, 84, 77, ${0.6 - progress * 0.3})`
        }
      }, 50)
    }, startDelay)
  })
}

onMounted(async () => {
  if (!containerEl.value) return

  if (reducedMotion.value) return

  const { default: Splitting } = await import('splitting')

  // Scramble/decode the title
  if (titleEl.value) {
    const result = Splitting({ target: titleEl.value, by: 'chars' })
    const chars = result[0]?.chars || []
    if (chars.length) {
      gsap.set(chars, { opacity: 0 })
      // Start scramble after a short delay
      setTimeout(() => scrambleDecode(chars), 300)
    }
  }

  // Glitch animation on the error code shadow
  if (glitchEl.value) {
    const glitchTl = gsap.timeline({ repeat: -1, repeatDelay: 3 })
    glitchTl.to(glitchEl.value, {
      x: -6, y: 2, duration: 0.05, ease: 'steps(1)',
    })
    glitchTl.to(glitchEl.value, {
      x: 4, y: -4, duration: 0.05, ease: 'steps(1)',
    })
    glitchTl.to(glitchEl.value, {
      x: -2, y: 6, duration: 0.05, ease: 'steps(1)',
    })
    glitchTl.to(glitchEl.value, {
      x: 4, y: -4, duration: 0.05, ease: 'steps(1)',
    })
    glitchTl.to(glitchEl.value, {
      x: 0, y: 0, duration: 0.01,
    })
  }

  // Stagger in the supporting elements (everything except the glitch code and title)
  const others = Array.from(containerEl.value.children).filter(
    el => el !== containerEl.value?.querySelector('.relative') && el !== titleEl.value,
  )
  gsap.from(others, {
    y: 30,
    opacity: 0,
    duration: 0.7,
    stagger: 0.1,
    ease: 'power3.out',
    delay: 0.6,
  })

  // Error code entrance
  const codeEl = containerEl.value.querySelector('.relative')
  if (codeEl) {
    gsap.from(codeEl, {
      scale: 0.8,
      opacity: 0,
      duration: 0.5,
      ease: 'back.out(2)',
      delay: 0.1,
    })
  }
})
</script>

<template>
  <div class="min-h-screen bg-dark-900 vignette grain-overlay flex flex-col items-center justify-center px-6 text-center">
    <div ref="containerEl" class="max-w-lg">
      <!-- Glitch error code -->
      <div class="relative mb-6">
        <span class="font-display text-[8rem] md:text-[12rem] font-bold leading-none text-dark-700 select-none">
          {{ error.statusCode }}
        </span>
        <span ref="glitchEl" class="absolute inset-0 font-display text-[8rem] md:text-[12rem] font-bold leading-none text-accent-red/10 select-none" style="transform: translate(4px, -4px)">
          {{ error.statusCode }}
        </span>
      </div>

      <!-- Message — scramble/decode effect -->
      <h1 ref="titleEl" class="font-display text-3xl md:text-5xl lg:text-6xl font-bold text-lavender-100 leading-none" style="letter-spacing: -0.03em">
        {{ is404 ? 'Lost in the void' : 'Something broke' }}
      </h1>

      <p class="font-body text-base text-lavender-300 mt-4 max-w-md mx-auto">
        {{ is404
          ? 'This page doesn\'t exist — but there\'s plenty of art to discover.'
          : 'An unexpected error occurred. The canvas is temporarily blank.'
        }}
      </p>

      <!-- Actions -->
      <div class="flex flex-wrap items-center justify-center gap-4 mt-10">
        <button
          class="btn-press px-8 py-3 rounded-full bg-accent-red text-white font-body text-sm uppercase tracking-wider hover:bg-accent-red-hover transition-colors duration-200"
          @click="goHome"
        >
          Back to Home
        </button>
        <button
          v-if="is404"
          class="btn-press px-8 py-3 rounded-full border border-lavender-400/30 text-lavender-300 font-body text-sm uppercase tracking-wider hover:border-lavender-200 hover:text-white transition-all duration-200"
          @click="goGallery"
        >
          View Gallery
        </button>
      </div>

      <!-- Category links -->
      <div v-if="is404" class="mt-16">
        <p class="font-body text-xs uppercase tracking-[0.2em] text-lavender-400/40 mb-4">Explore Categories</p>
        <div class="flex flex-wrap justify-center gap-3">
          <button
            v-for="cat in validCategorySlugs"
            :key="cat"
            class="btn-press px-4 py-2 rounded-full border border-lavender-400/15 text-lavender-300 font-body text-xs uppercase tracking-wider hover:border-accent-red/30 hover:text-lavender-200 transition-all duration-300"
            @click="clearError({ redirect: `/${cat}` })"
          >
            {{ cat }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
:deep(.char) {
  display: inline-block;
}
</style>
