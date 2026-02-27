<script setup lang="ts">
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useIsMobile, useReducedMotion } from '~/composables/useMediaQuery'
import { categories as allCategories } from '~/data/artworks'

const sectionEl = ref<HTMLElement | null>(null)
const headingEl = ref<HTMLElement | null>(null)
const headingLabelEl = ref<HTMLElement | null>(null)
const headingTextEl = ref<HTMLElement | null>(null)
const previewEl = ref<HTMLElement | null>(null)
const isMobile = useIsMobile()
const reducedMotion = useReducedMotion()

let ctx: gsap.Context | null = null

// Representative preview image per category
const categoryPreviews: Record<string, string> = {
  portraits: '/images/artworks/veiled-gaze.webp',
  landscapes: '/images/artworks/silk-valley.webp',
  abstract: '/images/artworks/blue-architecture.webp',
  surreal: '/images/artworks/luminous-grove.webp',
  anime: '/images/artworks/red-shift.webp',
  'sci-fi': '/images/artworks/leviathan.webp',
}

const categories = allCategories
  .filter(c => c.id !== 'all')
  .map(c => ({ label: c.label, to: `/${c.id}`, preview: categoryPreviews[c.id] || '' }))

// Hover image preview state
const activePreview = ref('')
const isPreviewVisible = ref(false)
let previewXTo: gsap.QuickToFunc | null = null
let previewYTo: gsap.QuickToFunc | null = null

function onLinkEnter(preview: string) {
  if (isMobile.value || !preview) return
  activePreview.value = preview
  isPreviewVisible.value = true
  if (previewEl.value) {
    gsap.to(previewEl.value, {
      opacity: 1,
      scale: 1,
      duration: 0.35,
      ease: 'power3.out',
      overwrite: true,
    })
  }
}

function onLinkLeave() {
  if (isMobile.value) return
  isPreviewVisible.value = false
  if (previewEl.value) {
    gsap.to(previewEl.value, {
      opacity: 0,
      scale: 0.92,
      duration: 0.25,
      ease: 'power2.in',
      overwrite: true,
    })
  }
}

function onNavMouseMove(e: MouseEvent) {
  if (!previewXTo || !previewYTo || !sectionEl.value) return
  const rect = sectionEl.value.getBoundingClientRect()
  previewXTo(e.clientX - rect.left + 24)
  previewYTo(e.clientY - rect.top - 80)
}

onMounted(async () => {
  if (!sectionEl.value || !headingEl.value) return

  // Hover preview follow — desktop only
  if (!isMobile.value && previewEl.value) {
    previewXTo = gsap.quickTo(previewEl.value, 'left', { duration: 0.4, ease: 'power2.out' })
    previewYTo = gsap.quickTo(previewEl.value, 'top', { duration: 0.4, ease: 'power2.out' })
  }

  if (reducedMotion.value) return

  const { default: Splitting } = await import('splitting')

  // Query link elements directly from DOM — avoids function-ref timing issues
  const linkElements = Array.from(
    sectionEl.value.querySelectorAll('.collection-cta__link'),
  ) as HTMLElement[]

  // Split heading into words
  const headingWords = headingTextEl.value
    ? (Splitting({ target: headingTextEl.value, by: 'words' })[0]?.words || [])
    : []

  // Split each link's text into chars
  const linkTextEls = Array.from(
    sectionEl.value.querySelectorAll('.collection-cta__link-text'),
  ) as HTMLElement[]
  const linkCharSets = linkTextEls.map(el => {
    const result = Splitting({ target: el, by: 'chars' })
    return result[0]?.chars || []
  })

  ctx = gsap.context(() => {
    // Heading: label + word stagger
    gsap.set(headingEl.value!, { opacity: 0, y: 40 })
    if (headingWords.length) gsap.set(headingWords, { opacity: 0, y: 20 })

    ScrollTrigger.create({
      trigger: sectionEl.value!,
      start: 'top 75%',
      once: true,
      onEnter: () => {
        // Container slides into view
        gsap.to(headingEl.value!, {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: 'power3.out',
          force3D: true,
          onComplete() {
            gsap.set(this.targets()[0], { clearProps: 'transform,willChange,force3D' })
          },
        })

        // Words stagger in with slight delay
        if (headingWords.length) {
          gsap.to(headingWords, {
            opacity: 1,
            y: 0,
            duration: 0.7,
            stagger: { each: 0.08, from: 'start' },
            delay: 0.2,
            ease: 'power3.out',
            onComplete() {
              this.targets().forEach((el: HTMLElement) =>
                gsap.set(el, { clearProps: 'transform,willChange' }),
              )
            },
          })
        }

        // Stagger link containers + their chars cascade
        if (linkElements.length) {
          gsap.fromTo(
            linkElements,
            { opacity: 0, y: 30 },
            {
              opacity: 1,
              y: 0,
              duration: 0.7,
              stagger: 0.1,
              delay: 0.3,
              ease: 'power3.out',
              force3D: true,
              onComplete() {
                this.targets().forEach((el: HTMLElement) => gsap.set(el, { clearProps: 'transform,willChange,force3D' }))
              },
            },
          )

          // Within each link, stagger chars with cascaded per-link delay
          linkCharSets.forEach((chars, linkIdx) => {
            if (!chars.length) return
            gsap.set(chars, { opacity: 0, y: 15 })
            gsap.to(chars, {
              opacity: 1,
              y: 0,
              duration: 0.5,
              stagger: 0.02,
              delay: 0.5 + linkIdx * 0.12,
              ease: 'power3.out',
              onComplete() {
                this.targets().forEach((el: HTMLElement) =>
                  gsap.set(el, { clearProps: 'transform,willChange' }),
                )
              },
            })
          })

          // Animate border lines drawing from left to right
          const borderLines = Array.from(
            sectionEl.value!.querySelectorAll('.collection-cta__border'),
          ) as HTMLElement[]
          if (borderLines.length) {
            gsap.fromTo(
              borderLines,
              { scaleX: 0 },
              {
                scaleX: 1,
                duration: 0.6,
                stagger: 0.08,
                delay: 0.4,
                ease: 'power2.out',
              },
            )
          }
        }
      },
    })
  }, sectionEl.value)
})

onUnmounted(() => {
  ctx?.revert()
  previewXTo = null
  previewYTo = null
})
</script>

<template>
  <section ref="sectionEl" class="collection-cta relative overflow-hidden bg-dark-900">
    <div class="collection-cta__inner relative z-10">
      <!-- Subtle top rule -->
      <div class="w-16 h-px bg-accent-red/40 mx-auto mb-8" />

      <div ref="headingEl" class="text-center mb-10 md:mb-14">
        <p ref="headingLabelEl" class="font-body text-xs uppercase tracking-[0.25em] text-lavender-400 mb-6">
          Full Collection
        </p>
        <h2 ref="headingTextEl" class="font-display font-bold text-lavender-100 leading-none collection-cta__heading">
          Explore by Category
        </h2>
      </div>

      <!-- Floating preview image (desktop only) -->
      <div
        v-if="!isMobile"
        ref="previewEl"
        class="collection-cta__preview pointer-events-none"
        :style="{ opacity: 0 }"
      >
        <img
          v-if="activePreview"
          :src="activePreview"
          alt=""
          class="w-full h-full object-cover"
          aria-hidden="true"
        />
      </div>

      <!-- Category links — large editorial text -->
      <nav
        class="collection-cta__nav"
        aria-label="Art categories"
        @mousemove="onNavMouseMove"
      >
        <div class="collection-cta__border origin-left" />
        <NuxtLink
          v-for="cat in categories"
          :key="cat.to"
          :to="cat.to"
          class="collection-cta__link group"
          @mouseenter="onLinkEnter(cat.preview)"
          @mouseleave="onLinkLeave"
        >
          <span class="collection-cta__link-text font-display font-bold uppercase leading-none">
            {{ cat.label }}
          </span>
          <svg
            class="collection-cta__arrow"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
          >
            <line x1="4" y1="20" x2="20" y2="4" />
            <polyline points="8 4 20 4 20 16" />
          </svg>
          <div class="collection-cta__border origin-left" />
        </NuxtLink>
      </nav>

      <!-- View All link -->
      <div class="text-center mt-10">
        <NuxtLink
          to="/gallery"
          class="inline-flex items-center gap-2 px-6 py-3 border border-white/[0.08] rounded-full font-body text-sm text-lavender-300 hover:border-accent-red/30 hover:text-accent-red transition-all duration-300 group"
        >
          View All Works
          <svg class="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
          </svg>
        </NuxtLink>
      </div>
    </div>
  </section>
</template>

<style scoped>
.collection-cta {
  padding: 4rem 0;
}

@media (min-width: 768px) {
  .collection-cta {
    padding: 5rem 0;
  }
}

.collection-cta__inner {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

.collection-cta__heading {
  font-size: clamp(2.5rem, 6vw, 5rem);
  letter-spacing: -0.03em;
}

.collection-cta__nav {
  display: flex;
  flex-direction: column;
  gap: 0;
  position: relative;
}

/* Floating preview image */
.collection-cta__preview {
  position: absolute;
  width: 220px;
  height: 280px;
  border-radius: 10px;
  overflow: hidden;
  z-index: 20;
  pointer-events: none;
  transform: scale(0.92);
  box-shadow:
    0 25px 50px -12px rgba(0, 0, 0, 0.6),
    inset 0 0 0 1px rgba(255, 255, 255, 0.06);
}

.collection-cta__link {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem 0;
  position: relative;
  text-decoration: none;
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

/* Animated border lines */
.collection-cta__border {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: rgba(201, 210, 231, 0.08);
}

.collection-cta__nav > .collection-cta__border {
  position: relative;
  height: 1px;
  margin-bottom: 0;
}

.collection-cta__link:hover .collection-cta__border {
  background: rgba(237, 84, 77, 0.2);
  transition: background 0.4s ease;
}

.collection-cta__link-text {
  font-size: clamp(2rem, 6vw, 5rem);
  letter-spacing: -0.03em;
  color: rgba(218, 226, 242, 0.2);
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.collection-cta__link:hover .collection-cta__link-text {
  color: #dae2f2;
  letter-spacing: 0.02em;
}

.collection-cta__arrow {
  color: rgba(218, 226, 242, 0.1);
  width: clamp(20px, 3vw, 32px);
  height: clamp(20px, 3vw, 32px);
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  flex-shrink: 0;
}

.collection-cta__link:hover .collection-cta__arrow {
  color: #ed544d;
  transform: translate(4px, -4px);
}

:deep(.word) {
  display: inline-block;
}

:deep(.word + .whitespace) {
  width: 0.3em;
  display: inline-block;
}

:deep(.char) {
  display: inline-block;
}

/* Mobile */
@media (max-width: 767px) {
  .collection-cta {
    padding: 3rem 0;
  }

  .collection-cta__link {
    padding: 1.25rem 0;
  }
}
</style>
