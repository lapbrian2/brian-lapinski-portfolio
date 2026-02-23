<template>
  <div>
    <h1 class="text-2xl font-display font-bold text-white mb-8">Analytics</h1>

    <div class="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center">
      <IconChart class="w-12 h-12 text-gray-600 mx-auto mb-4" />
      <h2 class="text-lg font-display font-semibold text-gray-400 mb-2">Coming Soon</h2>
      <p class="text-sm text-gray-500 max-w-md mx-auto">
        Analytics tracking will be added in Phase 4. You'll see page views, artwork popularity, top referrers, and visitor trends here.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })
</script>
