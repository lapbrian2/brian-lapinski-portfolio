<script setup lang="ts">
defineProps<{
  ready?: boolean
}>()
</script>

<template>
  <section class="hero-section relative h-screen w-full overflow-hidden bg-dark-900">
    <!-- 3D Particle Canvas (client-only since Three.js needs DOM) -->
    <ClientOnly>
      <div class="absolute inset-0 z-0">
        <HeroCanvas />
      </div>
    </ClientOnly>

    <!-- Radial gradient overlay: transparent center fading to dark edges -->
    <div class="hero-gradient absolute inset-0 z-10 pointer-events-none" />

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
.hero-gradient {
  background: radial-gradient(
    ellipse at center,
    rgba(24, 21, 32, 0.3) 0%,
    rgba(24, 21, 32, 0.9) 70%,
    #181520 100%
  );
}
</style>
