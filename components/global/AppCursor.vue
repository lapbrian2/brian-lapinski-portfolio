<template>
  <div class="hidden md:block">
    <!-- Dot: snaps instantly to mouse -->
    <div
      ref="dotEl"
      class="cursor-dot"
    />
    <!-- Ring: trails behind with spring easing -->
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

// Two position trackers: dot is instant, ring trails
const dotPos = { x: -100, y: -100 }
const ringPos = { x: -100, y: -100 }
let hasLabel = false
let observer: MutationObserver | null = null
let rafId: number | null = null

function onMouseMove(e: MouseEvent) {
  dotPos.x = e.clientX
  dotPos.y = e.clientY

  // Dot snaps instantly
  if (dotEl.value) {
    dotEl.value.style.left = `${dotPos.x}px`
    dotEl.value.style.top = `${dotPos.y}px`
  }
}

// Ring follows with smooth lerp via requestAnimationFrame
function updateRing() {
  const speed = 0.15
  ringPos.x += (dotPos.x - ringPos.x) * speed
  ringPos.y += (dotPos.y - ringPos.y) * speed

  if (ringEl.value) {
    ringEl.value.style.left = `${ringPos.x}px`
    ringEl.value.style.top = `${ringPos.y}px`
  }

  rafId = requestAnimationFrame(updateRing)
}

function onMouseEnterInteractive(e: Event) {
  const el = e.currentTarget as HTMLElement

  // Dot shrinks, ring expands with accent glow
  if (dotEl.value) {
    gsap.to(dotEl.value, { scale: 0, duration: 0.2, ease: 'power2.out' })
  }
  if (ringEl.value) {
    gsap.to(ringEl.value, {
      width: 48,
      height: 48,
      borderColor: 'rgba(237, 84, 77, 0.4)',
      backgroundColor: 'rgba(237, 84, 77, 0.06)',
      duration: 0.35,
      ease: 'power3.out',
    })
  }

  // Contextual cursor text
  const text = el.dataset.cursorText
  if (text && labelEl.value) {
    cursorText.value = text
    hasLabel = true
    gsap.to(ringEl.value, {
      width: 80,
      height: 80,
      borderColor: 'rgba(237, 84, 77, 0.5)',
      backgroundColor: 'rgba(237, 84, 77, 0.08)',
      duration: 0.35,
      ease: 'power3.out',
    })
    gsap.fromTo(labelEl.value, { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: 0.25, delay: 0.05, ease: 'power2.out' })
  }
}

function onMouseLeaveInteractive() {
  // Dot returns, ring shrinks back
  if (dotEl.value) {
    gsap.to(dotEl.value, { scale: 1, duration: 0.25, ease: 'power2.out' })
  }
  if (ringEl.value) {
    gsap.to(ringEl.value, {
      width: 32,
      height: 32,
      borderColor: 'rgba(201, 210, 231, 0.15)',
      backgroundColor: 'transparent',
      duration: 0.35,
      ease: 'power3.out',
    })
  }

  if (hasLabel && labelEl.value) {
    gsap.to(labelEl.value, {
      opacity: 0,
      scale: 0.8,
      duration: 0.15,
      ease: 'power2.in',
      onComplete: () => { cursorText.value = ''; hasLabel = false },
    })
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
  rafId = requestAnimationFrame(updateRing)

  // Show after brief delay to avoid flash at origin
  setTimeout(() => {
    if (dotEl.value) dotEl.value.style.opacity = '1'
    if (ringEl.value) ringEl.value.style.opacity = '1'
  }, 100)

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
  if (rafId) cancelAnimationFrame(rafId)
  observer?.disconnect()

  document.querySelectorAll('[data-cursor-bound]').forEach((el) => {
    el.removeEventListener('mouseenter', onMouseEnterInteractive)
    el.removeEventListener('mouseleave', onMouseLeaveInteractive)
  })
})
</script>
