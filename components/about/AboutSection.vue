<script setup lang="ts">
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useSectionTransition } from '~/composables/useSectionTransition'
import { useScrollReveal } from '~/composables/useScrollReveal'
import { useReducedMotion } from '~/composables/useMediaQuery'
const sectionEl = ref<HTMLElement | null>(null)
const pullquoteEl = ref<HTMLElement | null>(null)
const statsEl = ref<HTMLElement | null>(null)
const credentialsEl = ref<HTMLElement | null>(null)
const bioCol = ref<HTMLElement | null>(null)
const toolsCol = ref<HTMLElement | null>(null)
const artworkAnchorEl = ref<HTMLElement | null>(null)
const aboutImgLoaded = ref(false)

const stats = [
  { target: 4, suffix: '+', label: 'Exhibitions' },
  { target: 5, suffix: '', label: 'Creative Roles' },
  { target: 42, suffix: '+', label: 'Artworks' },
  { target: 2024, suffix: '', label: 'Since' },
]

// Animated counter values — initialise to targets so values are never 0.
// GSAP resets them to 0 and tweens back up when the ScrollTrigger fires.
const counters = reactive(stats.map((s) => ({ value: s.target })))
const displayValues = computed(() =>
  stats.map((stat, i) => {
    const v = Math.round(counters[i].value)
    return `${v}${stat.suffix}`
  }),
)

useSectionTransition(sectionEl, { opacityFrom: 0.2 })

const reducedMotion = useReducedMotion()
let ctx: gsap.Context | null = null

onMounted(async () => {
  if (!pullquoteEl.value) return

  // Respect reduced-motion preference — show all content without animation
  if (reducedMotion.value) return

  const { default: Splitting } = await import('splitting')

  ctx = gsap.context(() => {
    // Pullquote: scroll-scrubbed word opacity (Noomo-style progressive reveal)
    const result = Splitting({ target: pullquoteEl.value!, by: 'words' })
    const words = result[0]?.words || []
    if (words.length) {
      gsap.set(words, { opacity: 0.12 })
      gsap.to(words, {
        opacity: 1,
        stagger: { each: 0.06 },
        ease: 'none',
        scrollTrigger: {
          trigger: pullquoteEl.value!,
          start: 'top 80%',
          end: 'bottom 50%',
          scrub: true,
        },
      })
    }

    // Stats counter entrance + animated number count-up
    if (statsEl.value) {
      const statItems = statsEl.value.querySelectorAll('.stat-item')
      gsap.set(statItems, { opacity: 0, y: 30 })
      ScrollTrigger.create({
        trigger: statsEl.value,
        start: 'top 85%',
        once: true,
        onEnter: () => {
          // Reset counters to 0 so the count-up animation is visible
          stats.forEach((_, i) => { counters[i].value = 0 })

          // Fade-in + slide-up the stat cards
          gsap.to(statItems, {
            opacity: 1,
            y: 0,
            duration: 0.7,
            stagger: 0.1,
            ease: 'power3.out',
          })
          // Animated counter count-up for each stat
          stats.forEach((stat, i) => {
            gsap.to(counters[i], {
              value: stat.target,
              duration: stat.target > 100 ? 2.2 : 1.4,
              delay: 0.15 + i * 0.1,
              ease: 'power2.out',
            })
          })
        },
      })
    }

    // Credentials stagger
    if (credentialsEl.value) {
      const items = credentialsEl.value.children
      gsap.set(items, { opacity: 0, y: 15 })
      ScrollTrigger.create({
        trigger: credentialsEl.value,
        start: 'top 85%',
        once: true,
        onEnter: () => {
          gsap.to(items, {
            opacity: 1,
            y: 0,
            duration: 0.6,
            stagger: 0.08,
            ease: 'power2.out',
          })
        },
      })
    }

    // Asymmetric column entrance
    if (bioCol.value) {
      gsap.set(bioCol.value, { opacity: 0, x: -40 })
      ScrollTrigger.create({
        trigger: bioCol.value,
        start: 'top 85%',
        once: true,
        onEnter: () => {
          gsap.to(bioCol.value, { opacity: 1, x: 0, duration: 0.8, ease: 'power2.out' })
        },
      })
    }

    if (toolsCol.value) {
      gsap.set(toolsCol.value, { opacity: 0, x: 40 })
      ScrollTrigger.create({
        trigger: toolsCol.value,
        start: 'top 85%',
        once: true,
        onEnter: () => {
          gsap.to(toolsCol.value, { opacity: 1, x: 0, duration: 0.8, delay: 0.2, ease: 'power2.out' })
        },
      })
    }

    // Artwork anchor — subtle parallax + scale on scroll
    if (artworkAnchorEl.value) {
      const img = artworkAnchorEl.value.querySelector('img')
      if (img) {
        gsap.to(img, {
          y: -30,
          scale: 1.04,
          ease: 'none',
          scrollTrigger: {
            trigger: artworkAnchorEl.value,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        })
      }
    }
  }, sectionEl.value!)
})

onUnmounted(() => {
  ctx?.revert()
})

const credentials = [
  'Dream AI Gallery',
  'Fundaci\u00f3n Nestl\u00e9 Barcelona',
  'FNAC Asturias',
  'Art Innovation NYC',
]
</script>

<template>
  <section id="about" ref="sectionEl" class="section relative">
    <!-- Pullquote — massive editorial typography -->
    <div class="mb-20">
      <blockquote class="relative pl-8 md:pl-12 border-l-2 border-accent-red/60">
        <p
          ref="pullquoteEl"
          class="font-display font-bold text-lavender-100 leading-none about-pullquote"
        >
          I use images as a way to explore what it means to be human.
        </p>
      </blockquote>
    </div>

    <!-- Stats row -->
    <div ref="statsEl" class="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 mb-20">
      <div v-for="(stat, index) in stats" :key="stat.label" class="stat-item glass rounded-xl p-6">
        <span class="font-display text-3xl md:text-4xl font-bold text-lavender-100 block leading-none mb-2 tabular-nums">
          {{ displayValues[index] }}
        </span>
        <span class="font-body text-xs uppercase tracking-[0.15em] text-lavender-300">
          {{ stat.label }}
        </span>
      </div>
    </div>

    <!-- Credentials row with separator dots -->
    <div ref="credentialsEl" class="flex flex-wrap items-center gap-y-2 mb-16">
      <template v-for="(cred, i) in credentials" :key="cred">
        <span class="font-body text-sm text-lavender-400 tracking-wide">
          {{ cred }}
        </span>
        <span v-if="i < credentials.length - 1" class="w-1 h-1 rounded-full bg-accent-red/40 mx-4 flex-shrink-0" />
      </template>
    </div>

    <!-- Two-column: bio + sticky artwork anchor -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
      <!-- Left: bio + tools stacked -->
      <div ref="bioCol" class="lg:col-span-7 space-y-16">
        <AboutBio />
        <AboutTools />
      </div>

      <!-- Right: sticky artwork image -->
      <div ref="toolsCol" class="lg:col-span-5">
        <div class="lg:sticky lg:top-24">
          <div ref="artworkAnchorEl" class="relative overflow-hidden rounded-lg">
            <!-- Shimmer placeholder -->
            <div
              v-if="!aboutImgLoaded"
              class="absolute inset-0 bg-dark-700 overflow-hidden z-[1]"
            >
              <div class="about-shimmer absolute inset-0" />
            </div>
            <NuxtImg
              src="/images/artworks/peeling-away.webp"
              alt="Peeling Away — a self-portrait of unmasking"
              width="800"
              height="1000"
              sizes="(max-width: 768px) 100vw, 40vw"
              class="w-full h-auto object-cover will-change-transform transition-opacity duration-700"
              :class="aboutImgLoaded ? 'opacity-100' : 'opacity-0'"
              loading="lazy"
              draggable="false"
              @load="aboutImgLoaded = true"
            />
            <!-- Subtle bottom gradient for caption -->
            <div class="absolute inset-0 bg-gradient-to-t from-dark-900/60 via-transparent to-transparent pointer-events-none" />
            <div class="absolute bottom-0 left-0 right-0 p-5">
              <p class="font-display text-sm text-lavender-100/80 leading-tight">Peeling Away</p>
              <p class="font-body text-[10px] uppercase tracking-[0.15em] text-lavender-400/50 mt-1">Midjourney &middot; 2025</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.about-pullquote {
  font-size: clamp(2rem, 5vw, 4.5rem);
  letter-spacing: -0.03em;
}

:deep(.word) {
  display: inline-block;
  transition: opacity 0.1s;
}

.about-shimmer {
  background: linear-gradient(
    90deg,
    rgba(17, 17, 24, 0) 0%,
    rgba(17, 17, 24, 0.4) 50%,
    rgba(17, 17, 24, 0) 100%
  );
  background-size: 200% 100%;
  animation: about-shimmer 1.5s infinite;
}

@keyframes about-shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
</style>
