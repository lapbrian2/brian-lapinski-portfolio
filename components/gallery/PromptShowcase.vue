<template>
  <section ref="sectionEl" class="relative py-24 px-6 md:px-12 overflow-hidden bg-dark-900">
    <!-- Background glow -->
    <div class="absolute inset-0 pointer-events-none">
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-accent-red/[0.04] rounded-full blur-[120px]" />
    </div>

    <div class="relative max-w-5xl mx-auto">
      <!-- Label -->
      <div class="text-center mb-12">
        <p class="font-body text-xs uppercase tracking-[0.3em] text-accent-red mb-4">
          Behind the Art
        </p>
        <div class="w-12 h-px bg-accent-red/40 mx-auto mb-8" />
        <h2 ref="headlineEl" class="font-display text-3xl md:text-5xl font-bold text-lavender-100 leading-tight mb-5">
          Unlock the Creative Process
        </h2>
        <p class="font-body text-base md:text-lg text-lavender-300 max-w-xl mx-auto leading-relaxed">
          Every artwork begins as a prompt&mdash;a blueprint of mood, technique, and vision. Get the exact text behind the image and make it your own.
        </p>
      </div>

      <!-- Teaser card -->
      <div class="teaser-card">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-0">
          <!-- Left: Artwork image -->
          <div class="relative aspect-square md:aspect-auto overflow-hidden">
            <img
              :src="featuredArtwork.src"
              :alt="featuredArtwork.title"
              class="w-full h-full object-cover"
              loading="lazy"
            >
            <!-- Overlay gradient -->
            <div class="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-dark-900/80 via-dark-900/20 to-transparent" />
            <!-- Title overlay -->
            <div class="absolute bottom-4 left-4 md:bottom-6 md:left-6">
              <p class="font-body text-[10px] uppercase tracking-[0.2em] text-lavender-300/80 mb-1">Featured Prompt</p>
              <h3 class="font-display text-xl md:text-2xl font-bold text-lavender-100">{{ featuredArtwork.title }}</h3>
              <p class="font-body text-xs text-lavender-400 mt-1">{{ featuredArtwork.medium }} &middot; {{ featuredArtwork.year }}</p>
            </div>
          </div>

          <!-- Right: Blurred prompt teaser -->
          <div class="relative p-6 md:p-8 flex flex-col justify-between min-h-[320px]">
            <!-- Prompt preview (blurred) -->
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-4">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" class="text-accent-red">
                  <rect x="2" y="3" width="12" height="10" rx="1.5" />
                  <line x1="5" y1="7" x2="11" y2="7" />
                  <line x1="5" y1="9.5" x2="9" y2="9.5" />
                </svg>
                <span class="font-body text-xs uppercase tracking-[0.15em] text-lavender-300">Raw Prompt</span>
              </div>

              <!-- Visible teaser text -->
              <div class="relative">
                <code class="block text-xs leading-relaxed font-mono text-lavender-200/70 break-words whitespace-pre-wrap">{{ promptTeaser }}</code>
                <!-- Blur overlay that fades out the rest -->
                <div class="prompt-blur-mask absolute bottom-0 left-0 right-0 h-24" />
              </div>

              <!-- Lock indicator -->
              <div class="flex items-center gap-2 mt-4">
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" class="text-lavender-500">
                  <rect x="3" y="7" width="10" height="7" rx="1.5" />
                  <path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2" />
                </svg>
                <span class="font-body text-[11px] text-lavender-500">{{ remainingChars }}+ more characters hidden</span>
              </div>
            </div>

            <!-- Price & CTA -->
            <div class="mt-6 pt-5 border-t border-white/[0.06]">
              <div class="flex items-center justify-between gap-4">
                <div>
                  <p class="font-display text-2xl font-bold text-lavender-100">$9.99</p>
                  <p class="font-body text-[11px] text-lavender-500 mt-0.5">One-time unlock &middot; Yours forever</p>
                </div>
                <NuxtLink
                  to="/gallery"
                  class="inline-flex items-center gap-2 px-6 py-3 bg-accent-red hover:bg-accent-red-hover text-white text-sm font-semibold rounded-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-accent-red/20 group whitespace-nowrap"
                >
                  Browse Prompts
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="transition-transform duration-200 group-hover:translate-x-0.5">
                    <line x1="3" y1="8" x2="13" y2="8" />
                    <polyline points="9 4 13 8 9 12" />
                  </svg>
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom feature highlights -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 text-center">
        <div class="feature-pill">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" class="text-accent-red">
            <rect x="2" y="3" width="12" height="10" rx="1.5" />
            <line x1="5" y1="7" x2="11" y2="7" />
            <line x1="5" y1="9.5" x2="9" y2="9.5" />
          </svg>
          <span>Full Prompt Text</span>
        </div>
        <div class="feature-pill">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" class="text-accent-red">
            <circle cx="8" cy="8" r="6" />
            <path d="M8 5v3l2 1.5" />
          </svg>
          <span>Reusable Style</span>
        </div>
        <div class="feature-pill">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" class="text-accent-red">
            <path d="M2 12l4-4 3 3 5-6" />
          </svg>
          <span>Paste &amp; Create</span>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useReducedMotion } from '~/composables/useMediaQuery'
import { artworks } from '~/data/artworks'

const sectionEl = ref<HTMLElement | null>(null)
const headlineEl = ref<HTMLElement | null>(null)
const reducedMotion = useReducedMotion()
let ctx: gsap.Context | null = null

// Get the first artwork that has a prompt
const featuredArtwork = computed(() => {
  return artworks.find(a => a.hasPrompt && a.rawPrompt) || artworks[0]
})

// Show first ~120 chars of prompt as teaser
const TEASER_LENGTH = 120
const promptTeaser = computed(() => {
  const raw = featuredArtwork.value.rawPrompt || ''
  if (raw.length <= TEASER_LENGTH) return raw
  return raw.slice(0, TEASER_LENGTH) + '...'
})

const remainingChars = computed(() => {
  const raw = featuredArtwork.value.rawPrompt || ''
  return Math.max(0, raw.length - TEASER_LENGTH)
})

onMounted(() => {
  if (!sectionEl.value || reducedMotion.value) return

  ctx = gsap.context(() => {
    const animTargets = sectionEl.value!.querySelectorAll('.teaser-card, h2, p, .feature-pill')
    gsap.set(animTargets, { opacity: 0, y: 30 })
    ScrollTrigger.create({
      trigger: sectionEl.value!,
      start: 'top 80%',
      once: true,
      onEnter: () => {
        gsap.to(animTargets, {
          opacity: 1,
          y: 0,
          duration: 0.7,
          stagger: 0.08,
          ease: 'power3.out',
        })
      },
    })
  }, sectionEl.value)
})

onUnmounted(() => {
  ctx?.revert()
})
</script>

<style scoped>
.teaser-card {
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.06);
  overflow: hidden;
  transition: border-color 0.4s ease;
}

.teaser-card:hover {
  border-color: rgba(237, 84, 77, 0.15);
}

.prompt-blur-mask {
  background: linear-gradient(
    to bottom,
    transparent 0%,
    rgba(15, 14, 23, 0.6) 40%,
    rgba(15, 14, 23, 0.95) 100%
  );
  backdrop-filter: blur(4px);
}

.feature-pill {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 16px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.06);
  font-size: 12px;
  color: #a5b0c8;
  transition: border-color 0.3s ease;
}

.feature-pill:hover {
  border-color: rgba(237, 84, 77, 0.2);
}
</style>
