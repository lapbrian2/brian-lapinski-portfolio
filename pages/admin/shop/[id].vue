<template>
  <div class="max-w-3xl">
    <div class="flex items-center gap-4 mb-8">
      <NuxtLink
        to="/admin/shop"
        class="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
      >
        <IconArrowLeft class="w-5 h-5" />
      </NuxtLink>
      <h1 class="text-2xl font-display font-bold text-white">
        {{ loading ? 'Loading...' : `Variants: ${product?.artworkTitle}` }}
      </h1>
    </div>

    <div v-if="loading" class="text-gray-400 text-center py-12">Loading product...</div>
    <div v-else-if="!product" class="text-gray-400 text-center py-12">Product not found.</div>

    <template v-else>
      <!-- Add Variant Form -->
      <div class="bg-gray-900 border border-gray-800 rounded-xl p-5 mb-6">
        <h3 class="text-sm font-medium text-white mb-4">Add Variant</h3>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label class="block text-xs text-gray-400 mb-1">Size Name</label>
            <input v-model="newVariant.sizeName" placeholder="e.g. 8x10" class="admin-input" />
          </div>
          <div>
            <label class="block text-xs text-gray-400 mb-1">Width (in)</label>
            <input v-model.number="newVariant.sizeWidth" type="number" class="admin-input" />
          </div>
          <div>
            <label class="block text-xs text-gray-400 mb-1">Height (in)</label>
            <input v-model.number="newVariant.sizeHeight" type="number" class="admin-input" />
          </div>
          <div>
            <label class="block text-xs text-gray-400 mb-1">Material</label>
            <select v-model="newVariant.material" class="admin-input">
              <option value="fine-art-paper">Fine Art Paper</option>
              <option value="canvas">Canvas</option>
              <option value="metal">Metal</option>
            </select>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-3 mt-3">
          <div>
            <label class="block text-xs text-gray-400 mb-1">Price ($)</label>
            <input v-model.number="newVariantPriceDollars" type="number" step="0.01" placeholder="29.99" class="admin-input" />
          </div>
          <div class="flex items-end">
            <button
              @click="addVariant"
              :disabled="!newVariant.sizeName || !newVariantPriceDollars || addingVariant"
              class="inline-flex items-center gap-1.5 px-4 py-2.5 bg-accent-red hover:bg-accent-red-hover text-white text-xs font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              {{ addingVariant ? 'Adding...' : 'Add Variant' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Existing Variants -->
      <div class="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div class="px-5 py-4 border-b border-gray-800">
          <h2 class="text-lg font-display font-semibold text-white">
            Variants ({{ product.variants?.length || 0 }})
          </h2>
        </div>
        <div v-if="!product.variants?.length" class="text-gray-500 text-center py-8 text-sm">
          No variants yet. Add sizes and materials above.
        </div>
        <div v-else class="divide-y divide-gray-800">
          <div
            v-for="variant in product.variants"
            :key="variant.id"
            class="flex items-center justify-between px-5 py-4"
          >
            <div>
              <span class="text-sm text-white font-medium">{{ variant.sizeName }}</span>
              <span class="text-xs text-gray-400 ml-2">{{ variant.sizeWidth }}&times;{{ variant.sizeHeight }}"</span>
              <span class="text-xs text-gray-500 ml-2 capitalize">{{ variant.material.replace(/-/g, ' ') }}</span>
            </div>
            <div class="flex items-center gap-3">
              <span class="text-sm text-white font-medium">${{ (variant.price / 100).toFixed(2) }}</span>
              <button
                @click="deleteVariant(variant.id)"
                class="p-1.5 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <IconTrash class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })

import type { PrintProduct } from '~/types/shop'

const route = useRoute()
const productId = route.params.id as string

const product = ref<PrintProduct | null>(null)
const loading = ref(true)
const addingVariant = ref(false)

const newVariant = reactive({
  sizeName: '',
  sizeWidth: 0,
  sizeHeight: 0,
  material: 'fine-art-paper',
})
const newVariantPriceDollars = ref<number>(0)

onMounted(async () => {
  await fetchProduct()
})

async function fetchProduct() {
  loading.value = true
  try {
    const res = await $fetch<{ data: PrintProduct }>(`/api/admin/shop/products/${productId}`)
    product.value = res.data
  } catch {
    product.value = null
  } finally {
    loading.value = false
  }
}

async function addVariant() {
  if (!product.value) return
  addingVariant.value = true
  try {
    await $fetch(`/api/admin/shop/products/${productId}`, {
      method: 'PUT',
      body: {
        addVariant: {
          sizeName: newVariant.sizeName,
          sizeWidth: newVariant.sizeWidth,
          sizeHeight: newVariant.sizeHeight,
          material: newVariant.material,
          price: Math.round(newVariantPriceDollars.value * 100),
        },
      },
    })
    newVariant.sizeName = ''
    newVariant.sizeWidth = 0
    newVariant.sizeHeight = 0
    newVariantPriceDollars.value = 0
    await fetchProduct()
  } catch (e) {
    alert(getFetchErrorMessage(e, 'Failed to add variant'))
  } finally {
    addingVariant.value = false
  }
}

async function deleteVariant(variantId: number) {
  if (!confirm('Delete this variant?')) return
  try {
    await $fetch(`/api/admin/shop/products/${productId}`, {
      method: 'PUT',
      body: { deleteVariantId: variantId },
    })
    await fetchProduct()
  } catch (e) {
    alert(getFetchErrorMessage(e, 'Failed to delete variant'))
  }
}
</script>

<style scoped>
.admin-input {
  @apply w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-accent-red focus:ring-1 focus:ring-accent-red transition-colors text-sm;
}
</style>
