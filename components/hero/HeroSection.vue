<script setup lang="ts">
defineProps<{
  ready?: boolean
}>()
</script>

<template>
  <section class="hero-section relative h-screen w-full overflow-hidden bg-dark-900">
    <!-- Subtle ambient gradient — no particles, no 3D -->
    <div class="hero-glow absolute inset-0 z-0 pointer-events-none" />

    <!-- Text overlay -->
    <div class="absolute inset-0 z-20 flex items-center justify-center">
      <HeroText :ready="ready" />
    </div>

    <!-- Scroll indicator pinned to bottom center -->
    <div class="absolute bottom-8 left-1/2 -translate-x-1/2 z-20">
      <ScrollIndicator />
    </div>
  </section>
</template>

<style scoped>
.hero-glow {
  background:
    radial-gradient(ellipse 60% 50% at 30% 40%, rgba(237, 84, 77, 0.04) 0%, transparent 70%),
    radial-gradient(ellipse 50% 60% at 70% 60%, rgba(0, 122, 255, 0.03) 0%, transparent 70%);
}
</style>
