<template>
  <div class="min-h-screen bg-dark-900 vignette grain-overlay overflow-x-hidden">
    <!-- Header -->
    <header class="fixed top-0 left-0 right-0 z-50 px-6 md:px-12 py-5 backdrop-blur-md bg-dark-900/70">
      <div class="flex items-center justify-between">
        <NuxtLink
          to="/"
          class="inline-flex items-center gap-2 text-lavender-300 hover:text-white transition-colors group"
        >
          <svg class="w-5 h-5 transition-transform group-hover:-translate-x-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="m12 19-7-7 7-7" />
            <path d="M19 12H5" />
          </svg>
          <span class="font-body text-sm">Back to Home</span>
        </NuxtLink>

        <NuxtLink to="/" class="font-display text-lg font-bold text-lavender-100 hover:text-white transition-colors">
          BL
        </NuxtLink>
      </div>
    </header>

    <!-- Hero -->
    <section class="pt-32 pb-12 px-6 md:px-12">
      <div ref="heroEl" class="max-w-5xl mx-auto text-center">
        <p class="font-body text-xs uppercase tracking-[0.3em] text-accent-red mb-4">
          Coming Soon
        </p>
        <div class="w-12 h-px bg-accent-red/40 mx-auto mb-6" />
        <h1 class="font-display text-hero font-bold text-lavender-100 leading-none mb-6">
          Print Shop
        </h1>
        <p class="font-body text-lg text-lavender-300 max-w-xl mx-auto">
          Original AI artworks available as museum-quality prints and high-resolution digital downloads.
        </p>
      </div>
    </section>

    <!-- Offering Cards -->
    <section ref="cardsEl" class="px-6 md:px-12 pb-16">
      <div class="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Prints Card -->
        <div class="offering-card glass rounded-lg p-8 relative overflow-hidden group">
          <!-- Icon -->
          <div class="w-14 h-14 rounded-full bg-accent-red/10 border border-accent-red/20 flex items-center justify-center mb-6">
            <svg class="w-6 h-6 text-accent-red" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <rect x="7" y="7" width="10" height="10" rx="1" />
            </svg>
          </div>

          <h2 class="font-display text-2xl font-bold text-lavender-100 mb-3">
            Limited Edition Prints
          </h2>
          <p class="font-body text-sm text-lavender-300 mb-6 leading-relaxed">
            Museum-quality archival prints on fine art paper and canvas. Each edition is numbered and ships with a certificate of authenticity.
          </p>

          <!-- Features -->
          <ul class="space-y-3">
            <li class="flex items-center gap-3">
              <svg class="w-4 h-4 text-accent-red/60 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 6 9 17l-5-5" />
              </svg>
              <span class="font-body text-sm text-lavender-400">Archival inks rated 100+ years</span>
            </li>
            <li class="flex items-center gap-3">
              <svg class="w-4 h-4 text-accent-red/60 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 6 9 17l-5-5" />
              </svg>
              <span class="font-body text-sm text-lavender-400">Certificate of authenticity</span>
            </li>
            <li class="flex items-center gap-3">
              <svg class="w-4 h-4 text-accent-red/60 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 6 9 17l-5-5" />
              </svg>
              <span class="font-body text-sm text-lavender-400">Worldwide shipping with tracking</span>
            </li>
          </ul>

          <!-- Accent line -->
          <div class="absolute bottom-0 left-0 right-0 h-[2px] bg-accent-red/30 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-out" />
        </div>

        <!-- High-Res Downloads Card -->
        <div class="offering-card glass rounded-lg p-8 relative overflow-hidden group">
          <!-- Icon -->
          <div class="w-14 h-14 rounded-full bg-accent-blue/10 border border-accent-blue/20 flex items-center justify-center mb-6">
            <svg class="w-6 h-6 text-accent-blue" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
          </div>

          <h2 class="font-display text-2xl font-bold text-lavender-100 mb-3">
            High-Res Downloads
          </h2>
          <p class="font-body text-sm text-lavender-300 mb-6 leading-relaxed">
            Full-resolution digital files for print-at-home, wallpapers, or creative projects. Delivered instantly after purchase.
          </p>

          <!-- Features -->
          <ul class="space-y-3">
            <li class="flex items-center gap-3">
              <svg class="w-4 h-4 text-accent-blue/60 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 6 9 17l-5-5" />
              </svg>
              <span class="font-body text-sm text-lavender-400">Up to 8K resolution</span>
            </li>
            <li class="flex items-center gap-3">
              <svg class="w-4 h-4 text-accent-blue/60 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 6 9 17l-5-5" />
              </svg>
              <span class="font-body text-sm text-lavender-400">Personal & commercial license</span>
            </li>
            <li class="flex items-center gap-3">
              <svg class="w-4 h-4 text-accent-blue/60 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 6 9 17l-5-5" />
              </svg>
              <span class="font-body text-sm text-lavender-400">Instant digital delivery</span>
            </li>
          </ul>

          <!-- Accent line -->
          <div class="absolute bottom-0 left-0 right-0 h-[2px] bg-accent-blue/30 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-out" />
        </div>
      </div>
    </section>

    <!-- Notify Section -->
    <section ref="notifyEl" class="px-6 md:px-12 pb-24">
      <div class="max-w-lg mx-auto text-center">
        <div class="w-16 h-px bg-accent-red/40 mx-auto mb-8" />
        <p class="font-body text-xs uppercase tracking-[0.25em] text-lavender-400 mb-4">
          Stay Updated
        </p>
        <h3 class="font-display text-2xl font-bold text-lavender-100 mb-4">
          Be the First to Know
        </h3>
        <p class="font-body text-sm text-lavender-400 mb-8">
          Leave your email to get notified when prints and downloads become available.
        </p>

        <!-- Email signup (visual) -->
        <form class="flex gap-3 max-w-md mx-auto" @submit.prevent>
          <div class="relative flex-1">
            <input
              type="email"
              placeholder="your@email.com"
              class="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-sm font-body text-sm text-lavender-200 placeholder:text-lavender-500/40 focus:border-accent-red/40 focus:outline-none transition-colors duration-300"
            />
          </div>
          <button
            type="submit"
            class="btn-press px-6 py-3 bg-accent-red hover:bg-accent-red-hover text-white text-sm font-medium rounded-sm transition-colors duration-200 flex-shrink-0"
          >
            Notify Me
          </button>
        </form>
      </div>
    </section>

    <AppFooter />
  </div>
</template>

<script setup lang="ts">
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

definePageMeta({ layout: false })

const heroEl = ref<HTMLElement | null>(null)
const cardsEl = ref<HTMLElement | null>(null)
const notifyEl = ref<HTMLElement | null>(null)
let ctx: gsap.Context | null = null

onMounted(() => {
  if (typeof window === 'undefined') return
  gsap.registerPlugin(ScrollTrigger)

  ctx = gsap.context(() => {
    // Hero stagger
    if (heroEl.value) {
      gsap.from(heroEl.value.children, {
        y: 40,
        opacity: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: 'power3.out',
        delay: 0.2,
      })
    }

    // Offering cards stagger
    if (cardsEl.value) {
      const cards = cardsEl.value.querySelectorAll('.offering-card')
      gsap.set(cards, { opacity: 0, y: 40 })
      ScrollTrigger.create({
        trigger: cardsEl.value,
        start: 'top 85%',
        once: true,
        onEnter: () => {
          gsap.to(cards, {
            opacity: 1,
            y: 0,
            duration: 0.7,
            stagger: 0.15,
            ease: 'power3.out',
            force3D: true,
            onComplete() {
              this.targets().forEach((el: HTMLElement) =>
                gsap.set(el, { clearProps: 'transform,willChange,force3D' }),
              )
            },
          })
        },
      })
    }

    // Notify section
    if (notifyEl.value) {
      const children = notifyEl.value.querySelectorAll('.max-w-lg > *')
      gsap.set(children, { opacity: 0, y: 25 })
      ScrollTrigger.create({
        trigger: notifyEl.value,
        start: 'top 85%',
        once: true,
        onEnter: () => {
          gsap.to(children, {
            opacity: 1,
            y: 0,
            duration: 0.6,
            stagger: 0.1,
            ease: 'power3.out',
          })
        },
      })
    }
  })
})

onUnmounted(() => {
  ctx?.revert()
})

useHead({
  title: 'Shop — Coming Soon | Brian Lapinski',
  meta: [
    { name: 'description', content: 'Limited edition prints and high-resolution digital downloads of original AI artworks by Brian Lapinski. Coming soon.' },
    { property: 'og:title', content: 'Print Shop — Coming Soon | Brian Lapinski' },
    { property: 'og:description', content: 'Limited edition prints and high-resolution downloads of original AI artworks. Coming soon.' },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary_large_image' },
  ],
})
</script>
