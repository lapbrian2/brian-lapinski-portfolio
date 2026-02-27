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

        <NuxtLink to="/" class="font-display text-lg font-bold text-lavender-100 hover:text-white transition-colors">
          BL
        </NuxtLink>
      </div>
    </header>

    <section class="pt-40 pb-24 px-6 md:px-12">
      <div ref="contentEl" class="max-w-2xl mx-auto text-center">
        <!-- Success Icon -->
        <div class="w-20 h-20 rounded-full border-2 border-emerald-500/30 bg-emerald-500/10 flex items-center justify-center mx-auto mb-8">
          <svg class="w-10 h-10 text-emerald-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </div>

        <h1 class="font-display text-3xl md:text-5xl font-bold text-lavender-100 mb-4">
          Thank You
        </h1>
        <p class="font-body text-lg text-lavender-300 mb-4">
          Your order has been confirmed.
        </p>
        <p class="font-body text-sm text-lavender-400 mb-2">
          A confirmation email will arrive shortly with tracking details once your print ships.
        </p>

        <!-- Session Reference -->
        <div v-if="sessionId" class="mt-8 mb-12 p-4 bg-dark-800 rounded-sm border border-white/[0.04]">
          <p class="text-[10px] uppercase tracking-[0.2em] text-lavender-400/40 mb-2">Order Reference</p>
          <p class="font-mono text-xs text-lavender-300 break-all">{{ sessionId }}</p>
        </div>

        <!-- Actions -->
        <div class="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
          <NuxtLink
            to="/gallery"
            class="inline-flex items-center gap-2 px-6 py-3 bg-accent-red hover:bg-accent-red-hover text-white text-sm font-medium rounded-sm transition-colors"
          >
            Browse Gallery
          </NuxtLink>
          <NuxtLink
            to="/"
            class="inline-flex items-center gap-2 px-6 py-3 border border-white/[0.08] text-lavender-300 hover:text-white hover:border-white/[0.15] text-sm font-medium rounded-sm transition-colors"
          >
            Return Home
          </NuxtLink>
        </div>
      </div>
    </section>

    <AppFooter />
  </div>
</template>

<script setup lang="ts">
import gsap from 'gsap'

definePageMeta({ layout: false })

const route = useRoute()
const sessionId = computed(() => route.query.session_id as string | undefined)

// Clear cart on success page load
const cart = useCart()
const contentEl = ref<HTMLElement | null>(null)

onMounted(() => {
  // Only clear cart if we arrived via Stripe redirect (has session_id)
  if (sessionId.value) {
    cart.clearCart()
  }

  // Entrance animation
  if (contentEl.value) {
    gsap.from(contentEl.value.children, {
      y: 30,
      opacity: 0,
      duration: 0.7,
      stagger: 0.1,
      ease: 'power3.out',
      delay: 0.15,
    })
  }
})

useHead({
  title: 'Order Confirmed | Brian Lapinski',
  meta: [
    { name: 'description', content: 'Your print order has been confirmed. Thank you for supporting the art.' },
    { name: 'robots', content: 'noindex' },
  ],
})
</script>
