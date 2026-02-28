<template>
  <div class="min-h-screen bg-dark-900 flex items-center justify-center px-6">
    <div class="max-w-md text-center">
      <div class="w-16 h-16 rounded-full border-2 border-lavender-400/30 flex items-center justify-center mx-auto mb-6">
        <svg class="w-8 h-8 text-lavender-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M18 6 6 18" />
          <path d="m6 6 12 12" />
        </svg>
      </div>
      <h1 class="font-display text-3xl font-bold text-lavender-100 mb-3">
        Purchase Cancelled
      </h1>
      <p class="font-body text-lavender-400 mb-8">
        No worries — your payment was not processed. You can return to the gallery whenever you're ready.
      </p>
      <div class="flex flex-col sm:flex-row gap-3 justify-center">
        <NuxtLink
          to="/gallery"
          class="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full border border-white/10 text-lavender-200 hover:border-white/20 hover:text-white transition-all font-body text-sm"
        >
          Back to Gallery
        </NuxtLink>
        <NuxtLink
          to="/shop"
          class="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-accent-red text-white hover:bg-accent-red/90 transition-all font-body text-sm"
        >
          Visit Shop
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
useHead({
  title: 'Purchase Cancelled | Brian Lapinski',
  meta: [{ name: 'robots', content: 'noindex' }],
})
</script>
