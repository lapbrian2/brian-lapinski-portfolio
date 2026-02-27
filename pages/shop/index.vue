<template>
  <div class="min-h-screen bg-dark-900 vignette grain-overlay overflow-x-hidden">
    <!-- Header -->
    <header class="fixed top-0 left-0 right-0 z-50 px-6 md:px-12 py-5 backdrop-blur-md bg-dark-900/70">
      <div class="flex items-center justify-between">
        <NuxtLink
          to="/#work"
          class="inline-flex items-center gap-2 text-lavender-300 hover:text-white transition-colors group"
        >
          <svg class="w-5 h-5 transition-transform group-hover:-translate-x-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="m12 19-7-7 7-7" />
            <path d="M19 12H5" />
          </svg>
          <span class="font-body text-sm">Back to Gallery</span>
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
          Limited Edition Prints
        </p>
        <div class="w-12 h-px bg-accent-red/40 mx-auto mb-6" />
        <h1 class="font-display text-hero font-bold text-lavender-100 leading-none mb-6">
          Print Shop
        </h1>
        <p class="font-body text-lg text-lavender-300 max-w-xl mx-auto">
          Museum-quality prints of original AI artworks. Each piece is produced on archival materials and ships worldwide.
        </p>
      </div>
    </section>

    <!-- Loading -->
    <div v-if="pending" class="flex flex-col items-center justify-center py-20 gap-4">
      <div class="loading-dots"><span /><span /><span /></div>
      <div class="text-lavender-400 font-body text-sm">Loading prints...</div>
    </div>

    <!-- Empty State -->
    <div v-else-if="!products || products.length === 0" class="flex flex-col items-center justify-center py-20 px-6 text-center">
      <h2 class="font-display text-2xl font-bold text-lavender-100 mb-4">No Prints Available</h2>
      <p class="font-body text-lavender-400 mb-8">Check back soon for new releases.</p>
      <NuxtLink
        to="/#work"
        class="inline-flex items-center gap-2 px-6 py-3 bg-accent-red hover:bg-accent-red-hover text-white text-sm font-medium rounded-sm transition-colors"
      >
        Browse Gallery
      </NuxtLink>
    </div>

    <!-- Products Grid -->
    <section v-else ref="gridEl" class="pb-24 px-6 md:px-12">
      <div class="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <NuxtLink
          v-for="product in products"
          :key="product.id"
          :to="`/shop/${product.id}`"
          class="group relative bg-dark-800 rounded-sm overflow-hidden border border-white/[0.04] hover:border-white/[0.1] transition-all duration-300"
        >
          <!-- Image -->
          <div class="aspect-square overflow-hidden">
            <img
              v-if="product.artworkSrc"
              :src="product.artworkSrc"
              :alt="product.artworkTitle || 'Print'"
              class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
            <div v-else class="w-full h-full bg-dark-700 flex items-center justify-center">
              <span class="text-lavender-500 font-body text-sm">No image</span>
            </div>
          </div>

          <!-- Info -->
          <div class="p-5">
            <h3 class="font-display text-base font-semibold text-lavender-100 mb-1 group-hover:text-white transition-colors">
              {{ product.artworkTitle || 'Untitled' }}
            </h3>
            <p v-if="lowestPrice(product)" class="font-body text-sm text-lavender-400">
              From {{ formatPrice(lowestPrice(product)!) }}
            </p>
          </div>

          <!-- Hover accent -->
          <div class="absolute bottom-0 left-0 right-0 h-px bg-accent-red scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
        </NuxtLink>
      </div>
    </section>

    <AppFooter />
    <ClientOnly>
      <CartDrawer />
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import type { PrintProduct } from '~/types/shop'
import { formatPrice } from '~/types/shop'

definePageMeta({ layout: false })

const cart = useCart()

const { data: productsData, pending } = useFetch<{ data: PrintProduct[] }>('/api/shop/products')

const products = computed(() => productsData.value?.data ?? [])

const heroEl = ref<HTMLElement | null>(null)
const gridEl = ref<HTMLElement | null>(null)
let ctx: gsap.Context | null = null

function lowestPrice(product: PrintProduct): number | null {
  if (!product.variants || product.variants.length === 0) return null
  return Math.min(...product.variants.filter(v => v.active).map(v => v.price))
}

// Entrance animations
onMounted(() => {
  if (typeof window === 'undefined') return
  gsap.registerPlugin(ScrollTrigger)

  ctx = gsap.context(() => {
    // Hero stagger reveal
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

    // Grid cards stagger on scroll
    if (gridEl.value) {
      const cards = gridEl.value.querySelectorAll('a')
      if (cards.length) {
        gsap.set(cards, { y: 30, opacity: 0 })
        ScrollTrigger.create({
          trigger: gridEl.value,
          start: 'top 85%',
          once: true,
          onEnter: () => {
            gsap.to(cards, {
              y: 0,
              opacity: 1,
              duration: 0.6,
              stagger: 0.1,
              ease: 'power3.out',
            })
          },
        })
      }
    }
  })
})

onUnmounted(() => {
  ctx?.revert()
})

useHead({
  title: 'Print Shop | Brian Lapinski',
  meta: [
    { name: 'description', content: 'Limited edition museum-quality prints of original AI artworks by Brian Lapinski.' },
    { property: 'og:title', content: 'Print Shop — Brian Lapinski' },
    { property: 'og:description', content: 'Limited edition museum-quality prints of original AI artworks.' },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary_large_image' },
  ],
})
</script>
