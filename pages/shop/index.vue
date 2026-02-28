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

        <div class="flex items-center gap-6">
          <button
            class="relative text-lavender-300 hover:text-white transition-colors"
            aria-label="Open cart"
            @click="cart.toggle()"
          >
            <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="8" cy="21" r="1" /><circle cx="19" cy="21" r="1" />
              <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
            </svg>
            <span
              v-if="cart.itemCount.value > 0"
              class="absolute -top-1.5 -right-1.5 w-4 h-4 bg-accent-red text-white text-[10px] font-bold rounded-full flex items-center justify-center"
            >
              {{ cart.itemCount.value }}
            </span>
          </button>
          <NuxtLink to="/" class="font-display text-lg font-bold text-lavender-100 hover:text-white transition-colors">
            BL
          </NuxtLink>
        </div>
      </div>
    </header>

    <!-- Hero -->
    <section class="pt-32 pb-12 px-6 md:px-12">
      <div ref="heroEl" class="max-w-5xl mx-auto text-center">
        <p class="font-body text-xs uppercase tracking-[0.3em] text-accent-red mb-4">
          Limited Editions
        </p>
        <div class="w-12 h-px bg-accent-red/40 mx-auto mb-6" />
        <h1 ref="titleEl" class="font-display text-hero font-bold text-lavender-100 leading-none mb-6" style="perspective: 400px">
          Print Shop
        </h1>
        <p class="font-body text-lg text-lavender-300 max-w-xl mx-auto">
          Original AI artworks available as museum-quality prints and high-resolution digital downloads.
        </p>
      </div>
    </section>

    <!-- Loading -->
    <div v-if="pending" class="flex flex-col items-center justify-center py-20 gap-4">
      <div class="loading-dots"><span /><span /><span /></div>
      <div class="text-lavender-400 font-body text-sm">Loading prints...</div>
    </div>

    <!-- Product Grid -->
    <section v-else-if="products.length > 0" ref="gridEl" class="px-6 md:px-12 pb-16">
      <div class="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-3 gap-5 md:gap-6">
        <NuxtLink
          v-for="product in products"
          :key="product.id"
          :to="`/shop/${product.id}`"
          class="product-card group relative overflow-hidden rounded-sm bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] transition-all duration-300"
        >
          <div class="aspect-square overflow-hidden">
            <NuxtImg
              v-if="product.artworkSrc"
              :src="product.artworkSrc"
              :alt="product.artworkTitle || 'Print'"
              class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
              placeholder
              sizes="sm:50vw md:33vw"
            />
            <div v-else class="w-full h-full bg-dark-700 flex items-center justify-center">
              <span class="text-lavender-500 font-body text-xs">No image</span>
            </div>
          </div>
          <div class="p-4">
            <h3 class="font-display text-sm md:text-base font-semibold text-lavender-100 group-hover:text-white transition-colors line-clamp-1">
              {{ product.artworkTitle || 'Untitled' }}
            </h3>
            <p class="font-body text-xs md:text-sm text-lavender-400 mt-1">
              From {{ formatStartingPrice(product.variants) }}
            </p>
          </div>
          <!-- Accent line on hover -->
          <div class="absolute bottom-0 left-0 right-0 h-[2px] bg-accent-red/40 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-out" />
        </NuxtLink>
      </div>
    </section>

    <!-- Empty State: Shop Opening Soon -->
    <template v-else>
      <section ref="cardsEl" class="px-6 md:px-12 pb-16">
        <div class="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Prints Card -->
          <div class="offering-card glass rounded-lg p-8 relative overflow-hidden group">
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
            <ul class="space-y-3">
              <li class="flex items-center gap-3">
                <svg class="w-4 h-4 text-accent-red/60 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                <span class="font-body text-sm text-lavender-400">Archival inks rated 100+ years</span>
              </li>
              <li class="flex items-center gap-3">
                <svg class="w-4 h-4 text-accent-red/60 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                <span class="font-body text-sm text-lavender-400">Certificate of authenticity</span>
              </li>
              <li class="flex items-center gap-3">
                <svg class="w-4 h-4 text-accent-red/60 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                <span class="font-body text-sm text-lavender-400">Worldwide shipping with tracking</span>
              </li>
            </ul>
            <div class="absolute bottom-0 left-0 right-0 h-[2px] bg-accent-red/30 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-out" />
          </div>

          <!-- High-Res Downloads Card -->
          <div class="offering-card glass rounded-lg p-8 relative overflow-hidden group">
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
            <ul class="space-y-3">
              <li class="flex items-center gap-3">
                <svg class="w-4 h-4 text-accent-blue/60 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                <span class="font-body text-sm text-lavender-400">Up to 8K resolution</span>
              </li>
              <li class="flex items-center gap-3">
                <svg class="w-4 h-4 text-accent-blue/60 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                <span class="font-body text-sm text-lavender-400">Personal & commercial license</span>
              </li>
              <li class="flex items-center gap-3">
                <svg class="w-4 h-4 text-accent-blue/60 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                <span class="font-body text-sm text-lavender-400">Instant digital delivery</span>
              </li>
            </ul>
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

          <form v-if="!notifySubmitted" class="flex gap-3 max-w-md mx-auto" @submit.prevent="handleNotify">
            <div class="relative flex-1">
              <input
                v-model="notifyEmail"
                type="email"
                required
                placeholder="your@email.com"
                aria-label="Email address for shop notifications"
                class="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-sm font-body text-sm text-lavender-200 placeholder:text-lavender-500/40 focus:border-accent-red/40 focus:outline-none transition-colors duration-300"
              />
            </div>
            <button
              type="submit"
              :disabled="notifyLoading"
              class="btn-press px-6 py-3 bg-accent-red hover:bg-accent-red-hover text-white text-sm font-medium rounded-sm transition-colors duration-200 flex-shrink-0 disabled:opacity-50"
            >
              {{ notifyLoading ? 'Sending...' : 'Notify Me' }}
            </button>
          </form>
          <div v-else class="max-w-md mx-auto text-center py-3">
            <p class="font-body text-sm text-emerald-400 flex items-center justify-center gap-2">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3.5 8.5L6.5 11.5L12.5 4.5" />
              </svg>
              You're on the list! We'll email you when the shop opens.
            </p>
          </div>
        </div>
      </section>
    </template>

    <AppFooter />
    <ClientOnly>
      <CartDrawer />
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useReducedMotion } from '~/composables/useMediaQuery'
import type { PrintProduct, PrintVariant } from '~/types/shop'
import { formatPrice } from '~/types/shop'

definePageMeta({ layout: false })

const cart = useCart()

// Fetch products
const { data: productsData, pending } = useFetch<{ data: PrintProduct[] }>('/api/shop/products', {
  key: 'shop-products',
})

const products = computed<PrintProduct[]>(() => {
  if (!productsData.value?.data) return []
  // Only show products that have at least one active variant
  return productsData.value.data.filter(
    p => p.active && p.variants && p.variants.some(v => v.active),
  )
})

function formatStartingPrice(variants?: PrintVariant[]): string {
  if (!variants || variants.length === 0) return formatPrice(0)
  const activeVariants = variants.filter(v => v.active)
  if (activeVariants.length === 0) return formatPrice(0)
  const minPrice = Math.min(...activeVariants.map(v => v.price))
  return formatPrice(minPrice)
}

// Notify form (for empty state)
const notifyEmail = ref('')
const notifyLoading = ref(false)
const notifySubmitted = ref(false)

async function handleNotify() {
  if (!notifyEmail.value) return
  notifyLoading.value = true
  try {
    await $fetch('/api/newsletter/subscribe', {
      method: 'POST',
      body: { email: notifyEmail.value },
    })
    notifySubmitted.value = true
  } catch {
    notifySubmitted.value = true
  } finally {
    notifyLoading.value = false
  }
}

// GSAP animations
const heroEl = ref<HTMLElement | null>(null)
const titleEl = ref<HTMLElement | null>(null)
const gridEl = ref<HTMLElement | null>(null)
const cardsEl = ref<HTMLElement | null>(null)
const notifyEl = ref<HTMLElement | null>(null)
const reducedMotion = useReducedMotion()
let ctx: gsap.Context | null = null

onMounted(async () => {
  if (typeof window === 'undefined') return
  gsap.registerPlugin(ScrollTrigger)

  if (reducedMotion.value) return

  const { default: Splitting } = await import('splitting')

  ctx = gsap.context(() => {
    // Hero supporting elements
    if (heroEl.value && titleEl.value) {
      const others = Array.from(heroEl.value.children).filter(el => el !== titleEl.value)
      gsap.from(others, {
        y: 40,
        opacity: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: 'power3.out',
        delay: 0.2,
      })

      // Title chars
      const result = Splitting({ target: titleEl.value, by: 'chars' })
      const chars = result[0]?.chars || []
      if (chars.length) {
        gsap.set(chars, { opacity: 0, y: 30, rotateX: -50 })
        gsap.to(chars, {
          opacity: 1,
          y: 0,
          rotateX: 0,
          duration: 0.8,
          stagger: { each: 0.04, from: 'center' },
          delay: 0.3,
          ease: 'power3.out',
          force3D: true,
          onComplete() {
            this.targets().forEach((el: HTMLElement) =>
              gsap.set(el, { clearProps: 'transform,willChange,force3D' }),
            )
          },
        })
      }
    }

    // Product grid: staggered entrance
    if (gridEl.value) {
      const cards = gridEl.value.querySelectorAll('.product-card')
      if (cards.length) {
        gsap.set(cards, { opacity: 0, y: 40, scale: 0.95 })
        ScrollTrigger.create({
          trigger: gridEl.value,
          start: 'top 85%',
          once: true,
          onEnter: () => {
            gsap.to(cards, {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: 0.6,
              stagger: 0.1,
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
    }

    // Empty state: offering cards stagger
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
  title: 'Print Shop | Brian Lapinski',
  meta: [
    { name: 'description', content: 'Limited edition prints and high-resolution digital downloads of original AI artworks by Brian Lapinski.' },
    { property: 'og:title', content: 'Print Shop | Brian Lapinski' },
    { property: 'og:description', content: 'Limited edition museum-quality prints and high-resolution downloads of original AI artworks.' },
    { property: 'og:image', content: 'https://lapinski.art/images/artworks/the-threshold.webp' },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: 'Print Shop | Brian Lapinski' },
    { name: 'twitter:description', content: 'Limited edition prints and high-resolution downloads of original AI artworks.' },
    { name: 'twitter:image', content: 'https://lapinski.art/images/artworks/the-threshold.webp' },
  ],
})
</script>

<style scoped>
:deep(.char) {
  display: inline-block;
}
</style>
