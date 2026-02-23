<template>
  <footer ref="footerEl" class="relative bg-dark-900 py-16 px-6 md:px-12 overflow-hidden">
    <!-- BL watermark -->
    <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 select-none pointer-events-none">
      <span ref="watermarkEl" class="font-display text-[12rem] md:text-[16rem] font-bold text-lavender-100/[0.03] leading-none">
        BL
      </span>
    </div>

    <!-- Animated top border -->
    <div ref="borderEl" class="absolute top-0 left-1/2 -translate-x-1/2 h-px bg-dark-700 origin-center" style="width: 0%" />

    <div class="max-w-[1400px] mx-auto relative">
      <!-- Top Row -->
      <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8">
        <!-- Name -->
        <span class="font-display text-xl font-semibold text-lavender-100">
          Brian Lapinski
        </span>

        <!-- Social Links -->
        <nav class="flex items-center gap-6">
          <a
            v-for="social in socialLinks"
            :key="social.label"
            :href="social.href"
            target="_blank"
            rel="noopener noreferrer"
            class="font-body text-sm text-lavender-300 hover:text-accent-red transition-colors duration-200 hover-reveal"
          >
            {{ social.label }}
          </a>
        </nav>
      </div>

      <!-- Bottom Row -->
      <div class="flex items-center justify-between pt-6 border-t border-dark-700">
        <p class="text-sm text-lavender-400 font-body">
          &copy; 2026 Brian Lapinski. All rights reserved.
        </p>

        <!-- Back to top -->
        <button
          ref="topBtnEl"
          class="group w-10 h-10 rounded-full border border-dark-600 flex items-center justify-center transition-colors duration-300 hover:border-accent-red hover:bg-accent-red/10"
          aria-label="Back to top"
          @click="scrollToTop"
        >
          <span class="text-lavender-300 group-hover:text-lavender-100 transition-colors duration-200 text-sm">&uarr;</span>
        </button>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useMagneticHover } from '~/composables/useMagneticHover'

interface SocialLink {
  label: string
  href: string
}

const socialLinks: SocialLink[] = [
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/brian-lapinski-a65238352' },
  { label: 'X / Twitter', href: 'https://x.com/Lapbrian2' },
]

const footerEl = ref<HTMLElement | null>(null)
const borderEl = ref<HTMLElement | null>(null)
const watermarkEl = ref<HTMLElement | null>(null)
const topBtnEl = ref<HTMLElement | null>(null)

useMagneticHover(topBtnEl, { strength: 0.4, scaleTo: 1.1 })

let ctx: gsap.Context | null = null

function scrollToTop() {
  const { $lenis } = useNuxtApp()
  if ($lenis) {
    ;($lenis as any).scrollTo(0)
  } else {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

onMounted(() => {
  if (!footerEl.value) return

  ctx = gsap.context(() => {
    // Border animates width from center
    if (borderEl.value) {
      ScrollTrigger.create({
        trigger: footerEl.value!,
        start: 'top 95%',
        once: true,
        onEnter: () => {
          gsap.to(borderEl.value!, { width: '100%', duration: 0.8, ease: 'power2.out' })
        },
      })
    }

    // Watermark parallax
    if (watermarkEl.value) {
      gsap.to(watermarkEl.value, {
        y: -30,
        ease: 'none',
        scrollTrigger: {
          trigger: footerEl.value!,
          start: 'top bottom',
          end: 'bottom bottom',
          scrub: true,
        },
      })
    }

    // Content stagger
    const content = footerEl.value!.querySelectorAll('.max-w-\\[1400px\\] > div')
    gsap.set(content, { opacity: 0, y: 20 })
    ScrollTrigger.create({
      trigger: footerEl.value!,
      start: 'top 90%',
      once: true,
      onEnter: () => {
        gsap.to(content, {
          opacity: 1,
          y: 0,
          duration: 0.7,
          stagger: 0.15,
          ease: 'power2.out',
        })
      },
    })

    // Magnetic hover handled by useMagneticHover composable
  }, footerEl.value)
})

onUnmounted(() => {
  ctx?.revert()
})
</script>
