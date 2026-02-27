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
const titleEls = ref<HTMLElement[]>([])

let ctx: gsap.Context | null = null

// Pick 3 showcase-worthy artworks — different categories, no hero duplicates
const showcaseIds = ['veiled-gaze', 'blue-architecture', 'desert-cathedral']
const revealArtworks = computed(() => {
  const found = showcaseIds
    .map(id => artworks.value.find(a => a.id === id))
    .filter(Boolean)
  if (found.length >= 3) return found.slice(0, 3)
  return artworks.value.slice(0, 3)
})

onMounted(async () => {
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

  const { default: Splitting } = await import('splitting')

  // Pre-split all title elements into chars
  const titleCharSets = titleEls.value.map(el => {
    if (!el) return []
    const result = Splitting({ target: el, by: 'chars' })
    return result[0]?.chars || []
  })

  ctx = gsap.context(() => {
    curtainEls.value.forEach((curtain, i) => {
      const img = imgEls.value[i]
      const text = textEls.value[i]
      const frame = frameEls.value[i]
      const titleChars = titleCharSets[i] || []
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
      if (titleChars.length) gsap.set(titleChars, { opacity: 0, y: 20, rotateX: -40 })

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

      // Text container slides into view
      if (text) {
        ScrollTrigger.create({
          trigger: frame,
          start: 'top 35%',
          once: true,
          onEnter: () => {
            gsap.to(text, {
              opacity: 1,
              y: 0,
              duration: 0.6,
              ease: 'power3.out',
            })

            // Title chars cascade in with 3D rotation
            if (titleChars.length) {
              gsap.to(titleChars, {
                opacity: 1,
                y: 0,
                rotateX: 0,
                duration: 0.7,
                stagger: { each: 0.025, from: 'start' },
                delay: 0.15,
                ease: 'power4.out',
                force3D: true,
                onComplete() {
                  this.targets().forEach((el: HTMLElement) =>
                    gsap.set(el, { clearProps: 'transform,willChange,force3D' }),
                  )
                },
              })
            }
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
        <h3
          :ref="(el: any) => { if (el) titleEls[index] = el as HTMLElement }"
          class="font-display text-3xl md:text-5xl lg:text-6xl font-bold text-lavender-100 leading-none"
          style="perspective: 300px"
        >
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
  /* Oversized for parallax headroom — image is 120% with 10% bleed on all sides.
     max-width: none overrides Tailwind's img reset (max-width: 100%) which
     would otherwise cap the image at the container width. */
  inset: -10%;
  width: 120%;
  height: 120%;
  max-width: none;
  will-change: transform;
}

:deep(.char) {
  display: inline-block;
}

/* Mobile: reduce frame heights */
@media (max-width: 767px) {
  .cinematic-reveal__frame {
    height: 70vh !important;
  }
}
</style>
