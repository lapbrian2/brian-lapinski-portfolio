<template>
  <div
    ref="spotlightEl"
    class="fixed inset-0 z-[1] pointer-events-none hidden md:block"
    :style="{
      background: 'radial-gradient(circle 600px at var(--spotlight-x) var(--spotlight-y), rgba(255,255,255,0.04), transparent 70%)',
      contain: 'strict',
    }"
  />
</template>

<script setup lang="ts">
const spotlightEl = ref<HTMLElement | null>(null)
let rafPending = false

function onMouseMove(e: MouseEvent): void {
  if (rafPending) return
  rafPending = true

  requestAnimationFrame(() => {
    if (spotlightEl.value) {
      spotlightEl.value.style.setProperty('--spotlight-x', `${e.clientX}px`)
      spotlightEl.value.style.setProperty('--spotlight-y', `${e.clientY}px`)
    }
    rafPending = false
  })
}

onMounted(() => {
  const hoverQuery = window.matchMedia('(hover: hover)')
  if (!hoverQuery.matches) return

  if (spotlightEl.value) {
    spotlightEl.value.style.setProperty('--spotlight-x', '50vw')
    spotlightEl.value.style.setProperty('--spotlight-y', '50vh')
  }

  window.addEventListener('mousemove', onMouseMove, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('mousemove', onMouseMove)
})
</script>
