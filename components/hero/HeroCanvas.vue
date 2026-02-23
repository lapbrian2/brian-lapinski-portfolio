<script setup lang="ts">
/**
 * HeroCanvas.vue
 * TresJS 3D canvas wrapper that renders the particle constellation.
 * Wrapped in ClientOnly because Three.js requires the browser DOM.
 */
</script>

<template>
  <ClientOnly>
    <TresCanvas
      clear-color="#181520"
      :alpha="true"
      :antialias="true"
      window-size
    >
      <TresPerspectiveCamera :position="[0, 0, 5]" :fov="75" />
      <TresFog :args="['#181520', 3, 12]" />
      <HeroParticles />
    </TresCanvas>
  </ClientOnly>
</template>

<style scoped>
/* TresCanvas fills its parent container by default with window-size */
</style>
