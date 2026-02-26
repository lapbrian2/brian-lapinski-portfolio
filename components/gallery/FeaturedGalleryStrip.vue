<script setup lang="ts">
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useIsMobile, useReducedMotion } from '~/composables/useMediaQuery'
import type { SourceRect } from '~/composables/useLightbox'

const { artworks } = useArtworks()
const lightbox = useLightbox()
const isMobile = useIsMobile()
const reducedMotion = useReducedMotion()

// Pick featured artworks, or the first 8 if none are explicitly featured
const featured = computed(() => {
  const feat = artworks.value.filter((a) => a.featured)
  if (feat.length >= 4) return feat.slice(0, 12)
  return artworks.value.slice(0, 8)
})

const sectionEl = ref<HTMLElement | null>(null)
const desktopEl = ref<HTMLElement | null>(null)
const stripEl = ref<HTMLElement | null>(null)
const progressEl = ref<HTMLElement | null>(null)
const headingEl = ref<HTMLElement | null>(null)
const cardEls = ref<HTMLElement[]>([])

let ctx: gsap.Context | null = null
let resizeTimer: ReturnType<typeof setTimeout> | null = null

function openLightbox(index: number) {
  const card = cardEls.value[index]
  let rect: SourceRect | null = null
  if (card) {
    const domRect = card.getBoundingClientRect()
    rect = {
      top: domRect.top,
      left: domRect.left,
      width: domRect.width,
      height: domRect.height,
      borderRadius: '12px',
    }
  }
  const items = featured.value.map((a) => ({
    id: a.id,
    src: a.src,
    title: a.title,
    medium: a.medium,
    description: a.description,
    year: a.year,
    rawPrompt: a.rawPrompt,
    mjVersion: a.mjVersion,
    refinementNotes: a.refinementNotes,
    promptNodes: a.promptNodes,
    likeCount: a.likeCount,
  }))
  lightbox.open(items, index, rect)
}

function setupDesktopScroll() {
  ctx?.revert()

  if (!desktopEl.value || !stripEl.value) return

  ctx = gsap.context(() => {
    const getScrollAmount = () => {
      return -(stripEl.value!.scrollWidth - window.innerWidth)
    }

    const st = ScrollTrigger.create({
      trigger: desktopEl.value!,
      start: 'top top',
      end: () => `+=${Math.abs(getScrollAmount())}`,
      pin: true,
      scrub: 1,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        // Progress bar
        if (progressEl.value) {
          progressEl.value.style.transform = `scaleX(${self.progress})`
        }

        // Per-card active scaling — cards near center get a scale bump + glow
        const cards = cardEls.value
        if (!cards.length) return
        const vw = window.innerWidth
        const centerX = vw / 2

        cards.forEach((card, i) => {
          if (!card) return
          const rect = card.getBoundingClientRect()
          const cardCenter = rect.left + rect.width / 2
          const distance = Math.abs(cardCenter - centerX)
          const maxDist = vw * 0.6
          const proximity = Math.max(0, 1 - distance / maxDist)

          // Scale: 1.0 → 1.04 at center
          const scale = 1 + proximity * 0.04
          // Glow opacity
          const glowOpacity = proximity * 0.6

          gsap.set(card, {
            scale,
            force3D: true,
          })

          const glow = card.querySelector('.strip-glow')
          if (glow) {
            gsap.set(glow, { opacity: glowOpacity })
          }
        })
      },
    })

    // Animate the strip horizontally
    gsap.to(stripEl.value!, {
      x: getScrollAmount,
      ease: 'none',
      scrollTrigger: st,
    })

    // Inner image parallax — each image shifts slightly against the scroll
    const imgs = stripEl.value!.querySelectorAll<HTMLElement>('.strip-img')
    imgs.forEach((img) => {
      gsap.fromTo(img,
        { y: '-6%' },
        {
          y: '6%',
          ease: 'none',
          force3D: true,
          scrollTrigger: {
            trigger: desktopEl.value!,
            start: 'top top',
            end: () => `+=${Math.abs(getScrollAmount())}`,
            scrub: true,
          },
        },
      )
    })
  }, desktopEl.value)
}

function onResize() {
  if (isMobile.value) return
  if (resizeTimer) clearTimeout(resizeTimer)
  resizeTimer = setTimeout(() => {
    setupDesktopScroll()
  }, 200)
}

onMounted(() => {
  nextTick(() => {
    if (reducedMotion.value) return
    if (isMobile.value) return

    if (!desktopEl.value || !stripEl.value) return
    setupDesktopScroll()
    window.addEventListener('resize', onResize, { passive: true })
  })
})

onUnmounted(() => {
  window.removeEventListener('resize', onResize)
  if (resizeTimer) clearTimeout(resizeTimer)
  ctx?.revert()
})
</script>

<template>
  <section v-if="featured.length >= 3" ref="sectionEl" class="overflow-hidden">
    <!-- Heading -->
    <div ref="headingEl" class="max-w-7xl mx-auto px-6 md:px-12 pt-24 pb-8 text-center">
      <p class="font-body text-xs uppercase tracking-[0.3em] text-accent-red mb-3">
        Featured Works
      </p>
      <h2 class="font-display text-2xl md:text-3xl font-bold text-lavender-100">
        Explore the Collection
      </h2>
    </div>

    <!-- Desktop: Pinned horizontal scroll -->
    <div v-if="!isMobile" ref="desktopEl" class="relative">
      <!-- Progress line -->
      <div class="absolute top-0 left-0 w-full h-px bg-dark-700 z-10">
        <div ref="progressEl" class="h-full bg-accent-red origin-left" style="transform: scaleX(0)" />
      </div>

      <div class="h-screen flex items-center">
        <div ref="stripEl" class="flex gap-5 pl-8 pr-8 md:pl-16 md:pr-16 md:gap-8">
          <div
            v-for="(artwork, index) in featured"
            :key="artwork.id"
            :ref="(el) => { if (el) cardEls[index] = el as HTMLElement }"
            class="strip-card flex-shrink-0 relative overflow-hidden rounded-xl cursor-pointer group"
            style="width: clamp(300px, 30vw, 440px); height: clamp(400px, 55vh, 600px)"
            role="button"
            :tabindex="0"
            :aria-label="`View ${artwork.title}`"
            @click="openLightbox(index)"
            @keydown.enter="openLightbox(index)"
            @keydown.space.prevent="openLightbox(index)"
          >
            <!-- Image with inner parallax -->
            <NuxtImg
              :src="artwork.src"
              :alt="artwork.title"
              width="800"
              height="1000"
              sizes="(max-width: 768px) 80vw, 30vw"
              class="strip-img absolute inset-[-8%] w-[116%] h-[116%] object-cover transition-transform duration-700 group-hover:scale-105"
              loading="lazy"
            />

            <!-- Dominant color glow (driven by scroll proximity) -->
            <div
              class="strip-glow absolute inset-0 pointer-events-none opacity-0"
              :style="{
                boxShadow: `inset 0 0 60px ${artwork.dominantColor || '#ed544d'}40, 0 0 40px ${artwork.dominantColor || '#ed544d'}20`,
              }"
            />

            <!-- Bottom overlay -->
            <div
              class="absolute inset-x-0 bottom-0 pointer-events-none z-[3]"
              :style="{
                background: `linear-gradient(to top, ${artwork.dominantColor || '#000000'}cc 0%, ${artwork.dominantColor || '#000000'}40 50%, transparent 100%)`,
              }"
            >
              <div class="px-5 pt-12 pb-5">
                <h3 class="font-display text-lg text-lavender-100 leading-tight">
                  {{ artwork.title }}
                </h3>
                <p class="text-xs text-lavender-400 mt-1.5 uppercase tracking-wide">
                  {{ artwork.medium }} &middot; {{ artwork.year }}
                </p>
              </div>
            </div>

            <!-- Hover arrow indicator -->
            <div class="absolute top-4 right-4 z-[4] opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <span class="w-8 h-8 rounded-full border border-lavender-400/30 flex items-center justify-center text-lavender-300 bg-dark-900/40 backdrop-blur-sm">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
                  <line x1="2" y1="10" x2="10" y2="2" />
                  <polyline points="4 2 10 2 10 8" />
                </svg>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Mobile: Horizontal swipe strip -->
    <div v-else class="px-4 pb-16">
      <div class="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 -mx-4 px-4 scrollbar-hide">
        <div
          v-for="(artwork, index) in featured"
          :key="artwork.id"
          class="snap-center flex-shrink-0 relative overflow-hidden rounded-xl cursor-pointer"
          style="width: 75vw; max-width: 320px; height: 420px"
          role="button"
          :tabindex="0"
          :aria-label="`View ${artwork.title}`"
          @click="openLightbox(index)"
        >
          <NuxtImg
            :src="artwork.src"
            :alt="artwork.title"
            width="640"
            height="840"
            sizes="75vw"
            class="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
          />
          <div
            class="absolute inset-x-0 bottom-0 pointer-events-none"
            :style="{
              background: `linear-gradient(to top, ${artwork.dominantColor || '#000000'}cc 0%, transparent 100%)`,
            }"
          >
            <div class="px-4 pt-8 pb-4">
              <h3 class="font-display text-base text-lavender-100 leading-tight">
                {{ artwork.title }}
              </h3>
              <p class="text-[10px] text-lavender-400 mt-1 uppercase tracking-wide">
                {{ artwork.medium }} &middot; {{ artwork.year }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>
