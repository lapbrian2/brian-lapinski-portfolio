<script setup lang="ts">
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useSectionTransition } from '~/composables/useSectionTransition'
import { useScrollReveal } from '~/composables/useScrollReveal'
import { useReducedMotion } from '~/composables/useMediaQuery'
const sectionEl = ref<HTMLElement | null>(null)
const pullquoteEl = ref<HTMLElement | null>(null)
const pullquoteBorderEl = ref<HTMLElement | null>(null)
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
    // Pullquote border: draw from top to bottom
    if (pullquoteBorderEl.value) {
      gsap.set(pullquoteBorderEl.value, { scaleY: 0 })
    }

    // Pullquote: staggered word reveal (one-shot, no scrub)
    const result = Splitting({ target: pullquoteEl.value!, by: 'words' })
    const words = result[0]?.words || []
    if (words.length) {
      gsap.set(words, { opacity: 0.12 })
      ScrollTrigger.create({
        trigger: pullquoteEl.value!,
        start: 'top 80%',
        once: true,
        onEnter: () => {
          // Animate the border drawing down alongside the word reveal
          if (pullquoteBorderEl.value) {
            gsap.to(pullquoteBorderEl.value, {
              scaleY: 1,
              duration: 1.2,
              ease: 'power2.out',
            })
          }

          gsap.to(words, {
            opacity: 1,
            stagger: { each: 0.04 },
            duration: 0.8,
            ease: 'power2.out',
          })
        },
      })
    }

    // Stats counter entrance + animated number count-up
    if (statsEl.value) {
      const statItems = statsEl.value.querySelectorAll('.stat-item')
      const statAccents = statsEl.value.querySelectorAll('.stat-accent')
      gsap.set(statItems, { opacity: 0, y: 30 })
      gsap.set(statAccents, { scaleX: 0 })
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
            onComplete() {
              this.targets().forEach((el: HTMLElement) => gsap.set(el, { clearProps: 'transform,willChange' }))
            },
          })

          // Draw the accent top border on each card
          gsap.to(statAccents, {
            scaleX: 1,
            duration: 0.6,
            stagger: 0.12,
            delay: 0.3,
            ease: 'power2.out',
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
            onComplete() {
              this.targets().forEach((el: HTMLElement) => gsap.set(el, { clearProps: 'transform,willChange' }))
            },
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
          gsap.to(bioCol.value, {
            opacity: 1, x: 0, duration: 0.8, ease: 'power2.out',
            onComplete() { gsap.set(this.targets()[0], { clearProps: 'transform,willChange' }) },
          })
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
          gsap.to(toolsCol.value, {
            opacity: 1, x: 0, duration: 0.8, delay: 0.2, ease: 'power2.out',
            onComplete() { gsap.set(this.targets()[0], { clearProps: 'transform,willChange' }) },
          })
        },
      })
    }

    // Artwork anchor — simple entrance reveal (no continuous scrub)
    if (artworkAnchorEl.value) {
      gsap.set(artworkAnchorEl.value, { opacity: 0, y: 20 })
      ScrollTrigger.create({
        trigger: artworkAnchorEl.value,
        start: 'top 85%',
        once: true,
        onEnter: () => {
          gsap.to(artworkAnchorEl.value!, {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power2.out',
            onComplete() { gsap.set(this.targets()[0], { clearProps: 'transform,willChange' }) },
          })
        },
      })
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
  'Creativa Magazine Vol.\u00a07',
  '2026 Choice DAO Mover & Shaker',
]
</script>

<template>
  <section id="about" ref="sectionEl" class="section relative">
    <!-- Pullquote — massive editorial typography -->
    <div class="mb-14">
      <blockquote class="relative pl-8 md:pl-12">
        <!-- Animated border line — draws top to bottom -->
        <div
          ref="pullquoteBorderEl"
          class="absolute left-0 top-0 bottom-0 w-[2px] bg-accent-red/60 origin-top"
        />
        <p
          ref="pullquoteEl"
          class="font-display font-bold text-lavender-100 leading-none about-pullquote"
        >
          I use images as a way to explore what it means to be human.
        </p>
      </blockquote>
    </div>

    <!-- Stats row -->
    <div ref="statsEl" class="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 mb-14">
      <div v-for="(stat, index) in stats" :key="stat.label" class="stat-item glass rounded-xl p-6 relative overflow-hidden">
        <!-- Accent top border — draws left to right -->
        <div class="stat-accent absolute top-0 left-0 right-0 h-[2px] bg-accent-red/50 origin-left" />
        <span class="font-display text-3xl md:text-4xl font-bold text-lavender-100 block leading-none mb-2 tabular-nums">
          {{ displayValues[index] }}
        </span>
        <span class="font-body text-xs uppercase tracking-[0.15em] text-lavender-300">
          {{ stat.label }}
        </span>
      </div>
    </div>

    <!-- Credentials row with separator dots -->
    <div ref="credentialsEl" class="flex flex-wrap items-center gap-y-2 mb-10">
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
              src="/images/artworks/the-elder.webp"
              alt="The Elder — wisdom emerging from golden fog"
              class="w-full h-auto object-cover will-change-transform transition-opacity duration-700"
              :class="aboutImgLoaded ? 'opacity-100' : 'opacity-0'"
              loading="lazy"
              placeholder
              sizes="sm:100vw md:50vw lg:33vw xxl:25vw"
              draggable="false"
              @load="aboutImgLoaded = true"
            />
            <!-- Subtle bottom gradient for caption -->
            <div class="absolute inset-0 bg-gradient-to-t from-dark-900/60 via-transparent to-transparent pointer-events-none" />
            <div class="absolute bottom-0 left-0 right-0 p-5">
              <p class="font-display text-sm text-lavender-100/80 leading-tight">The Elder</p>
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
