<script setup lang="ts">
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useSectionTransition } from '~/composables/useSectionTransition'
import { useScrollReveal } from '~/composables/useScrollReveal'
const sectionEl = ref<HTMLElement | null>(null)
const pullquoteEl = ref<HTMLElement | null>(null)
const statsEl = ref<HTMLElement | null>(null)
const credentialsEl = ref<HTMLElement | null>(null)
const bioCol = ref<HTMLElement | null>(null)
const toolsCol = ref<HTMLElement | null>(null)

const stats = [
  { value: '4+', label: 'Exhibitions' },
  { value: '6', label: 'Creative Roles' },
  { value: '100+', label: 'Artworks' },
  { value: '2024', label: 'Since' },
]

useSectionTransition(sectionEl, { opacityFrom: 0.2 })

let ctx: gsap.Context | null = null

onMounted(async () => {
  if (!pullquoteEl.value) return

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

    // Stats counter entrance
    if (statsEl.value) {
      const statItems = statsEl.value.querySelectorAll('.stat-item')
      gsap.set(statItems, { opacity: 0, y: 30 })
      ScrollTrigger.create({
        trigger: statsEl.value,
        start: 'top 85%',
        once: true,
        onEnter: () => {
          gsap.to(statItems, {
            opacity: 1,
            y: 0,
            duration: 0.7,
            stagger: 0.1,
            ease: 'power3.out',
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
  <section id="about" ref="sectionEl" class="section">
    <!-- Pullquote -->
    <div class="mb-20">
      <blockquote class="relative pl-8 md:pl-12 border-l-2 border-accent-red/60">
        <p
          ref="pullquoteEl"
          class="font-display text-section font-semibold text-lavender-100 leading-tight"
        >
          I use images as a way to explore what it means to be human.
        </p>
      </blockquote>
    </div>

    <!-- Stats row -->
    <div ref="statsEl" class="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 mb-20">
      <div v-for="stat in stats" :key="stat.label" class="stat-item">
        <span class="font-display text-3xl md:text-4xl font-bold text-lavender-100 block leading-none mb-2">
          {{ stat.value }}
        </span>
        <span class="font-body text-xs uppercase tracking-[0.15em] text-lavender-400/60">
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

    <!-- Two-column grid -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
      <div ref="bioCol">
        <AboutBio />
      </div>
      <div ref="toolsCol">
        <AboutTools />
      </div>
    </div>
  </section>
</template>

<style scoped>
:deep(.word) {
  display: inline-block;
  transition: opacity 0.1s;
}
</style>
