<script setup lang="ts">
defineProps<{
  ready?: boolean
}>()

const imgLoaded = ref(false)
</script>

<template>
  <section class="hero-section relative h-screen w-full overflow-hidden bg-dark-900">
    <!-- Background artwork image — subtle, atmospheric -->
    <div class="absolute inset-0 z-0">
      <img
        src="/images/hero-bg.jpg"
        alt=""
        aria-hidden="true"
        class="absolute inset-0 w-full h-full object-cover transition-opacity duration-[2s]"
        :class="imgLoaded ? 'opacity-20' : 'opacity-0'"
        @load="imgLoaded = true"
      >
      <!-- Desaturate + darken layer -->
      <div class="absolute inset-0 bg-dark-900/40 mix-blend-color" />
    </div>

    <!-- 3D Particle Canvas floats above the image -->
    <ClientOnly>
      <div class="absolute inset-0 z-[1]">
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
    rgba(24, 21, 32, 0.2) 0%,
    rgba(24, 21, 32, 0.85) 60%,
    #181520 100%
  );
}
</style>
