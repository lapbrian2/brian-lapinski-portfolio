<template>
  <section ref="sectionEl" class="relative py-24 px-6 md:px-12 overflow-hidden">
    <!-- Background glow -->
    <div class="absolute inset-0 pointer-events-none">
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-accent-red/[0.04] rounded-full blur-[120px]" />
    </div>

    <div class="relative max-w-4xl mx-auto text-center">
      <!-- Label -->
      <p class="font-body text-xs uppercase tracking-[0.3em] text-accent-red mb-4">
        Behind the Art
      </p>
      <div class="w-12 h-px bg-accent-red/40 mx-auto mb-8" />

      <!-- Headline -->
      <h2 ref="headlineEl" class="font-display text-3xl md:text-5xl font-bold text-lavender-100 leading-tight mb-5">
        Unlock the Creative Process
      </h2>
      <p class="font-body text-base md:text-lg text-lavender-300 max-w-xl mx-auto mb-12 leading-relaxed">
        Every artwork starts with a prompt. Get the full blueprint&mdash;raw prompts, techniques, refinement notes&mdash;and remix them in the Playground.
      </p>

      <!-- Feature cards -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12 text-left">
        <div class="feature-card">
          <div class="feature-icon">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
              <rect x="2" y="3" width="16" height="14" rx="2" />
              <line x1="6" y1="8" x2="14" y2="8" />
              <line x1="6" y1="11" x2="11" y2="11" />
            </svg>
          </div>
          <h3 class="font-display text-sm font-semibold text-lavender-100 mb-1">Full Prompts</h3>
          <p class="font-body text-xs text-lavender-400 leading-relaxed">The exact text used to create each artwork, ready to paste into Midjourney.</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
              <path d="M4 2v4a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2V2" />
              <circle cx="4" cy="2" r="1" />
              <circle cx="10" cy="2" r="1" />
              <line x1="7" y1="8" x2="7" y2="12" />
              <circle cx="7" cy="12" r="1" />
              <path d="M13 10v4a2 2 0 0 0 2 2h2" />
              <circle cx="17" cy="16" r="1" />
            </svg>
          </div>
          <h3 class="font-display text-sm font-semibold text-lavender-100 mb-1">Technique Breakdown</h3>
          <p class="font-body text-xs text-lavender-400 leading-relaxed">Lighting, composition, style, mood&mdash;every creative decision mapped and explained.</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
              <rect x="1" y="3" width="18" height="14" rx="2" />
              <path d="M5 3V1.5A.5.5 0 0 1 5.5 1h9a.5.5 0 0 1 .5.5V3" />
              <line x1="5" y1="8" x2="15" y2="8" />
              <line x1="5" y1="11" x2="10" y2="11" />
              <circle cx="15" cy="13" r="2" />
            </svg>
          </div>
          <h3 class="font-display text-sm font-semibold text-lavender-100 mb-1">Playground Access</h3>
          <p class="font-body text-xs text-lavender-400 leading-relaxed">Remix, fork, and experiment with prompts in an interactive editing environment.</p>
        </div>
      </div>

      <!-- CTA -->
      <NuxtLink
        to="/gallery"
        class="inline-flex items-center gap-3 px-8 py-3.5 bg-accent-red hover:bg-accent-red-hover text-white text-sm font-semibold rounded-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-accent-red/20 group"
      >
        Browse Gallery
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="transition-transform duration-200 group-hover:translate-x-1">
          <line x1="3" y1="8" x2="13" y2="8" />
          <polyline points="9 4 13 8 9 12" />
        </svg>
      </NuxtLink>
    </div>
  </section>
</template>

<script setup lang="ts">
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useReducedMotion } from '~/composables/useMediaQuery'

const sectionEl = ref<HTMLElement | null>(null)
const headlineEl = ref<HTMLElement | null>(null)
const reducedMotion = useReducedMotion()
let ctx: gsap.Context | null = null

onMounted(() => {
  if (!sectionEl.value || reducedMotion.value) return

  ctx = gsap.context(() => {
    const children = sectionEl.value!.querySelectorAll('.feature-card, h2, p, a')
    gsap.set(children, { opacity: 0, y: 30 })
    ScrollTrigger.create({
      trigger: sectionEl.value!,
      start: 'top 80%',
      once: true,
      onEnter: () => {
        gsap.to(children, {
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
.feature-card {
  padding: 20px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.06);
  transition: border-color 0.3s ease, background 0.3s ease;
}

.feature-card:hover {
  border-color: rgba(237, 84, 77, 0.2);
  background: rgba(255, 255, 255, 0.04);
}

.feature-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: rgba(237, 84, 77, 0.08);
  border: 1px solid rgba(237, 84, 77, 0.15);
  color: #ed544d;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
}
</style>
