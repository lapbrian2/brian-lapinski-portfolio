<template>
  <div
    ref="cursorEl"
    class="custom-cursor hidden md:block"
  />
</template>

<script setup lang="ts">
import gsap from 'gsap'

const cursorEl = ref<HTMLElement | null>(null)
const pos = { x: 0, y: 0 }

function onMouseMove(e: MouseEvent) {
  gsap.to(pos, {
    x: e.clientX,
    y: e.clientY,
    duration: 0.3,
    ease: 'power2.out',
    onUpdate: () => {
      if (!cursorEl.value) return
      cursorEl.value.style.left = `${pos.x}px`
      cursorEl.value.style.top = `${pos.y}px`
    },
  })
}

function onMouseEnterInteractive() {
  cursorEl.value?.classList.add('hovering')
}

function onMouseLeaveInteractive() {
  cursorEl.value?.classList.remove('hovering')
}

onMounted(() => {
  cursorEl.value?.classList.add('active')
  window.addEventListener('mousemove', onMouseMove, { passive: true })

  // Track interactive elements
  document.querySelectorAll('a, button, [role="button"]').forEach((el) => {
    el.addEventListener('mouseenter', onMouseEnterInteractive)
    el.addEventListener('mouseleave', onMouseLeaveInteractive)
  })
})

onUnmounted(() => {
  window.removeEventListener('mousemove', onMouseMove)
  document.querySelectorAll('a, button, [role="button"]').forEach((el) => {
    el.removeEventListener('mouseenter', onMouseEnterInteractive)
    el.removeEventListener('mouseleave', onMouseLeaveInteractive)
  })
})
</script>
