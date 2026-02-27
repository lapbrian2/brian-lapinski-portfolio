<template>
  <header
    :class="[
      'fixed top-0 left-0 w-full z-50 transition-all duration-300 px-6 md:px-12 py-4',
      scrolled ? 'bg-dark-900/80 backdrop-blur-xl shadow-lg' : 'bg-transparent',
      navHidden ? '-translate-y-full' : 'translate-y-0',
    ]"
  >
    <div class="max-w-[1400px] mx-auto flex items-center justify-between">
      <!-- Logo -->
      <a
        href="#"
        class="font-display font-bold text-2xl text-lavender-100 hover:text-accent-red transition-colors duration-200"
        aria-label="Brian Lapinski — back to top"
        @click.prevent="scrollToTop"
      >
        BL
      </a>

      <!-- Desktop Navigation -->
      <nav
        ref="desktopNavEl"
        class="hidden md:flex items-center gap-8 relative"
        aria-label="Main navigation"
      >
        <div
          ref="navPillEl"
          class="absolute bottom-0 h-0.5 bg-accent-red rounded-full transition-opacity duration-300"
          :class="activeSection ? 'opacity-100' : 'opacity-0'"
          style="will-change: transform, width"
        />
        <a
          v-for="link in sections"
          :key="link.id"
          :href="`#${link.id}`"
          :data-nav="link.id"
          :class="[
            'relative font-body text-sm uppercase tracking-wider transition-colors duration-200 hover-reveal',
            activeSection === link.id
              ? 'text-lavender-100'
              : 'text-lavender-400 hover:text-lavender-200',
          ]"
          :aria-current="activeSection === link.id ? 'location' : undefined"
          @click.prevent="scrollToSection(link.id)"
        >
          {{ link.label }}
        </a>
      </nav>

      <!-- Mobile Hamburger Button -->
      <button
        ref="hamburgerEl"
        class="btn-press md:hidden relative z-50 w-8 h-6 flex flex-col justify-between"
        aria-label="Toggle navigation menu"
        :aria-expanded="mobileOpen"
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
      role="dialog"
      aria-modal="true"
      aria-label="Mobile navigation"
    >
      <nav ref="mobileNavEl" class="flex flex-col items-center gap-10" aria-label="Mobile navigation">
        <a
          v-for="link in sections"
          :key="link.id"
          :href="`#${link.id}`"
          :class="[
            'mobile-link font-display text-4xl font-semibold transition-colors duration-200',
            activeSection === link.id ? 'text-accent-red' : 'text-lavender-200 hover:text-accent-red',
          ]"
          :aria-current="activeSection === link.id ? 'location' : undefined"
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
import { useActiveSection } from '~/composables/useActiveSection'

const { activeSection, sections } = useActiveSection()

const scrolled = ref(false)
const navHidden = ref(false)
const mobileOpen = ref(false)
const desktopNavEl = ref<HTMLElement | null>(null)
const navPillEl = ref<HTMLElement | null>(null)
const mobileOverlayEl = ref<HTMLElement | null>(null)
const mobileNavEl = ref<HTMLElement | null>(null)
const hamburgerEl = ref<HTMLElement | null>(null)

let menuTl: gsap.core.Timeline | null = null

function scrollToTop(): void {
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

function scrollToSection(sectionId: string): void {
  closeMobileMenu()

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

function openMobileMenu() {
  mobileOpen.value = true
  document.body.style.overflow = 'hidden'

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

    const firstLink = mobileNavEl.value?.querySelector('a')
    firstLink?.focus()
  })
}

function closeMobileMenu() {
  if (!mobileOverlayEl.value || !mobileNavEl.value) {
    mobileOpen.value = false
    document.body.style.overflow = ''
    return
  }

  const links = mobileNavEl.value.querySelectorAll('.mobile-link-inner')
  menuTl?.kill()

  menuTl = gsap.timeline({
    onComplete: () => {
      mobileOpen.value = false
      document.body.style.overflow = ''
      hamburgerEl.value?.focus()
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

function trapFocus(e: KeyboardEvent): void {
  if (!mobileOverlayEl.value) return

  const focusableElements = [
    ...Array.from(mobileOverlayEl.value.querySelectorAll<HTMLElement>('a[href], button')),
    hamburgerEl.value,
  ].filter((el): el is HTMLElement => el !== null)

  if (focusableElements.length === 0) return

  const firstEl = focusableElements[0]
  const lastEl = focusableElements[focusableElements.length - 1]

  if (e.shiftKey && document.activeElement === firstEl) {
    e.preventDefault()
    lastEl.focus()
  } else if (!e.shiftKey && document.activeElement === lastEl) {
    e.preventDefault()
    firstEl.focus()
  }
}

function handleKeydown(e: KeyboardEvent): void {
  if (!mobileOpen.value) return

  if (e.key === 'Escape') {
    closeMobileMenu()
    return
  }

  if (e.key === 'Tab') {
    trapFocus(e)
  }
}

function toggleMobile(): void {
  if (mobileOpen.value) {
    closeMobileMenu()
  } else {
    openMobileMenu()
  }
}

let lastScrollY = 0
let lastDirectionY = 0
let scrollingDown = false

function handleScroll(): void {
  const y = window.scrollY
  scrolled.value = y > 80

  const delta = y - lastScrollY
  const isDown = delta > 0

  // When direction changes, reset the anchor point
  if (isDown !== scrollingDown) {
    lastDirectionY = lastScrollY
    scrollingDown = isDown
  }

  const distanceInDirection = Math.abs(y - lastDirectionY)

  if (mobileOpen.value) {
    // Never hide while mobile menu is open
  } else if (y <= 200) {
    navHidden.value = false
  } else if (!isDown && distanceInDirection > 5) {
    // Show immediately on any upward scroll
    navHidden.value = false
  } else if (isDown && distanceInDirection > 60) {
    // Hide only after sustained downward scroll
    navHidden.value = true
  }

  lastScrollY = y
}

function moveNavPill(sectionId: string): void {
  if (!desktopNavEl.value || !navPillEl.value) return
  const link = desktopNavEl.value.querySelector(`[data-nav="${sectionId}"]`) as HTMLElement | null
  if (!link) return

  const navRect = desktopNavEl.value.getBoundingClientRect()
  const linkRect = link.getBoundingClientRect()

  gsap.to(navPillEl.value, {
    x: linkRect.left - navRect.left,
    width: linkRect.width,
    duration: 0.4,
    ease: 'power3.out',
    overwrite: 'auto',
  })
}

watch(activeSection, (newSection) => {
  if (newSection) {
    moveNavPill(newSection)
  }
})

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
  window.addEventListener('keydown', handleKeydown)
  handleScroll()
  nextTick(() => {
    if (activeSection.value) moveNavPill(activeSection.value)
  })
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  window.removeEventListener('keydown', handleKeydown)
  menuTl?.kill()
  // Ensure body scroll is restored if menu was open during unmount
  document.body.style.overflow = ''
})
</script>
