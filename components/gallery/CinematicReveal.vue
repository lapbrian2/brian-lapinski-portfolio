<script setup lang="ts">
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useIsMobile, useReducedMotion } from '~/composables/useMediaQuery'
import { useArtworks } from '~/composables/useArtworks'

const { artworks } = useArtworks()
const isMobile = useIsMobile()
const reducedMotion = useReducedMotion()

const sectionEl = ref<HTMLElement | null>(null)
const frameEls = ref<HTMLElement[]>([])
const curtainEls = ref<HTMLElement[]>([])
const imgEls = ref<HTMLElement[]>([])
const textEls = ref<HTMLElement[]>([])

let ctx: gsap.Context | null = null

// Pick 3 showcase-worthy artworks, fall back to first 3
const showcaseIds = ['the-threshold', 'leviathan', 'the-colonnade']
const revealArtworks = computed(() => {
  const found = showcaseIds
    .map(id => artworks.value.find(a => a.id === id))
    .filter(Boolean)
  if (found.length >= 3) return found.slice(0, 3)
  return artworks.value.slice(0, 3)
})

onMounted(() => {
  if (!sectionEl.value) return

  // Reduced motion: show everything immediately
  if (reducedMotion.value) {
    curtainEls.value.forEach((el) => {
      if (el) gsap.set(el, { clipPath: 'inset(0% 0 0 0)' })
    })
    textEls.value.forEach((el) => {
      if (el) gsap.set(el, { opacity: 1, y: 0 })
    })
    return
  }

  ctx = gsap.context(() => {
    curtainEls.value.forEach((curtain, i) => {
      const img = imgEls.value[i]
      const text = textEls.value[i]
      const frame = frameEls.value[i]
      if (!curtain || !frame) return

      if (isMobile.value) {
        // Mobile: simple fade-in, no clip-path scrub
        gsap.set(curtain, { opacity: 0 })
        if (text) gsap.set(text, { opacity: 0, y: 20 })

        ScrollTrigger.create({
          trigger: frame,
          start: 'top 80%',
          once: true,
          onEnter: () => {
            gsap.to(curtain, {
              opacity: 1,
              duration: 0.8,
              ease: 'power2.out',
            })
            if (text) {
              gsap.to(text, {
                opacity: 1,
                y: 0,
                duration: 0.6,
                delay: 0.3,
                ease: 'power2.out',
              })
            }
          },
        })
        return
      }

      // Desktop: scroll-scrubbed clip-path curtain reveal

      // Initial state: fully clipped from bottom
      gsap.set(curtain, { clipPath: 'inset(100% 0 0 0)' })
      if (text) gsap.set(text, { opacity: 0, y: 30 })

      // Clip-path reveal — scrubbed as frame scrolls into view
      gsap.to(curtain, {
        clipPath: 'inset(0% 0 0 0)',
        ease: 'none',
        force3D: true,
        scrollTrigger: {
          trigger: frame,
          start: 'top 85%',
          end: 'top 15%',
          scrub: 0.6,
        },
      })

      // Inner image parallax — image drifts slower than clip reveal
      // creating a "window opening onto a scene" effect
      if (img) {
        gsap.fromTo(
          img,
          { yPercent: -8 },
          {
            yPercent: 8,
            ease: 'none',
            force3D: true,
            scrollTrigger: {
              trigger: frame,
              start: 'top bottom',
              end: 'bottom top',
              scrub: true,
            },
          },
        )
      }

      // Text fade-in after clip-path is ~70% revealed
      if (text) {
        gsap.to(text, {
          opacity: 1,
          y: 0,
          ease: 'none',
          scrollTrigger: {
            trigger: frame,
            start: 'top 40%',
            end: 'top 10%',
            scrub: 1,
          },
        })
      }
    })
  }, sectionEl.value)
})

onUnmounted(() => {
  ctx?.revert()
})
</script>

<template>
  <section ref="sectionEl" class="cinematic-reveal w-screen relative left-1/2 -translate-x-1/2">
    <div
      v-for="(artwork, index) in revealArtworks"
      :key="artwork!.id"
      :ref="(el) => { if (el) frameEls[index] = el as HTMLElement }"
      class="cinematic-reveal__frame relative w-full overflow-hidden"
      :style="{ height: index === 0 ? '120vh' : '100vh' }"
    >
      <!-- Clip-path container (the "curtain") -->
      <div
        :ref="(el) => { if (el) curtainEls[index] = el as HTMLElement }"
        class="cinematic-reveal__curtain absolute inset-0"
      >
        <!-- Inner image with parallax offset -->
        <img
          :ref="(el: any) => { if (el) imgEls[index] = el as HTMLElement }"
          :src="artwork!.src"
          :alt="artwork!.title"
          class="cinematic-reveal__img absolute object-cover"
          loading="lazy"
          draggable="false"
        />
      </div>

      <!-- Gradient overlay for text legibility -->
      <div class="absolute inset-0 bg-gradient-to-t from-dark-900/70 via-transparent to-dark-900/30 pointer-events-none z-[2]" />

      <!-- Text overlay -->
      <div
        :ref="(el) => { if (el) textEls[index] = el as HTMLElement }"
        class="absolute bottom-0 left-0 right-0 z-[3] px-8 md:px-16 lg:px-24 pb-16 md:pb-24"
      >
        <p class="font-body text-xs uppercase tracking-[0.2em] text-lavender-300 mb-3">
          {{ artwork!.medium }} &middot; {{ artwork!.year }}
        </p>
        <h3 class="font-display text-3xl md:text-5xl lg:text-6xl font-bold text-lavender-100 leading-none">
          {{ artwork!.title }}
        </h3>
      </div>
    </div>
  </section>
</template>

<style scoped>
.cinematic-reveal__curtain {
  will-change: clip-path;
}

.cinematic-reveal__img {
  /* Oversized for parallax headroom — image is 120% with 10% bleed on all sides */
  inset: -10%;
  width: 120%;
  height: 120%;
  will-change: transform;
}

/* Mobile: reduce frame heights */
@media (max-width: 767px) {
  .cinematic-reveal__frame {
    height: 70vh !important;
  }
}
</style>
