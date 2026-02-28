<template>
  <div class="min-h-screen bg-dark-900 flex items-center justify-center px-6">
    <div class="max-w-md w-full text-center">
      <!-- Processing -->
      <div v-if="status === 'processing'" class="py-12">
        <div class="loading-dots mx-auto mb-4"><span /><span /><span /></div>
        <p class="font-body text-sm text-lavender-400">Unsubscribing...</p>
      </div>

      <!-- Success -->
      <div v-else-if="status === 'done'" class="glass rounded-xl p-8">
        <div class="w-14 h-14 rounded-full bg-accent-red/10 border border-accent-red/30 flex items-center justify-center mx-auto mb-5">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ed544d" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h1 class="font-display text-xl text-lavender-100 mb-2">Unsubscribed</h1>
        <p class="font-body text-sm text-lavender-300 mb-6">
          You've been removed from the mailing list. You won't receive any more emails.
        </p>
        <NuxtLink
          to="/"
          class="inline-flex items-center gap-2 px-5 py-2.5 bg-accent-red/15 border border-accent-red/50 rounded-full font-body text-sm font-medium text-accent-red hover:bg-accent-red hover:text-dark-900 transition-all duration-300"
        >
          Back to Gallery
        </NuxtLink>
      </div>

      <!-- Error -->
      <div v-else class="glass rounded-xl p-8">
        <h1 class="font-display text-xl text-lavender-100 mb-2">Something went wrong</h1>
        <p class="font-body text-sm text-lavender-300 mb-6">
          {{ errorMessage }}
        </p>
        <NuxtLink
          to="/"
          class="inline-flex items-center gap-2 px-5 py-2.5 bg-accent-red/15 border border-accent-red/50 rounded-full font-body text-sm font-medium text-accent-red hover:bg-accent-red hover:text-dark-900 transition-all duration-300"
        >
          Back to Gallery
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })

const status = ref<'processing' | 'done' | 'error'>('processing')
const errorMessage = ref('Could not unsubscribe. Please try again or contact us.')

onMounted(async () => {
  const route = useRoute()
  const email = route.query.email as string | undefined

  if (!email) {
    status.value = 'error'
    errorMessage.value = 'No email address provided.'
    return
  }

  try {
    await $fetch('/api/newsletter/unsubscribe', {
      method: 'POST',
      body: { email },
    })
    status.value = 'done'
  } catch {
    status.value = 'error'
  }
})

useHead({
  title: 'Unsubscribe | Brian Lapinski',
  meta: [{ name: 'robots', content: 'noindex' }],
})
</script>
