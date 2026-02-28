<template>
  <Teleport to="body">
    <!-- Backdrop -->
    <Transition name="backdrop">
      <div
        v-if="cart.isOpen.value"
        class="fixed inset-0 z-[90] bg-black/60 backdrop-blur-sm"
        @click="cart.close()"
      />
    </Transition>

    <!-- Drawer -->
    <div
      ref="drawerEl"
      class="fixed top-0 right-0 bottom-0 z-[95] w-full max-w-md bg-dark-800 border-l border-white/[0.06] flex flex-col translate-x-full"
    >
      <!-- Header -->
      <div class="flex items-center justify-between px-6 py-5 border-b border-white/[0.06]">
        <h2 class="font-display text-lg font-bold text-lavender-100">
          Cart
          <span v-if="cart.itemCount.value > 0" class="text-sm font-normal text-lavender-400 ml-2">
            ({{ cart.itemCount.value }})
          </span>
        </h2>
        <button
          class="w-8 h-8 rounded-sm text-lavender-400 hover:text-white transition-colors flex items-center justify-center"
          aria-label="Close cart"
          @click="cart.close()"
        >
          <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 6 6 18" /><path d="m6 6 12 12" />
          </svg>
        </button>
      </div>

      <!-- Empty State -->
      <div v-if="cart.items.value.length === 0" class="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <svg class="w-12 h-12 text-lavender-400/20 mb-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="8" cy="21" r="1" /><circle cx="19" cy="21" r="1" />
          <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
        </svg>
        <p class="font-body text-sm text-lavender-400">Your cart is empty.</p>
      </div>

      <!-- Items -->
      <div v-else class="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        <div
          v-for="item in cart.items.value"
          :key="item.variantId"
          class="flex gap-3 py-3 border-b border-white/[0.04] last:border-0"
        >
          <!-- Thumbnail -->
          <img
            v-if="item.artworkSrc"
            :src="item.artworkSrc"
            :alt="item.artworkTitle"
            class="w-14 h-14 object-cover rounded-sm shrink-0"
            loading="lazy"
          />

          <!-- Info -->
          <div class="flex-1 min-w-0">
            <p class="font-display text-sm font-semibold text-lavender-100 truncate">
              {{ item.artworkTitle }}
            </p>
            <p class="font-body text-xs text-lavender-400 mt-0.5">
              {{ item.sizeName }} &middot; {{ item.material }}
            </p>
            <div class="flex items-center gap-2 mt-2">
              <button
                class="w-5 h-5 rounded-sm border border-white/[0.08] text-lavender-400 hover:text-white flex items-center justify-center text-xs transition-colors"
                :aria-label="`Decrease quantity of ${item.artworkTitle}`"
                @click="cart.updateQuantity(item.variantId, item.quantity - 1)"
              >
                &minus;
              </button>
              <span class="font-body text-xs text-lavender-200 w-4 text-center">{{ item.quantity }}</span>
              <button
                class="w-5 h-5 rounded-sm border border-white/[0.08] text-lavender-400 hover:text-white flex items-center justify-center text-xs transition-colors"
                :aria-label="`Increase quantity of ${item.artworkTitle}`"
                @click="cart.updateQuantity(item.variantId, item.quantity + 1)"
              >
                +
              </button>
            </div>
          </div>

          <!-- Price & Remove -->
          <div class="flex flex-col items-end justify-between shrink-0">
            <button
              class="text-lavender-500 hover:text-accent-red transition-colors"
              aria-label="Remove item"
              @click="cart.removeItem(item.variantId)"
            >
              <svg class="w-3.5 h-3.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M18 6 6 18" /><path d="m6 6 12 12" />
              </svg>
            </button>
            <p class="font-display text-sm font-bold text-lavender-200">
              {{ formatPrice(item.price * item.quantity) }}
            </p>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div v-if="cart.items.value.length > 0" class="px-6 py-5 border-t border-white/[0.06] space-y-4">
        <div class="flex items-center justify-between">
          <span class="font-body text-sm text-lavender-400">Subtotal</span>
          <span class="font-display text-lg font-bold text-lavender-100">
            {{ formatPrice(cart.subtotal.value) }}
          </span>
        </div>
        <NuxtLink
          to="/cart"
          class="block w-full py-3 text-center border border-white/[0.08] text-lavender-200 hover:text-white hover:border-white/[0.15] font-body text-sm rounded-sm transition-colors"
          @click="cart.close()"
        >
          View Cart
        </NuxtLink>
        <NuxtLink
          to="/cart"
          class="block w-full py-3 text-center bg-accent-red hover:bg-accent-red-hover text-white font-display font-semibold text-sm uppercase tracking-wider rounded-sm transition-colors"
          @click="cart.close()"
        >
          Checkout
        </NuxtLink>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import gsap from 'gsap'
import { formatPrice } from '~/types/shop'

const cart = useCart()
const drawerEl = ref<HTMLElement | null>(null)

watch(() => cart.isOpen.value, (open) => {
  if (!drawerEl.value) return

  if (open) {
    // Lock body scroll when drawer opens (prevents scrolling behind on mobile)
    document.body.style.overflow = 'hidden'
    gsap.to(drawerEl.value, {
      x: 0,
      duration: 0.35,
      ease: 'power3.out',
    })
  } else {
    document.body.style.overflow = ''
    gsap.to(drawerEl.value, {
      x: '100%',
      duration: 0.25,
      ease: 'power3.in',
    })
  }
})

// Close on escape
function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && cart.isOpen.value) {
    cart.close()
  }
}

onMounted(() => {
  document.addEventListener('keydown', onKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', onKeydown)
  // Restore body scroll in case drawer was open when unmounting
  document.body.style.overflow = ''
})
</script>

<style scoped>
.backdrop-enter-active {
  transition: opacity 0.3s ease;
}
.backdrop-leave-active {
  transition: opacity 0.2s ease;
}
.backdrop-enter-from,
.backdrop-leave-to {
  opacity: 0;
}
</style>
