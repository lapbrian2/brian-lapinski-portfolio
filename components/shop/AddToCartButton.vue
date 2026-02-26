<template>
  <button
    ref="btnEl"
    class="w-full py-4 bg-accent-red hover:bg-accent-red-hover text-white font-display font-semibold text-sm uppercase tracking-wider rounded-sm transition-colors"
    :disabled="added"
    @click="handleAdd"
  >
    {{ added ? 'Added to Cart' : 'Add to Cart' }}
  </button>
</template>

<script setup lang="ts">
import gsap from 'gsap'
import type { PrintProduct, PrintVariant } from '~/types/shop'

const props = defineProps<{
  variant: PrintVariant
  product: PrintProduct
  artworkTitle: string
  artworkSrc: string
}>()

const cart = useCart()
const btnEl = ref<HTMLElement | null>(null)
const added = ref(false)

function handleAdd() {
  cart.addItem({
    variantId: props.variant.id,
    productId: props.product.id,
    artworkId: props.product.artworkId,
    artworkTitle: props.artworkTitle,
    artworkSrc: props.artworkSrc,
    sizeName: props.variant.sizeName,
    material: props.variant.material,
    price: props.variant.price,
  })

  added.value = true

  // GSAP pulse animation
  if (btnEl.value) {
    gsap.fromTo(
      btnEl.value,
      { scale: 1 },
      {
        scale: 1.05,
        duration: 0.15,
        ease: 'power2.out',
        yoyo: true,
        repeat: 1,
      },
    )
  }

  // Reset label after delay
  setTimeout(() => {
    added.value = false
  }, 1500)
}
</script>
