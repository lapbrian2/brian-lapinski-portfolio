<template>
  <footer ref="footerEl" class="relative bg-dark-900 pt-24 pb-12 px-6 md:px-12 overflow-hidden">
    <!-- BL watermark -->
    <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 select-none pointer-events-none">
      <span ref="watermarkEl" class="font-display text-[12rem] md:text-[20rem] font-bold text-lavender-100/[0.02] leading-none">
        BL
      </span>
    </div>

    <!-- Animated top border -->
    <div ref="borderEl" class="absolute top-0 left-1/2 -translate-x-1/2 h-px bg-dark-700 origin-center" style="width: 0%" />

    <div class="max-w-[1400px] mx-auto relative">
      <!-- Main footer grid -->
      <div class="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8 mb-16">
        <!-- Left: Large name -->
        <div class="md:col-span-7">
          <span class="font-display text-section font-bold text-lavender-100 leading-none block mb-4">
            Brian Lapinski
          </span>
          <p class="font-body text-base text-lavender-400 max-w-md">
            AI artist and educator exploring what it means to be human through images.
          </p>
        </div>

        <!-- Right: Links columns -->
        <div class="md:col-span-5 flex gap-16">
          <!-- Social -->
          <div>
            <h4 class="font-body text-xs uppercase tracking-[0.2em] text-lavender-400/60 mb-4">
              Social
            </h4>
            <nav class="flex flex-col gap-3">
              <a
                v-for="social in socialLinks"
                :key="social.label"
                :href="social.href"
                target="_blank"
                rel="noopener noreferrer"
                class="font-body text-sm text-lavender-300 hover:text-accent-red transition-colors duration-200 hover-reveal w-fit"
              >
                {{ social.label }}
              </a>
            </nav>
          </div>

          <!-- Navigation -->
          <div>
            <h4 class="font-body text-xs uppercase tracking-[0.2em] text-lavender-400/60 mb-4">
              Navigate
            </h4>
            <nav class="flex flex-col gap-3">
              <a
                v-for="link in navLinks"
                :key="link.id"
                :href="`#${link.id}`"
                class="font-body text-sm text-lavender-300 hover:text-accent-red transition-colors duration-200 hover-reveal w-fit"
                @click.prevent="scrollToSection(link.id)"
              >
                {{ link.label }}
              </a>
            </nav>
          </div>
        </div>
      </div>

      <!-- Bottom Row -->
      <div class="flex items-center justify-between pt-6 border-t border-dark-700/50">
        <p class="text-xs text-lavender-500 font-body">
          &copy; {{ new Date().getFullYear() }} Brian Lapinski
        </p>

        <!-- Back to top -->
        <button
          ref="topBtnEl"
          class="group flex items-center gap-2 text-xs text-lavender-400 hover:text-lavender-100 transition-colors duration-300 uppercase tracking-wider font-body"
          aria-label="Back to top"
          @click="scrollToTop"
        >
          Back to top
          <span class="inline-block w-8 h-8 rounded-full border border-dark-600 flex items-center justify-center group-hover:border-accent-red group-hover:bg-accent-red/10 transition-all duration-300">
            <span class="text-sm">&uarr;</span>
          </span>
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

const navLinks = [
  { id: 'work', label: 'Work' },
  { id: 'about', label: 'About' },
  { id: 'process', label: 'Process' },
  { id: 'contact', label: 'Contact' },
]

const footerEl = ref<HTMLElement | null>(null)
const borderEl = ref<HTMLElement | null>(null)
const watermarkEl = ref<HTMLElement | null>(null)
const topBtnEl = ref<HTMLElement | null>(null)

useMagneticHover(topBtnEl, { strength: 0.4, scaleTo: 1.05 })

let ctx: gsap.Context | null = null

function scrollToTop() {
  const { $lenis } = useNuxtApp()
  if ($lenis) {
    ;($lenis as any).scrollTo(0)
  } else {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

function scrollToSection(sectionId: string) {
  const { $lenis } = useNuxtApp()
  const target = document.querySelector(`#${sectionId}`)
  if (!target) return
  if ($lenis) {
    ;($lenis as any).scrollTo(target, { offset: -80 })
  } else {
    target.scrollIntoView({ behavior: 'smooth' })
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
  }, footerEl.value)
})

onUnmounted(() => {
  ctx?.revert()
})
</script>
