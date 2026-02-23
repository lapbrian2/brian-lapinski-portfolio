<template>
  <div
    v-if="!hidden"
    :class="[
      'fixed inset-0 z-[100] bg-dark-900 flex items-center justify-center transition-opacity duration-[600ms] ease-in-out',
      loaded ? 'opacity-0 pointer-events-none' : 'opacity-100',
    ]"
    @transitionend="onTransitionEnd"
  >
    <span class="font-display text-6xl font-bold text-lavender-100 animate-pulse-slow">
      BL
    </span>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const loaded = ref(false)
const hidden = ref(false)

function onTransitionEnd(): void {
  if (loaded.value) {
    hidden.value = true
  }
}

onMounted(() => {
  setTimeout(() => {
    loaded.value = true
  }, 1500)
})
</script>

<style scoped>
</style>
