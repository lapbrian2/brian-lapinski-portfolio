<script setup lang="ts">
/**
 * ScrollIndicator.vue
 * A small downward arrow + "Scroll" label that fades out
 * once the user scrolls past 100px.
 */
const visible = ref(true)

function onScroll() {
  visible.value = window.scrollY < 100
}

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  // Initial check in case page is already scrolled on mount
  onScroll()
})

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
})
</script>

<template>
  <div
    class="scroll-indicator flex flex-col items-center gap-2 select-none transition-opacity duration-500"
    :class="visible ? 'opacity-100' : 'opacity-0 pointer-events-none'"
  >
    <!-- Bouncing chevron arrow -->
    <span class="arrow animate-bounce-slow" aria-hidden="true" />

    <!-- Label -->
    <span class="text-xs uppercase tracking-widest text-lavender-400 font-body">
      Scroll
    </span>
  </div>
</template>

<style scoped>
.arrow {
  display: block;
  width: 12px;
  height: 12px;
  border-right: 2px solid theme('colors.lavender.300');
  border-bottom: 2px solid theme('colors.lavender.300');
  transform: rotate(45deg);
}
</style>
