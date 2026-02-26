<template>
  <div class="max-w-4xl">
    <div class="flex items-center justify-between mb-8">
      <h1 class="text-2xl font-display font-bold text-white">Print Shop</h1>
      <button
        @click="showAddForm = true"
        class="inline-flex items-center gap-2 px-4 py-2.5 bg-accent-red hover:bg-accent-red-hover text-white text-sm font-medium rounded-lg transition-colors"
      >
        <IconPlus class="w-4 h-4" />
        New Print Product
      </button>
    </div>

    <div v-if="loading" class="text-gray-400 text-center py-12">Loading products...</div>

    <!-- Add Form -->
    <div v-if="showAddForm" class="bg-gray-900 border border-gray-800 rounded-xl p-5 mb-6">
      <h3 class="text-sm font-medium text-white mb-4">Create Print Product</h3>
      <div class="mb-3">
        <label class="block text-xs text-gray-400 mb-1">Select Artwork</label>
        <select v-model="newProductArtworkId" class="admin-input">
          <option value="">Choose an artwork...</option>
          <option v-for="a in availableArtworks" :key="a.id" :value="a.id">
            {{ a.title }} ({{ a.category }})
          </option>
        </select>
      </div>
      <div class="flex gap-2">
        <button
          @click="createProduct"
          :disabled="!newProductArtworkId || creating"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-accent-red hover:bg-accent-red-hover text-white text-xs font-medium rounded-lg transition-colors disabled:opacity-50"
        >
          {{ creating ? 'Creating...' : 'Create' }}
        </button>
        <button
          @click="showAddForm = false"
          class="px-3 py-1.5 text-xs font-medium text-gray-400 hover:text-white transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>

    <!-- Products List -->
    <div v-if="!loading" class="space-y-4">
      <div v-if="!products.length" class="bg-gray-900 border border-gray-800 rounded-xl text-gray-500 text-center py-12">
        No print products yet. Create one to start selling prints.
      </div>

      <div
        v-for="product in products"
        :key="product.id"
        class="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden"
      >
        <div class="flex items-center gap-4 px-5 py-4">
          <NuxtImg
            v-if="product.artworkSrc"
            :src="product.artworkSrc"
            :alt="product.artworkTitle || ''"
            width="80"
            height="80"
            class="w-16 h-16 object-cover rounded-lg flex-shrink-0"
          />
          <div class="flex-1 min-w-0">
            <h3 class="text-sm font-medium text-white">{{ product.artworkTitle }}</h3>
            <p class="text-xs text-gray-400 mt-0.5">
              {{ product.variants?.length || 0 }} variants &middot;
              <span :class="product.active ? 'text-green-400' : 'text-red-400'">
                {{ product.active ? 'Active' : 'Inactive' }}
              </span>
            </p>
          </div>
          <div class="flex items-center gap-2">
            <NuxtLink
              :to="`/admin/shop/${product.id}`"
              class="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-white text-xs font-medium rounded-lg transition-colors"
            >
              Edit Variants
            </NuxtLink>
            <button
              @click="toggleActive(product)"
              class="px-3 py-1.5 text-xs font-medium rounded-lg transition-colors"
              :class="product.active
                ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                : 'bg-green-500/10 text-green-400 hover:bg-green-500/20'"
            >
              {{ product.active ? 'Deactivate' : 'Activate' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })

import type { PrintProduct } from '~/types/shop'
import type { Artwork } from '~/types/artwork'

const products = ref<PrintProduct[]>([])
const availableArtworks = ref<Artwork[]>([])
const loading = ref(true)
const showAddForm = ref(false)
const newProductArtworkId = ref('')
const creating = ref(false)

onMounted(async () => {
  try {
    const [productsRes, artworksRes] = await Promise.all([
      $fetch<{ data: PrintProduct[] }>('/api/admin/shop/products').catch(() => ({ data: [] })),
      $fetch<{ data: Artwork[] }>('/api/admin/artworks').catch(() => ({ data: [] })),
    ])
    products.value = productsRes.data || []
    availableArtworks.value = artworksRes.data || []
  } finally {
    loading.value = false
  }
})

async function createProduct() {
  creating.value = true
  try {
    await $fetch('/api/admin/shop/products', {
      method: 'POST',
      body: { artworkId: newProductArtworkId.value },
    })
    showAddForm.value = false
    newProductArtworkId.value = ''
    // Refresh
    const res = await $fetch<{ data: PrintProduct[] }>('/api/admin/shop/products')
    products.value = res.data || []
  } catch (e: any) {
    alert(e?.data?.statusMessage || 'Failed to create product')
  } finally {
    creating.value = false
  }
}

async function toggleActive(product: PrintProduct) {
  try {
    await $fetch(`/api/admin/shop/products/${product.id}`, {
      method: 'PUT',
      body: { active: !product.active },
    })
    product.active = !product.active
  } catch (e: any) {
    alert(e?.data?.statusMessage || 'Failed to update')
  }
}
</script>

<style scoped>
.admin-input {
  @apply w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-accent-red focus:ring-1 focus:ring-accent-red transition-colors text-sm;
}
</style>
