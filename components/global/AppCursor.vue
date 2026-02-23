<template>
  <div class="hidden md:block">
    <!-- Inner dot — follows cursor tightly -->
    <div
      ref="dotEl"
      class="cursor-dot"
    />
    <!-- Outer ring — trails behind with spring physics -->
    <div
      ref="ringEl"
      class="cursor-ring"
    >
      <span ref="labelEl" class="cursor-label">{{ cursorText }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import gsap from 'gsap'

const dotEl = ref<HTMLElement | null>(null)
const ringEl = ref<HTMLElement | null>(null)
const labelEl = ref<HTMLElement | null>(null)
const cursorText = ref('')

// Positions: dot tracks instantly, ring trails with spring
const dotPos = { x: 0, y: 0 }
const ringPos = { x: 0, y: 0 }
const mousePos = { x: 0, y: 0 }
let isHovering = false
let hasLabel = false
let observer: MutationObserver | null = null

function onMouseMove(e: MouseEvent) {
  mousePos.x = e.clientX
  mousePos.y = e.clientY
}

function tick() {
  // Dot follows mouse tightly
  dotPos.x += (mousePos.x - dotPos.x) * 0.35
  dotPos.y += (mousePos.y - dotPos.y) * 0.35

  // Ring trails behind with softer spring
  ringPos.x += (mousePos.x - ringPos.x) * 0.12
  ringPos.y += (mousePos.y - ringPos.y) * 0.12

  if (dotEl.value) {
    dotEl.value.style.transform = `translate(${dotPos.x}px, ${dotPos.y}px) translate(-50%, -50%)`
  }
  if (ringEl.value) {
    ringEl.value.style.transform = `translate(${ringPos.x}px, ${ringPos.y}px) translate(-50%, -50%)${isHovering ? ' scale(2.5)' : ''}${hasLabel ? ' scale(4)' : ''}`
  }
}

function onMouseEnterInteractive(e: Event) {
  const el = e.currentTarget as HTMLElement
  isHovering = true
  dotEl.value?.classList.add('hovering')
  ringEl.value?.classList.add('hovering')

  const text = el.dataset.cursorText
  if (text && labelEl.value) {
    cursorText.value = text
    hasLabel = true
    ringEl.value?.classList.add('has-label')
    gsap.fromTo(labelEl.value, { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: 0.25, ease: 'power2.out' })
  }
}

function onMouseLeaveInteractive() {
  isHovering = false
  hasLabel = false
  dotEl.value?.classList.remove('hovering')
  ringEl.value?.classList.remove('hovering', 'has-label')
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
  window.addEventListener('mousemove', onMouseMove, { passive: true })
  gsap.ticker.add(tick)

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
  gsap.ticker.remove(tick)
  observer?.disconnect()

  document.querySelectorAll('[data-cursor-bound]').forEach((el) => {
    el.removeEventListener('mouseenter', onMouseEnterInteractive)
    el.removeEventListener('mouseleave', onMouseLeaveInteractive)
  })
})
</script>
