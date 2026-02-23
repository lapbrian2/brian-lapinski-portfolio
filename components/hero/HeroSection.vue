<script setup lang="ts">
defineProps<{
  ready?: boolean
}>()
</script>

<template>
  <section class="hero-section relative h-screen w-full overflow-hidden bg-dark-900">
    <!-- Ambient gradient orbs — subtle, cinematic -->
    <div class="hero-glow absolute inset-0 z-0 pointer-events-none" />

    <!-- Horizontal rule accent — thin line at ~70% down -->
    <div class="absolute left-0 right-0 z-10 pointer-events-none" style="top: 68%">
      <div class="hero-rule mx-auto h-px max-w-[200px] bg-gradient-to-r from-transparent via-lavender-400/15 to-transparent" />
    </div>

    <!-- Text overlay -->
    <div class="absolute inset-0 z-20 flex items-center justify-center">
      <HeroText :ready="ready" />
    </div>

    <!-- Scroll indicator pinned to bottom center -->
    <div class="absolute bottom-10 left-1/2 -translate-x-1/2 z-20">
      <ScrollIndicator />
    </div>
  </section>
</template>

<style scoped>
.hero-glow {
  background:
    radial-gradient(ellipse 60% 50% at 25% 35%, rgba(237, 84, 77, 0.05) 0%, transparent 60%),
    radial-gradient(ellipse 50% 60% at 75% 65%, rgba(0, 122, 255, 0.035) 0%, transparent 60%),
    radial-gradient(ellipse 80% 40% at 50% 100%, rgba(35, 27, 53, 0.8) 0%, transparent 50%);
}
</style>
