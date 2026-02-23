<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{
  error: NuxtError
}>()

const is404 = computed(() => props.error.statusCode === 404)

function goHome() {
  clearError({ redirect: '/' })
}
</script>

<template>
  <div class="min-h-screen bg-dark-900 flex flex-col items-center justify-center px-6 text-center">
    <!-- Error code -->
    <span class="font-display text-[8rem] md:text-[12rem] font-bold leading-none text-dark-700">
      {{ error.statusCode }}
    </span>

    <!-- Message -->
    <h1 class="font-display text-2xl md:text-4xl font-bold text-lavender-100 mt-4">
      {{ is404 ? 'Page not found' : 'Something went wrong' }}
    </h1>

    <p class="font-body text-base text-lavender-300 mt-4 max-w-md">
      {{ is404
        ? 'The page you\'re looking for doesn\'t exist or has been moved.'
        : 'An unexpected error occurred. Please try again.'
      }}
    </p>

    <!-- Back home -->
    <button
      class="mt-10 px-8 py-3 rounded-full bg-accent-red text-white font-body text-sm uppercase tracking-wider hover:bg-accent-red-hover transition-colors duration-200"
      @click="goHome"
    >
      Back to Home
    </button>
  </div>
</template>
