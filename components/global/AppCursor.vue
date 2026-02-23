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
let observer: MutationObserver | null = null

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

const INTERACTIVE_SELECTOR = 'a, button, [role="button"], .cursor-hover'

function bindInteractiveElements(root: Element | Document = document) {
  root.querySelectorAll(INTERACTIVE_SELECTOR).forEach((el) => {
    // Avoid double-binding by checking a data attribute
    if ((el as HTMLElement).dataset.cursorBound) return
    ;(el as HTMLElement).dataset.cursorBound = '1'
    el.addEventListener('mouseenter', onMouseEnterInteractive)
    el.addEventListener('mouseleave', onMouseLeaveInteractive)
  })
}

onMounted(() => {
  cursorEl.value?.classList.add('active')
  window.addEventListener('mousemove', onMouseMove, { passive: true })

  // Bind existing interactive elements
  bindInteractiveElements()

  // Watch for dynamically added elements (Vue renders, route changes, etc.)
  observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (node instanceof HTMLElement) {
          // Bind any interactive elements inside the new node
          bindInteractiveElements(node)
        }
      }
    }
  })

  observer.observe(document.body, { childList: true, subtree: true })
})

onUnmounted(() => {
  window.removeEventListener('mousemove', onMouseMove)
  observer?.disconnect()

  document.querySelectorAll('[data-cursor-bound]').forEach((el) => {
    el.removeEventListener('mouseenter', onMouseEnterInteractive)
    el.removeEventListener('mouseleave', onMouseLeaveInteractive)
  })
})
</script>
