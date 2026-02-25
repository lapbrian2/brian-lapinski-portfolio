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
      :class="{ 'is-loading': isLoading }"
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
const isLoading = ref(false)

// Two position trackers: dot is instant, ring trails
const dotPos = { x: -100, y: -100 }
const ringPos = { x: -100, y: -100 }
let hasLabel = false
let isOverDrag = false
let isDragActive = false
let observer: MutationObserver | null = null
let rafId: number | null = null

const INTERACTIVE_SELECTOR = 'a, button, [role="button"], .cursor-hover, [data-cursor-text]'
const DRAG_SELECTOR = '[data-cursor-drag]'
const LOADING_SELECTOR = '[data-cursor-loading]'

// ─── Mouse Position ──────────────────────────────────────────────

function onMouseMove(e: MouseEvent): void {
  dotPos.x = e.clientX
  dotPos.y = e.clientY

  if (dotEl.value) {
    dotEl.value.style.left = `${dotPos.x}px`
    dotEl.value.style.top = `${dotPos.y}px`
  }
}

// Ring follows with smooth lerp via requestAnimationFrame
function updateRing(): void {
  const speed = 0.15
  ringPos.x += (dotPos.x - ringPos.x) * speed
  ringPos.y += (dotPos.y - ringPos.y) * speed

  if (ringEl.value) {
    ringEl.value.style.left = `${ringPos.x}px`
    ringEl.value.style.top = `${ringPos.y}px`
  }

  rafId = requestAnimationFrame(updateRing)
}

// ─── Click / Mousedown Pulse ─────────────────────────────────────

function onMouseDown(): void {
  if (dotEl.value) {
    gsap.to(dotEl.value, {
      scale: 0.6,
      duration: 0.1,
      overwrite: 'auto',
      force3D: true,
    })
  }
  if (ringEl.value && !isOverDrag) {
    gsap.to(ringEl.value, {
      scale: 0.85,
      duration: 0.15,
      overwrite: 'auto',
      force3D: true,
    })
  }

  if (isOverDrag) {
    isDragActive = true
    if (ringEl.value) {
      gsap.to(ringEl.value, {
        borderColor: 'rgba(237, 84, 77, 0.6)',
        backgroundColor: 'rgba(237, 84, 77, 0.1)',
        duration: 0.15,
        overwrite: 'auto',
      })
    }
  }
}

function onMouseUp(): void {
  if (dotEl.value) {
    gsap.to(dotEl.value, {
      scale: 1,
      duration: 0.25,
      ease: 'elastic.out(1, 0.4)',
      overwrite: 'auto',
      force3D: true,
    })
  }
  if (ringEl.value && !isOverDrag) {
    gsap.to(ringEl.value, {
      scale: 1,
      duration: 0.3,
      ease: 'power2.out',
      overwrite: 'auto',
      force3D: true,
    })
  }

  if (isDragActive) {
    isDragActive = false
    if (ringEl.value) {
      gsap.to(ringEl.value, {
        borderColor: 'rgba(237, 84, 77, 0.4)',
        backgroundColor: 'rgba(237, 84, 77, 0.06)',
        duration: 0.25,
        ease: 'power2.out',
        overwrite: 'auto',
      })
    }
  }
}

// ─── Interactive Hover (existing) ────────────────────────────────

function onMouseEnterInteractive(e: Event): void {
  const el = e.currentTarget as HTMLElement

  // Dot shrinks, ring expands with accent glow
  if (dotEl.value) {
    gsap.to(dotEl.value, {
      scale: 0,
      duration: 0.2,
      ease: 'power2.out',
      overwrite: 'auto',
      force3D: true,
    })
  }
  if (ringEl.value) {
    gsap.to(ringEl.value, {
      width: 48,
      height: 48,
      borderColor: 'rgba(237, 84, 77, 0.4)',
      backgroundColor: 'rgba(237, 84, 77, 0.06)',
      duration: 0.35,
      ease: 'power3.out',
      overwrite: 'auto',
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
      overwrite: 'auto',
    })
    gsap.fromTo(
      labelEl.value,
      { opacity: 0, scale: 0.8 },
      { opacity: 1, scale: 1, duration: 0.25, delay: 0.05, ease: 'power2.out' },
    )
  }
}

function onMouseLeaveInteractive(): void {
  if (dotEl.value) {
    gsap.to(dotEl.value, {
      scale: 1,
      duration: 0.25,
      ease: 'power2.out',
      overwrite: 'auto',
      force3D: true,
    })
  }
  if (ringEl.value) {
    gsap.to(ringEl.value, {
      width: 32,
      height: 32,
      borderColor: 'rgba(201, 210, 231, 0.15)',
      backgroundColor: 'transparent',
      duration: 0.35,
      ease: 'power3.out',
      overwrite: 'auto',
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

// ─── Drag Hover ──────────────────────────────────────────────────

function onMouseEnterDrag(): void {
  isOverDrag = true
  cursorText.value = '\u27F5 \u27F6'
  hasLabel = true

  if (dotEl.value) {
    gsap.to(dotEl.value, {
      scale: 0,
      duration: 0.2,
      ease: 'power2.out',
      overwrite: 'auto',
      force3D: true,
    })
  }
  if (ringEl.value) {
    gsap.to(ringEl.value, {
      width: 64,
      height: 64,
      borderColor: 'rgba(237, 84, 77, 0.4)',
      backgroundColor: 'rgba(237, 84, 77, 0.06)',
      duration: 0.35,
      ease: 'power3.out',
      overwrite: 'auto',
    })
  }
  if (labelEl.value) {
    gsap.fromTo(
      labelEl.value,
      { opacity: 0, scale: 0.8 },
      { opacity: 1, scale: 1, duration: 0.25, delay: 0.05, ease: 'power2.out' },
    )
  }
}

function onMouseLeaveDrag(): void {
  isOverDrag = false
  isDragActive = false

  if (dotEl.value) {
    gsap.to(dotEl.value, {
      scale: 1,
      duration: 0.25,
      ease: 'power2.out',
      overwrite: 'auto',
      force3D: true,
    })
  }
  if (ringEl.value) {
    gsap.to(ringEl.value, {
      width: 32,
      height: 32,
      borderColor: 'rgba(201, 210, 231, 0.15)',
      backgroundColor: 'transparent',
      duration: 0.35,
      ease: 'power3.out',
      overwrite: 'auto',
    })
  }
  if (labelEl.value) {
    gsap.to(labelEl.value, {
      opacity: 0,
      scale: 0.8,
      duration: 0.15,
      ease: 'power2.in',
      onComplete: () => { cursorText.value = ''; hasLabel = false },
    })
  }
}

// ─── Loading Hover ───────────────────────────────────────────────

function onMouseEnterLoading(): void {
  isLoading.value = true
}

function onMouseLeaveLoading(): void {
  isLoading.value = false
}

// ─── Binding ─────────────────────────────────────────────────────

function bindInteractiveElements(root: Element | Document = document): void {
  root.querySelectorAll(INTERACTIVE_SELECTOR).forEach((el) => {
    if ((el as HTMLElement).dataset.cursorBound) return
    ;(el as HTMLElement).dataset.cursorBound = '1'
    el.addEventListener('mouseenter', onMouseEnterInteractive)
    el.addEventListener('mouseleave', onMouseLeaveInteractive)
  })
}

function bindDragElements(root: Element | Document = document): void {
  root.querySelectorAll(DRAG_SELECTOR).forEach((el) => {
    if ((el as HTMLElement).dataset.cursorDragBound) return
    ;(el as HTMLElement).dataset.cursorDragBound = '1'
    el.addEventListener('mouseenter', onMouseEnterDrag)
    el.addEventListener('mouseleave', onMouseLeaveDrag)
  })
}

function bindLoadingElements(root: Element | Document = document): void {
  root.querySelectorAll(LOADING_SELECTOR).forEach((el) => {
    if ((el as HTMLElement).dataset.cursorLoadingBound) return
    ;(el as HTMLElement).dataset.cursorLoadingBound = '1'
    el.addEventListener('mouseenter', onMouseEnterLoading)
    el.addEventListener('mouseleave', onMouseLeaveLoading)
  })
}

function bindAll(root: Element | Document = document): void {
  bindInteractiveElements(root)
  bindDragElements(root)
  bindLoadingElements(root)
}

// ─── Lifecycle ───────────────────────────────────────────────────

onMounted(() => {
  const hoverQuery = window.matchMedia('(hover: hover)')
  if (!hoverQuery.matches) return

  window.addEventListener('mousemove', onMouseMove, { passive: true })
  window.addEventListener('mousedown', onMouseDown)
  window.addEventListener('mouseup', onMouseUp)
  rafId = requestAnimationFrame(updateRing)

  // Show after brief delay to avoid flash at origin
  setTimeout(() => {
    if (dotEl.value) dotEl.value.style.opacity = '1'
    if (ringEl.value) ringEl.value.style.opacity = '1'
  }, 100)

  bindAll()

  observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (node instanceof HTMLElement) {
          bindAll(node)
        }
      }
    }
  })

  observer.observe(document.body, { childList: true, subtree: true })
})

onUnmounted(() => {
  window.removeEventListener('mousemove', onMouseMove)
  window.removeEventListener('mousedown', onMouseDown)
  window.removeEventListener('mouseup', onMouseUp)
  if (rafId) cancelAnimationFrame(rafId)
  observer?.disconnect()

  document.querySelectorAll('[data-cursor-bound]').forEach((el) => {
    el.removeEventListener('mouseenter', onMouseEnterInteractive)
    el.removeEventListener('mouseleave', onMouseLeaveInteractive)
  })
  document.querySelectorAll('[data-cursor-drag-bound]').forEach((el) => {
    el.removeEventListener('mouseenter', onMouseEnterDrag)
    el.removeEventListener('mouseleave', onMouseLeaveDrag)
  })
  document.querySelectorAll('[data-cursor-loading-bound]').forEach((el) => {
    el.removeEventListener('mouseenter', onMouseEnterLoading)
    el.removeEventListener('mouseleave', onMouseLeaveLoading)
  })
})
</script>
