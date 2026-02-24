<script setup lang="ts">
const props = withDefaults(defineProps<{
  ready?: boolean
}>(), {
  ready: false,
})

const visible = ref(false)

function onScroll() {
  visible.value = props.ready && window.scrollY < 100
}

watch(() => props.ready, (isReady) => {
  if (isReady) onScroll()
})

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  onScroll()
})

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
})
</script>

<template>
  <div
    class="scroll-indicator flex flex-col items-center gap-3 select-none transition-opacity duration-700"
    :class="visible ? 'opacity-100' : 'opacity-0 pointer-events-none'"
  >
    <span class="text-[10px] uppercase tracking-[0.3em] text-lavender-400/60 font-body">
      Scroll
    </span>
    <!-- Animated vertical line -->
    <div class="scroll-line" aria-hidden="true" />
  </div>
</template>

<style scoped>
.scroll-line {
  width: 1px;
  height: 48px;
  background: linear-gradient(to bottom, theme('colors.lavender.300'), transparent);
  position: relative;
  overflow: hidden;
}

.scroll-line::after {
  content: '';
  position: absolute;
  top: -100%;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(to bottom, transparent, theme('colors.accent.red'), transparent);
  animation: scroll-pulse 2s ease-in-out infinite;
}

@keyframes scroll-pulse {
  0% { top: -100%; }
  100% { top: 100%; }
}
</style>
