<template>
  <footer ref="footerEl" class="relative bg-dark-900 pt-12 pb-12 px-6 md:px-12 overflow-hidden" aria-label="Site footer">
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
          <span class="font-display font-bold text-lavender-100 leading-none block mb-4 footer-name">
            Brian Lapinski
          </span>
          <p class="font-body text-base text-lavender-400 max-w-md">
            AI artist and educator exploring what it means to be human through images.
          </p>
          <p class="font-body text-sm text-lavender-500 mt-3 flex items-center gap-2">
            AI Architect at
            <a
              href="https://www.linkedin.com/company/the-house-of-curiosity"
              target="_blank"
              rel="noopener noreferrer"
              class="text-lavender-300 hover:text-accent-red transition-colors duration-200"
            >The House of Curiosity</a>
          </p>
        </div>

        <!-- Right: Links columns -->
        <div class="md:col-span-5 flex gap-16">
          <!-- Social -->
          <div>
            <p class="font-body text-xs uppercase tracking-[0.2em] text-lavender-300 mb-4">
              Social
            </p>
            <nav class="flex flex-col gap-3">
              <a
                v-for="social in socialLinks"
                :key="social.label"
                :href="social.href"
                target="_blank"
                rel="noopener noreferrer"
                class="footer-link group/link relative font-body text-sm text-lavender-300 hover:text-accent-red transition-colors duration-200 w-fit"
              >
                {{ social.label }}
                <span class="absolute bottom-0 left-0 w-full h-px bg-accent-red/50 origin-left scale-x-0 group-hover/link:scale-x-100 transition-transform duration-300 ease-out" />
              </a>
            </nav>
          </div>

          <!-- Navigation -->
          <div>
            <p class="font-body text-xs uppercase tracking-[0.2em] text-lavender-300 mb-4">
              Navigate
            </p>
            <nav class="flex flex-col gap-3">
              <a
                v-for="link in navLinks"
                :key="link.id"
                :href="`#${link.id}`"
                class="footer-link group/link relative font-body text-sm text-lavender-300 hover:text-accent-red transition-colors duration-200 w-fit"
                @click.prevent="scrollToSection(link.id)"
              >
                {{ link.label }}
                <span class="absolute bottom-0 left-0 w-full h-px bg-accent-red/50 origin-left scale-x-0 group-hover/link:scale-x-100 transition-transform duration-300 ease-out" />
              </a>
              <NuxtLink
                v-for="page in pageLinks"
                :key="page.to"
                :to="page.to"
                class="footer-link group/link relative font-body text-sm text-lavender-300 hover:text-accent-red transition-colors duration-200 w-fit"
              >
                {{ page.label }}
                <span class="absolute bottom-0 left-0 w-full h-px bg-accent-red/50 origin-left scale-x-0 group-hover/link:scale-x-100 transition-transform duration-300 ease-out" />
              </NuxtLink>
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
          class="btn-press group flex items-center gap-3 text-xs text-lavender-400 hover:text-lavender-100 transition-colors duration-300 uppercase tracking-wider font-body"
          aria-label="Back to top"
          @click="scrollToTop"
        >
          Back to top
          <span class="top-btn-ring relative w-9 h-9 rounded-full border border-dark-600 flex items-center justify-center group-hover:border-accent-red group-hover:bg-accent-red/10 transition-all duration-300">
            <!-- Pulse ring on hover -->
            <span class="absolute inset-0 rounded-full border border-accent-red/0 group-hover:border-accent-red/30 group-hover:scale-[1.4] group-hover:opacity-0 transition-all duration-700 ease-out" />
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="group-hover:-translate-y-0.5 transition-transform duration-300">
              <line x1="7" y1="12" x2="7" y2="2" />
              <polyline points="3 6 7 2 11 6" />
            </svg>
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
import { useReducedMotion } from '~/composables/useMediaQuery'

interface SocialLink {
  label: string
  href: string
}

const socialLinks: SocialLink[] = [
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/brian-lapinski-a65238352' },
  { label: 'X / Twitter', href: 'https://x.com/Lapbrian2' },
  { label: 'Instagram', href: 'https://www.instagram.com/brian_lapinski1/' },
]

const navLinks = [
  { id: 'work', label: 'Work' },
  { id: 'about', label: 'About' },
  { id: 'process', label: 'Process' },
  { id: 'contact', label: 'Contact' },
]

const pageLinks = [
  { to: '/shop', label: 'Shop' },
  { to: '/collections', label: 'Collections' },
]

const footerEl = ref<HTMLElement | null>(null)
const borderEl = ref<HTMLElement | null>(null)
const watermarkEl = ref<HTMLElement | null>(null)
const topBtnEl = ref<HTMLElement | null>(null)

useMagneticHover(topBtnEl, { strength: 0.4, scaleTo: 1.05 })

const reducedMotion = useReducedMotion()
let ctx: gsap.Context | null = null

function scrollToTop() {
  // If not on the homepage, navigate there
  const route = useRoute()
  if (route.path !== '/') {
    navigateTo('/')
    return
  }

  const { $lenis } = useNuxtApp()
  if ($lenis) {
    ;($lenis as any).scrollTo(0)
  } else {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

function scrollToSection(sectionId: string) {
  const target = document.querySelector(`#${sectionId}`)

  // If the section doesn't exist on this page, navigate to homepage with hash
  if (!target) {
    navigateTo(`/#${sectionId}`)
    return
  }

  const { $lenis } = useNuxtApp()
  if ($lenis) {
    ;($lenis as any).scrollTo(target, { offset: -80 })
  } else {
    target.scrollIntoView({ behavior: 'smooth' })
  }
}

onMounted(() => {
  if (!footerEl.value) return

  // Respect reduced-motion preference
  if (reducedMotion.value) return

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

<style scoped>
.footer-name {
  font-size: clamp(2rem, 5vw, 4rem);
  letter-spacing: -0.03em;
}
</style>
