<template>
  <header
    :class="[
      'fixed top-0 left-0 w-full z-50 transition-all duration-300 px-6 md:px-12 py-4',
      scrolled ? 'bg-dark-900/95 backdrop-blur-md shadow-lg' : 'bg-transparent',
      navHidden ? '-translate-y-full' : 'translate-y-0',
    ]"
  >
    <div class="max-w-[1400px] mx-auto flex items-center justify-between">
      <!-- Logo -->
      <a
        href="#"
        class="font-display font-bold text-2xl text-lavender-100 hover:text-accent-red transition-colors duration-200"
        @click.prevent="scrollToTop"
      >
        BL
      </a>

      <!-- Desktop Navigation -->
      <nav class="hidden md:flex items-center gap-8">
        <a
          v-for="link in navLinks"
          :key="link.id"
          :href="`#${link.id}`"
          class="font-body text-sm uppercase tracking-wider text-lavender-300 hover:text-lavender-100 transition-colors duration-200 hover-reveal"
          @click.prevent="scrollToSection(link.id)"
        >
          {{ link.label }}
        </a>
      </nav>

      <!-- Mobile Hamburger Button -->
      <button
        class="md:hidden relative z-50 w-8 h-6 flex flex-col justify-between"
        aria-label="Toggle navigation menu"
        @click="toggleMobile"
      >
        <span
          :class="[
            'block w-full h-0.5 bg-lavender-100 transition-all duration-300 origin-center',
            mobileOpen ? 'rotate-45 translate-y-[11px]' : '',
          ]"
        />
        <span
          :class="[
            'block w-full h-0.5 bg-lavender-100 transition-all duration-300',
            mobileOpen ? 'opacity-0 scale-x-0' : 'opacity-100 scale-x-100',
          ]"
        />
        <span
          :class="[
            'block w-full h-0.5 bg-lavender-100 transition-all duration-300 origin-center',
            mobileOpen ? '-rotate-45 -translate-y-[11px]' : '',
          ]"
        />
      </button>
    </div>

    <!-- Mobile Overlay Menu -->
    <div
      v-show="mobileOpen"
      ref="mobileOverlayEl"
      class="fixed inset-0 z-40 bg-dark-900 flex items-center justify-center"
      style="clip-path: circle(0% at calc(100% - 40px) 28px)"
    >
      <nav ref="mobileNavEl" class="flex flex-col items-center gap-10">
        <a
          v-for="(link, i) in navLinks"
          :key="link.id"
          :href="`#${link.id}`"
          class="mobile-link font-display text-4xl font-semibold text-lavender-200 hover:text-accent-red transition-colors duration-200"
          @click.prevent="scrollToSection(link.id)"
        >
          <span class="inline-block overflow-hidden">
            <span class="mobile-link-inner inline-block">{{ link.label }}</span>
          </span>
        </a>
      </nav>
    </div>
  </header>
</template>

<script setup lang="ts">
import gsap from 'gsap'

interface NavLink {
  id: string
  label: string
}

const navLinks: NavLink[] = [
  { id: 'work', label: 'Work' },
  { id: 'about', label: 'About' },
  { id: 'process', label: 'Process' },
  { id: 'contact', label: 'Contact' },
]

const scrolled = ref(false)
const navHidden = ref(false)
const mobileOpen = ref(false)
const mobileOverlayEl = ref<HTMLElement | null>(null)
const mobileNavEl = ref<HTMLElement | null>(null)

let menuTl: gsap.core.Timeline | null = null

function scrollToTop(): void {
  const { $lenis } = useNuxtApp()
  if ($lenis) {
    ;($lenis as any).scrollTo(0)
  } else {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

function scrollToSection(sectionId: string): void {
  closeMobileMenu()
  const { $lenis } = useNuxtApp()
  const target = document.querySelector(`#${sectionId}`)
  if (!target) return

  if ($lenis) {
    ;($lenis as any).scrollTo(target, { offset: -80 })
  } else {
    target.scrollIntoView({ behavior: 'smooth' })
  }
}

function openMobileMenu() {
  mobileOpen.value = true

  nextTick(() => {
    if (!mobileOverlayEl.value || !mobileNavEl.value) return

    const links = mobileNavEl.value.querySelectorAll('.mobile-link-inner')
    menuTl?.kill()

    menuTl = gsap.timeline()

    // Circle clip-path reveal from hamburger position
    menuTl.to(mobileOverlayEl.value, {
      clipPath: 'circle(150% at calc(100% - 40px) 28px)',
      duration: 0.7,
      ease: 'power3.inOut',
    })

    // Stagger links sliding up from below
    menuTl.fromTo(links, {
      y: '100%',
      opacity: 0,
    }, {
      y: '0%',
      opacity: 1,
      duration: 0.5,
      stagger: 0.08,
      ease: 'power3.out',
    }, '-=0.3')
  })
}

function closeMobileMenu() {
  if (!mobileOverlayEl.value || !mobileNavEl.value) {
    mobileOpen.value = false
    return
  }

  const links = mobileNavEl.value.querySelectorAll('.mobile-link-inner')
  menuTl?.kill()

  menuTl = gsap.timeline({
    onComplete: () => {
      mobileOpen.value = false
    },
  })

  // Links slide out
  menuTl.to(links, {
    y: '-100%',
    opacity: 0,
    duration: 0.3,
    stagger: 0.04,
    ease: 'power2.in',
  })

  // Circle collapse
  menuTl.to(mobileOverlayEl.value, {
    clipPath: 'circle(0% at calc(100% - 40px) 28px)',
    duration: 0.5,
    ease: 'power3.inOut',
  }, '-=0.15')
}

function toggleMobile(): void {
  if (mobileOpen.value) {
    closeMobileMenu()
  } else {
    openMobileMenu()
  }
}

let lastScrollY = 0

function handleScroll(): void {
  const y = window.scrollY
  scrolled.value = y > 80

  if (y > 200 && y > lastScrollY && !mobileOpen.value) {
    navHidden.value = true
  } else {
    navHidden.value = false
  }
  lastScrollY = y
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
  handleScroll()
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  menuTl?.kill()
})
</script>
