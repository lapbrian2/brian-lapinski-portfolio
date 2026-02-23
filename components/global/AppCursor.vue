<template>
  <div
    ref="cursorEl"
    class="custom-cursor hidden md:block"
  >
    <span ref="labelEl" class="cursor-label">{{ cursorText }}</span>
  </div>
</template>

<script setup lang="ts">
import gsap from 'gsap'

const cursorEl = ref<HTMLElement | null>(null)
const labelEl = ref<HTMLElement | null>(null)
const cursorText = ref('')
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

function onMouseEnterInteractive(e: Event) {
  const el = e.currentTarget as HTMLElement
  cursorEl.value?.classList.add('hovering')

  // Check for contextual cursor text
  const text = el.dataset.cursorText
  if (text && labelEl.value) {
    cursorText.value = text
    cursorEl.value?.classList.add('has-label')
    gsap.fromTo(labelEl.value, { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: 0.25, ease: 'power2.out' })
  }
}

function onMouseLeaveInteractive() {
  cursorEl.value?.classList.remove('hovering', 'has-label')
  if (labelEl.value) {
    gsap.to(labelEl.value, { opacity: 0, scale: 0.8, duration: 0.15, ease: 'power2.in', onComplete: () => { cursorText.value = '' } })
  }
}

const INTERACTIVE_SELECTOR = 'a, button, [role="button"], .cursor-hover, [data-cursor-text]'

function bindInteractiveElements(root: Element | Document = document) {
  root.querySelectorAll(INTERACTIVE_SELECTOR).forEach((el) => {
    if ((el as HTMLElement).dataset.cursorBound) return
    ;(el as HTMLElement).dataset.cursorBound = '1'
    el.addEventListener('mouseenter', onMouseEnterInteractive)
    el.addEventListener('mouseleave', onMouseLeaveInteractive)
  })
}

onMounted(() => {
  cursorEl.value?.classList.add('active')
  window.addEventListener('mousemove', onMouseMove, { passive: true })

  bindInteractiveElements()

  observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (node instanceof HTMLElement) {
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
