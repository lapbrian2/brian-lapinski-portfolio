<template>
  <div class="max-w-3xl">
    <!-- Header -->
    <div class="flex items-center gap-4 mb-8">
      <NuxtLink
        to="/admin/artworks"
        class="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
      >
        <IconArrowLeft class="w-5 h-5" />
      </NuxtLink>
      <h1 class="text-2xl font-display font-bold text-white">
        {{ loading ? 'Loading...' : `Edit: ${artwork?.title}` }}
      </h1>
    </div>

    <div v-if="loading" class="text-gray-400 text-center py-12">Loading artwork...</div>
    <div v-else-if="!artwork" class="text-gray-400 text-center py-12">Artwork not found.</div>

    <AdminArtworkForm
      v-else
      :initial-data="artwork"
      @saved="handleSaved"
    />
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })

const route = useRoute()
const artworkId = route.params.id as string

import type { ArtworkApiResponse } from '~/types/api'
import type { Artwork } from '~/types/artwork'

const artwork = ref<Artwork | null>(null)
const loading = ref(true)

onMounted(async () => {
  try {
    const res = await $fetch<ArtworkApiResponse>(`/api/artworks/${artworkId}`)
    artwork.value = res.data
  } catch {
    artwork.value = null
  } finally {
    loading.value = false
  }
})

function handleSaved() {
  navigateTo('/admin/artworks')
}
</script>
