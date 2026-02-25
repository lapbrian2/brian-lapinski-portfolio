<script setup lang="ts">
import type { NuxtError } from '#app'
import gsap from 'gsap'

const props = defineProps<{
  error: NuxtError
}>()

const is404 = computed(() => props.error.statusCode === 404)

useHead({
  title: computed(() => is404.value ? 'Page Not Found — Brian Lapinski' : 'Error — Brian Lapinski'),
  meta: [
    { name: 'robots', content: 'noindex, nofollow' },
  ],
})

const containerEl = ref<HTMLElement | null>(null)

function goHome() {
  clearError({ redirect: '/' })
}

function goGallery() {
  clearError({ redirect: '/#work' })
}

onMounted(() => {
  if (!containerEl.value) return
  gsap.from(containerEl.value.children, {
    y: 30,
    opacity: 0,
    duration: 0.7,
    stagger: 0.1,
    ease: 'power3.out',
    delay: 0.1,
  })
})
</script>

<template>
  <div class="min-h-screen bg-dark-900 vignette grain-overlay flex flex-col items-center justify-center px-6 text-center">
    <div ref="containerEl" class="max-w-lg">
      <!-- Glitch error code -->
      <div class="relative mb-6">
        <span class="font-display text-[8rem] md:text-[12rem] font-bold leading-none text-dark-700 select-none">
          {{ error.statusCode }}
        </span>
        <span class="absolute inset-0 font-display text-[8rem] md:text-[12rem] font-bold leading-none text-accent-red/10 select-none" style="transform: translate(4px, -4px)">
          {{ error.statusCode }}
        </span>
      </div>

      <!-- Message -->
      <h1 class="font-display text-2xl md:text-4xl font-bold text-lavender-100">
        {{ is404 ? 'Lost in the void' : 'Something broke' }}
      </h1>

      <p class="font-body text-base text-lavender-300 mt-4 max-w-md mx-auto">
        {{ is404
          ? 'This page doesn\'t exist — but there\'s plenty of art to discover.'
          : 'An unexpected error occurred. The canvas is temporarily blank.'
        }}
      </p>

      <!-- Actions -->
      <div class="flex flex-wrap items-center justify-center gap-4 mt-10">
        <button
          class="btn-press px-8 py-3 rounded-full bg-accent-red text-white font-body text-sm uppercase tracking-wider hover:bg-accent-red-hover transition-colors duration-200"
          @click="goHome"
        >
          Back to Home
        </button>
        <button
          v-if="is404"
          class="btn-press px-8 py-3 rounded-full border border-lavender-400/30 text-lavender-300 font-body text-sm uppercase tracking-wider hover:border-lavender-200 hover:text-white transition-all duration-200"
          @click="goGallery"
        >
          View Gallery
        </button>
      </div>

      <!-- Category links -->
      <div v-if="is404" class="mt-16">
        <p class="font-body text-xs uppercase tracking-[0.2em] text-lavender-400/40 mb-4">Explore Categories</p>
        <div class="flex flex-wrap justify-center gap-3">
          <button
            v-for="cat in ['portraits', 'landscapes', 'abstract', 'surreal']"
            :key="cat"
            class="btn-press px-4 py-2 rounded-full border border-lavender-400/15 text-lavender-300 font-body text-xs uppercase tracking-wider hover:border-accent-red/30 hover:text-lavender-200 transition-all duration-300"
            @click="clearError({ redirect: `/${cat}` })"
          >
            {{ cat }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
