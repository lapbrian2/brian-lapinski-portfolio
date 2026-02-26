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
          <span class="font-body text-sm">Continue Shopping</span>
        </NuxtLink>

        <NuxtLink to="/" class="font-display text-lg font-bold text-lavender-100 hover:text-white transition-colors">
          BL
        </NuxtLink>
      </div>
    </header>

    <section class="pt-32 pb-24 px-6 md:px-12">
      <div class="max-w-4xl mx-auto">
        <h1 class="font-display text-3xl md:text-4xl font-bold text-lavender-100 mb-12 text-center">
          Your Cart
        </h1>

        <!-- Empty Cart -->
        <div v-if="cart.items.value.length === 0" class="text-center py-16">
          <svg class="w-16 h-16 text-lavender-400/30 mx-auto mb-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="8" cy="21" r="1" /><circle cx="19" cy="21" r="1" />
            <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
          </svg>
          <p class="font-body text-lg text-lavender-400 mb-8">Your cart is empty.</p>
          <NuxtLink
            to="/shop"
            class="inline-flex items-center gap-2 px-6 py-3 bg-accent-red hover:bg-accent-red-hover text-white text-sm font-medium rounded-lg transition-colors"
          >
            Browse Prints
          </NuxtLink>
        </div>

        <!-- Cart Items -->
        <template v-else>
          <div class="space-y-6 mb-12">
            <div
              v-for="item in cart.items.value"
              :key="item.variantId"
              class="flex gap-4 md:gap-6 p-4 bg-dark-800 rounded-sm border border-white/[0.04]"
            >
              <!-- Thumbnail -->
              <NuxtLink :to="`/shop/${item.productId}`" class="shrink-0">
                <NuxtImg
                  v-if="item.artworkSrc"
                  :src="item.artworkSrc"
                  :alt="item.artworkTitle"
                  width="120"
                  height="120"
                  class="w-20 h-20 md:w-24 md:h-24 object-cover rounded-sm"
                  loading="lazy"
                />
              </NuxtLink>

              <!-- Details -->
              <div class="flex-1 min-w-0">
                <h3 class="font-display text-sm md:text-base font-semibold text-lavender-100 truncate">
                  {{ item.artworkTitle }}
                </h3>
                <p class="font-body text-xs text-lavender-400 mt-1">
                  {{ item.sizeName }} &middot; {{ item.material }}
                </p>
                <p class="font-display text-sm font-bold text-lavender-200 mt-2">
                  {{ formatPrice(item.price) }}
                </p>

                <!-- Quantity -->
                <div class="flex items-center gap-3 mt-3">
                  <button
                    class="w-7 h-7 rounded-sm border border-white/[0.08] text-lavender-300 hover:text-white hover:border-white/[0.2] flex items-center justify-center transition-colors text-sm"
                    aria-label="Decrease quantity"
                    @click="cart.updateQuantity(item.variantId, item.quantity - 1)"
                  >
                    &minus;
                  </button>
                  <span class="font-body text-sm text-lavender-200 w-6 text-center">{{ item.quantity }}</span>
                  <button
                    class="w-7 h-7 rounded-sm border border-white/[0.08] text-lavender-300 hover:text-white hover:border-white/[0.2] flex items-center justify-center transition-colors text-sm"
                    aria-label="Increase quantity"
                    @click="cart.updateQuantity(item.variantId, item.quantity + 1)"
                  >
                    +
                  </button>
                </div>
              </div>

              <!-- Line Total & Remove -->
              <div class="flex flex-col items-end justify-between shrink-0">
                <button
                  class="text-lavender-500 hover:text-accent-red transition-colors"
                  aria-label="Remove item"
                  @click="cart.removeItem(item.variantId)"
                >
                  <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M18 6 6 18" /><path d="m6 6 12 12" />
                  </svg>
                </button>
                <p class="font-display text-sm font-bold text-lavender-100">
                  {{ formatPrice(item.price * item.quantity) }}
                </p>
              </div>
            </div>
          </div>

          <!-- Summary -->
          <div class="border-t border-white/[0.06] pt-8">
            <div class="flex items-center justify-between mb-8">
              <span class="font-body text-sm text-lavender-400">
                Subtotal ({{ cart.itemCount.value }} {{ cart.itemCount.value === 1 ? 'item' : 'items' }})
              </span>
              <span class="font-display text-2xl font-bold text-lavender-100">
                {{ formatPrice(cart.subtotal.value) }}
              </span>
            </div>
            <p class="font-body text-xs text-lavender-500 mb-6 text-right">
              Shipping calculated at checkout
            </p>
            <button
              class="w-full py-4 bg-accent-red hover:bg-accent-red-hover text-white font-display font-semibold text-sm uppercase tracking-wider rounded-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              :disabled="checkoutLoading"
              @click="handleCheckout"
            >
              {{ checkoutLoading ? 'Redirecting...' : 'Proceed to Checkout' }}
            </button>
            <p v-if="checkoutError" class="font-body text-xs text-accent-red mt-3 text-center">
              {{ checkoutError }}
            </p>
          </div>
        </template>
      </div>
    </section>

    <AppFooter />
  </div>
</template>

<script setup lang="ts">
import { formatPrice } from '~/types/shop'

definePageMeta({ layout: false })

const cart = useCart()
const checkoutLoading = ref(false)
const checkoutError = ref('')

async function handleCheckout() {
  checkoutLoading.value = true
  checkoutError.value = ''

  try {
    const items = cart.items.value.map(item => ({
      variantId: item.variantId,
      quantity: item.quantity,
    }))

    const res = await $fetch<{ success: boolean; url: string }>('/api/checkout/create-session', {
      method: 'POST',
      body: { items },
    })

    if (!res?.url) {
      checkoutError.value = 'Unable to create checkout session. Please try again.'
      return
    }

    // Redirect to Stripe Checkout
    window.location.href = res.url
  } catch {
    checkoutError.value = 'Something went wrong. Please try again.'
  } finally {
    checkoutLoading.value = false
  }
}

useHead({
  title: 'Cart | Brian Lapinski',
  meta: [
    { name: 'description', content: 'Your shopping cart — Brian Lapinski Print Shop.' },
  ],
})
</script>
