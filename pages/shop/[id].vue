<template>
  <div class="min-h-screen bg-dark-900 vignette grain-overlay overflow-x-hidden">
    <!-- Header -->
    <header class="fixed top-0 left-0 right-0 z-50 px-6 md:px-12 py-5 backdrop-blur-md bg-dark-900/70">
      <div class="flex items-center justify-between">
        <NuxtLink
          to="/shop"
          class="inline-flex items-center gap-2 text-lavender-300 hover:text-white transition-colors group"
        >
          <svg class="w-5 h-5 transition-transform group-hover:-translate-x-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="m12 19-7-7 7-7" />
            <path d="M19 12H5" />
          </svg>
          <span class="font-body text-sm">Back to Shop</span>
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

    <!-- Loading -->
    <div v-if="pending" class="flex flex-col items-center justify-center pt-40 pb-20 gap-4">
      <div class="loading-dots"><span /><span /><span /></div>
      <div class="text-lavender-400 font-body text-sm">Loading product...</div>
    </div>

    <!-- Not Found -->
    <div v-else-if="!product" class="flex flex-col items-center justify-center pt-40 pb-20 px-6 text-center">
      <h1 class="font-display text-4xl font-bold text-lavender-100 mb-4">Product Not Found</h1>
      <p class="font-body text-lavender-400 mb-8">This print may no longer be available.</p>
      <NuxtLink
        to="/shop"
        class="inline-flex items-center gap-2 px-6 py-3 bg-accent-red hover:bg-accent-red-hover text-white text-sm font-medium rounded-sm transition-colors"
      >
        Browse Prints
      </NuxtLink>
    </div>

    <!-- Product Detail -->
    <template v-else>
      <section class="pt-32 pb-16 px-6 md:px-12">
        <div class="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          <!-- Image -->
          <div ref="imageEl" class="relative">
            <NuxtImg
              v-if="product.artworkSrc"
              :src="product.artworkSrc"
              :alt="product.artworkTitle || 'Print'"
              class="w-full h-auto rounded-sm"
              loading="eager"
              preload
              sizes="sm:100vw lg:50vw"
              draggable="false"
            />
            <div v-else class="aspect-square bg-dark-700 rounded-sm flex items-center justify-center">
              <span class="text-lavender-500 font-body text-sm">No image available</span>
            </div>
          </div>

          <!-- Details -->
          <div ref="detailsEl" class="flex flex-col justify-center">
            <p class="font-body text-xs uppercase tracking-[0.3em] text-accent-red mb-3">
              Limited Edition Print
            </p>
            <h1 class="font-display text-3xl md:text-4xl font-bold text-lavender-100 mb-6">
              {{ product.artworkTitle || 'Untitled' }}
            </h1>

            <!-- Size Picker -->
            <div v-if="activeVariants.length > 0" class="mb-8">
              <p class="text-[10px] uppercase tracking-[0.2em] text-lavender-400/40 mb-3">Size</p>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="variant in activeVariants"
                  :key="variant.id"
                  class="px-4 py-2.5 rounded-sm border font-body text-sm transition-all duration-200"
                  :class="selectedVariant?.id === variant.id
                    ? 'border-accent-red bg-accent-red/10 text-white'
                    : 'border-white/[0.08] text-lavender-300 hover:border-white/[0.15] hover:text-lavender-100'"
                  @click="selectedVariant = variant"
                >
                  {{ variant.sizeName }}
                  <span class="ml-1 text-xs text-lavender-400">({{ variant.sizeWidth }}&times;{{ variant.sizeHeight }}&Prime;)</span>
                </button>
              </div>
            </div>

            <!-- Material -->
            <div v-if="selectedVariant && materialInfo" class="mb-8">
              <p class="text-[10px] uppercase tracking-[0.2em] text-lavender-400/40 mb-2">Material</p>
              <p class="font-body text-sm text-lavender-200">{{ materialInfo.label }}</p>
              <p class="font-body text-xs text-lavender-400 mt-1">{{ materialInfo.description }}</p>
            </div>

            <!-- Price -->
            <div v-if="selectedVariant" class="mb-8">
              <p class="text-[10px] uppercase tracking-[0.2em] text-lavender-400/40 mb-2">Price</p>
              <p class="font-display text-3xl font-bold text-lavender-100">
                {{ formatPrice(selectedVariant.price) }}
              </p>
            </div>

            <!-- Add to Cart -->
            <AddToCartButton
              v-if="selectedVariant"
              :variant="selectedVariant"
              :product="product"
              :artwork-title="product.artworkTitle || 'Untitled'"
              :artwork-src="product.artworkSrc || ''"
            />

            <!-- Details List -->
            <div class="mt-10 pt-8 border-t border-white/[0.06] space-y-3">
              <div class="flex items-start gap-3">
                <svg class="w-4 h-4 text-lavender-400 mt-0.5 shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                <p class="font-body text-sm text-lavender-300">Archival-quality inks rated 100+ years</p>
              </div>
              <div class="flex items-start gap-3">
                <svg class="w-4 h-4 text-lavender-400 mt-0.5 shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                <p class="font-body text-sm text-lavender-300">Worldwide shipping with tracking</p>
              </div>
              <div class="flex items-start gap-3">
                <svg class="w-4 h-4 text-lavender-400 mt-0.5 shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                <p class="font-body text-sm text-lavender-300">Certificate of authenticity included</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Related Prints -->
      <section v-if="relatedProducts.length > 0" ref="relatedEl" class="pb-24 px-6 md:px-12">
        <div class="max-w-5xl mx-auto">
          <h2 class="font-display text-xl font-semibold text-lavender-100 mb-6 text-center">More Prints</h2>
          <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
            <NuxtLink
              v-for="related in relatedProducts"
              :key="related.id"
              :to="`/shop/${related.id}`"
              class="group relative overflow-hidden rounded-sm aspect-square"
            >
              <NuxtImg
                v-if="related.artworkSrc"
                :src="related.artworkSrc"
                :alt="related.artworkTitle || 'Print'"
                class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
                placeholder
                sizes="sm:50vw md:33vw"
              />
              <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                <span class="font-display text-sm font-semibold text-white">{{ related.artworkTitle }}</span>
              </div>
            </NuxtLink>
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
import type { PrintProduct, PrintVariant, MaterialType } from '~/types/shop'
import { formatPrice, MATERIALS } from '~/types/shop'

definePageMeta({ layout: false })

const route = useRoute()
const cart = useCart()
const productId = computed(() => route.params.id as string)
const imageEl = ref<HTMLElement | null>(null)
const detailsEl = ref<HTMLElement | null>(null)
const relatedEl = ref<HTMLElement | null>(null)

const { data: productData, pending } = useFetch<{ data: PrintProduct }>(
  () => `/api/shop/products/${productId.value}`,
  { key: `product-${productId.value}` },
)

const product = computed<PrintProduct | null>(() => productData.value?.data ?? null)

const activeVariants = computed<PrintVariant[]>(() => {
  if (!product.value?.variants) return []
  return product.value.variants.filter(v => v.active)
})

const selectedVariant = ref<PrintVariant | null>(null)

// Select first variant when product loads
watch(activeVariants, (variants) => {
  if (variants.length > 0 && !selectedVariant.value) {
    selectedVariant.value = variants[0]
  }
}, { immediate: true })

const materialInfo = computed(() => {
  if (!selectedVariant.value) return null
  const key = selectedVariant.value.material as MaterialType
  return MATERIALS[key] ?? { label: selectedVariant.value.material, description: '' }
})

// Related products
const { data: allProductsData } = useFetch<{ data: PrintProduct[] }>('/api/shop/products')

const relatedProducts = computed(() => {
  if (!allProductsData.value?.data || !product.value) return []
  return allProductsData.value.data
    .filter(p => p.id !== product.value!.id && p.active)
    .slice(0, 3)
})

// GSAP entrance animations
let ctx: gsap.Context | null = null

onMounted(() => {
  if (typeof window === 'undefined') return
  gsap.registerPlugin(ScrollTrigger)

  ctx = gsap.context(() => {
    // Image: fade + subtle scale
    if (imageEl.value) {
      gsap.set(imageEl.value, { opacity: 0, scale: 0.97 })
      gsap.to(imageEl.value, {
        opacity: 1,
        scale: 1,
        duration: 0.8,
        delay: 0.2,
        ease: 'power3.out',
        force3D: true,
        onComplete() {
          gsap.set(this.targets()[0], { clearProps: 'transform,willChange,force3D' })
        },
      })
    }

    // Details: staggered children
    if (detailsEl.value) {
      const children = detailsEl.value.children
      gsap.set(children, { opacity: 0, y: 25 })
      gsap.to(children, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.08,
        delay: 0.35,
        ease: 'power3.out',
        force3D: true,
        onComplete() {
          this.targets().forEach((el: HTMLElement) => gsap.set(el, { clearProps: 'transform,willChange,force3D' }))
        },
      })
    }

    // Related prints: stagger on scroll
    if (relatedEl.value) {
      const cards = relatedEl.value.querySelectorAll('a')
      if (cards.length) {
        gsap.set(cards, { opacity: 0, y: 40, scale: 0.95 })
        ScrollTrigger.create({
          trigger: relatedEl.value,
          start: 'top 85%',
          once: true,
          onEnter: () => {
            gsap.to(cards, {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: 0.6,
              stagger: 0.12,
              ease: 'power3.out',
              force3D: true,
              onComplete() {
                this.targets().forEach((el: HTMLElement) => gsap.set(el, { clearProps: 'transform,willChange,force3D' }))
              },
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

// SEO
useHead({
  title: computed(() =>
    product.value
      ? `${product.value.artworkTitle} Print | Brian Lapinski`
      : 'Print | Brian Lapinski',
  ),
  meta: computed(() => {
    if (!product.value) return []
    return [
      { name: 'description', content: `Limited edition print of "${product.value.artworkTitle}" by Brian Lapinski.` },
      { property: 'og:title', content: `${product.value.artworkTitle} Print — Brian Lapinski` },
      { property: 'og:description', content: `Limited edition museum-quality print of "${product.value.artworkTitle}".` },
      { property: 'og:image', content: product.value.artworkSrc || '' },
      { property: 'og:type', content: 'product' },
      { name: 'twitter:card', content: 'summary_large_image' },
    ]
  }),
})
</script>
