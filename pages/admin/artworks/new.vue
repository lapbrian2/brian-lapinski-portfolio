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
      <h1 class="text-2xl font-display font-bold text-white">New Artwork</h1>
    </div>

    <AdminArtworkForm @saved="handleSaved" />
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })

function handleSaved(id: string) {
  navigateTo('/admin/artworks')
}
</script>
