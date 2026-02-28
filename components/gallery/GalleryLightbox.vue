<script setup lang="ts">
import gsap from 'gsap'
import type { SourceRect } from '~/composables/useLightbox'
import { useIsMobile, useReducedMotion } from '~/composables/useMediaQuery'

import type { PrintProduct } from '~/types/shop'

const lightbox = useLightbox()
const { copied, copiedType } = usePromptFork()
const reducedMotion = useReducedMotion()
const isMobile = useIsMobile()
const imageEl = ref<HTMLElement | null>(null)
const captionEl = ref<HTMLElement | null>(null)
const containerEl = ref<HTMLElement | null>(null)
const backdropEl = ref<HTMLElement | null>(null)
const imageLoaded = ref(false)
const showCaption = ref(true)
const showArchitect = ref(false)
const showToast = ref(false)
let toastTimeoutId: ReturnType<typeof setTimeout> | null = null

// FLIP animation state
let flipClone: HTMLElement | null = null
let flipTl: gsap.core.Timeline | null = null
const isFlipAnimating = ref(false)

// Active transition timeline — kill on rapid navigation
let activeTl: gsap.core.Timeline | null = null

// Focus management state
let previouslyFocused: Element | null = null

// Buy Print link — lazy-fetch products list so we can show "Buy Print" when a print exists
const { data: shopProductsData } = useFetch<{ data: PrintProduct[] }>('/api/shop/products', { lazy: true, server: false })
const printProductForCurrent = computed(() => {
  const artworkId = lightbox.currentItem.value?.id
  if (!artworkId || !shopProductsData.value?.data) return null
  return shopProductsData.value.data.find((p) => p.artworkId === artworkId && p.active) ?? null
})

const FOCUSABLE_SELECTOR = 'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'

// Touch / swipe state
let touchStartX = 0
let touchStartY = 0
let touchDeltaX = 0
let touchLastX = 0
let touchLastTime = 0
let touchVelocity = 0
const SWIPE_THRESHOLD = 40
const VELOCITY_THRESHOLD = 0.3 // px/ms — a quick flick

// Check if current item has Ossuary data
const hasOssuaryData = computed(() => {
  const item = lightbox.currentItem.value
  return !!(item?.rawPrompt || item?.promptNodes?.length)
})

function onBackdropClick(e: MouseEvent) {
  const target = e.target as HTMLElement
  // Close when clicking the container itself or the backdrop overlay
  if (target === e.currentTarget || target === backdropEl.value) {
    animatedClose()
  }
}

function toggleCaption() {
  showCaption.value = !showCaption.value
}

function toggleArchitect() {
  showArchitect.value = !showArchitect.value
}

function onTouchStart(e: TouchEvent) {
  touchStartX = e.touches[0].clientX
  touchStartY = e.touches[0].clientY
  touchDeltaX = 0
  touchLastX = e.touches[0].clientX
  touchLastTime = performance.now()
  touchVelocity = 0
}

function onTouchMove(e: TouchEvent) {
  touchDeltaX = e.touches[0].clientX - touchStartX
  const deltaY = Math.abs(e.touches[0].clientY - touchStartY)

  // Compute velocity for flick detection
  const now = performance.now()
  const dt = now - touchLastTime
  if (dt > 0) {
    touchVelocity = (e.touches[0].clientX - touchLastX) / dt
  }
  touchLastX = e.touches[0].clientX
  touchLastTime = now

  // Only track horizontal swipes
  if (Math.abs(touchDeltaX) > deltaY && imageEl.value) {
    gsap.set(imageEl.value, { x: touchDeltaX * 0.6, rotation: touchDeltaX * 0.015, force3D: true })
  }
}

function onTouchEnd() {
  const didSwipe = Math.abs(touchDeltaX) > SWIPE_THRESHOLD || Math.abs(touchVelocity) > VELOCITY_THRESHOLD
  const direction = (touchDeltaX !== 0) ? Math.sign(touchDeltaX) : Math.sign(touchVelocity)

  if (didSwipe && imageEl.value) {
    if (direction > 0 && lightbox.hasPrev.value) {
      gsap.to(imageEl.value, {
        x: 120,
        opacity: 0.3,
        duration: 0.2,
        ease: 'power2.in',
        force3D: true,
        overwrite: 'auto',
        onComplete: () => lightbox.prev(),
      })
    } else if (direction < 0 && lightbox.hasNext.value) {
      gsap.to(imageEl.value, {
        x: -120,
        opacity: 0.3,
        duration: 0.2,
        ease: 'power2.in',
        force3D: true,
        overwrite: 'auto',
        onComplete: () => lightbox.next(),
      })
    } else {
      // At edge — elastic bounce back
      gsap.to(imageEl.value, { x: 0, rotation: 0, duration: 0.5, ease: 'elastic.out(1, 0.5)', force3D: true, overwrite: 'auto' })
    }
  } else if (imageEl.value) {
    // Didn't cross threshold — snap back
    gsap.to(imageEl.value, { x: 0, rotation: 0, duration: 0.3, ease: 'power2.out', force3D: true, overwrite: 'auto' })
  }

  touchDeltaX = 0
}

// Single watcher: handles image transition + closes panel
watch(() => lightbox.currentIndex.value, (_, oldVal) => {
  if (oldVal === undefined) return
  showArchitect.value = false
  imageLoaded.value = false
  animateImageTransition()
})

function animateImageTransition() {
  if (!imageEl.value) return

  // Kill any in-flight transition to prevent stacking
  activeTl?.kill()

  const dir = lightbox.direction.value === 'next' ? 1 : -1
  activeTl = gsap.timeline()

  activeTl.fromTo(imageEl.value, {
    opacity: 0,
    x: 60 * dir,
    scale: 0.96,
  }, {
    opacity: 1,
    x: 0,
    scale: 1,
    duration: 0.45,
    ease: 'power3.out',
    force3D: true,
    clearProps: 'scale',
  })

  if (captionEl.value) {
    activeTl.fromTo(captionEl.value, {
      opacity: 0,
      y: 12,
    }, {
      opacity: 1,
      y: 0,
      duration: 0.35,
      ease: 'power2.out',
    }, '-=0.25')
  }
}

// ─── FLIP Clone Utilities ───────────────────────────────────────────

function createFlipClone(src: string, rect: SourceRect): HTMLElement {
  const clone = document.createElement('img')
  clone.src = src
  clone.style.cssText = `
    position: fixed;
    z-index: 70;
    top: ${rect.top}px;
    left: ${rect.left}px;
    width: ${rect.width}px;
    height: ${rect.height}px;
    border-radius: ${rect.borderRadius};
    object-fit: cover;
    pointer-events: none;
    will-change: transform, top, left, width, height, border-radius;
  `
  document.body.appendChild(clone)
  return clone
}

function removeFlipClone() {
  if (flipClone) {
    flipClone.remove()
    flipClone = null
  }
}

function getViewportCenter(): { top: number; left: number; width: number; height: number } {
  const vw = window.innerWidth
  const vh = window.innerHeight
  // Account for lightbox content padding (56px top, 64px sides on desktop, 12px on mobile)
  const paddingTop = 56
  const paddingSide = vw <= 768 ? 12 : 64
  const availW = vw - paddingSide * 2
  const availH = vh - paddingTop
  // Max image dimensions: fill 85% of available space
  const maxW = availW * 0.85
  const maxH = availH * 0.85
  // Use the smaller dimension to maintain proportion
  const size = Math.min(maxW, maxH)
  return {
    top: paddingTop + (availH - size) / 2,
    left: paddingSide + (availW - size) / 2,
    width: size,
    height: size,
  }
}

// ─── FLIP Enter Animation ───────────────────────────────────────────

function flipEnter(el: Element, done: () => void) {
  const container = el as HTMLElement
  const source = lightbox.getSourceRect()
  const currentSrc = lightbox.currentItem.value?.src

  // Reduced motion: instant show
  if (reducedMotion.value) {
    gsap.set(container, { opacity: 1 })
    done()
    nextTick(() => containerEl.value?.focus())
    return
  }

  // No source rect (e.g., keyboard navigation) — fallback to scale entrance
  if (!source || !currentSrc) {
    gsap.set(container, { opacity: 0 })
    gsap.to(container, {
      opacity: 1,
      duration: 0.4,
      ease: 'power2.out',
      onComplete: done,
    })
    nextTick(() => {
      if (imageEl.value) {
        gsap.fromTo(imageEl.value, {
          opacity: 0,
          scale: 0.92,
          y: 24,
        }, {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.55,
          ease: 'power3.out',
          force3D: true,
          clearProps: 'scale,y',
        })
      }
      if (captionEl.value) {
        gsap.fromTo(captionEl.value, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.4, delay: 0.25, ease: 'power2.out' })
      }
      containerEl.value?.focus()
    })
    return
  }

  // FLIP: hide real content, create clone, animate
  isFlipAnimating.value = true
  gsap.set(container, { opacity: 1 })

  // Hide the real lightbox content during FLIP
  if (imageEl.value) gsap.set(imageEl.value, { opacity: 0 })
  if (captionEl.value) gsap.set(captionEl.value, { opacity: 0 })

  // Fade in backdrop separately
  if (backdropEl.value) {
    gsap.set(backdropEl.value, { opacity: 0 })
  }

  // Remove any existing clone before creating a new one (prevents orphaned DOM nodes)
  removeFlipClone()

  // Create the flying clone at the source card position
  flipClone = createFlipClone(currentSrc, source)
  const dest = getViewportCenter()

  // Kill any existing FLIP timeline
  flipTl?.kill()
  flipTl = gsap.timeline({
    onComplete() {
      // FLIP done: reveal real content, remove clone
      removeFlipClone()
      isFlipAnimating.value = false
      if (imageEl.value) {
        gsap.set(imageEl.value, { opacity: 1, clearProps: 'all' })
      }
      if (captionEl.value) {
        gsap.fromTo(captionEl.value, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' })
      }
      lightbox.clearSourceRect()
      done()
      nextTick(() => containerEl.value?.focus())
    },
  })

  // Animate backdrop
  flipTl.to(backdropEl.value, {
    opacity: 1,
    duration: 0.4,
    ease: 'power2.out',
  }, 0)

  // Animate clone from source to destination
  flipTl.to(flipClone, {
    top: dest.top,
    left: dest.left,
    width: dest.width,
    height: dest.height,
    borderRadius: '2px',
    duration: 0.5,
    ease: 'power3.out',
    force3D: true,
  }, 0)
}

// ─── FLIP Exit Animation ────────────────────────────────────────────

function flipLeave(el: Element, done: () => void) {
  const container = el as HTMLElement

  // Reduced motion: instant hide
  if (reducedMotion.value) {
    done()
    return
  }

  // Try to find the current artwork's card for the fly-back animation.
  // Use the currently displayed item's ID (not the originally opened one),
  // so the image flies back to the correct card even after next/prev navigation.
  const artworkId = lightbox.currentItem.value?.id
  const cardEl = artworkId
    ? document.querySelector<HTMLElement>(`[data-artwork-id="${artworkId}"]`)
    : null

  // Get the card's current bounding rect (it may have scrolled)
  let targetRect: SourceRect | null = null
  if (cardEl) {
    const domRect = cardEl.getBoundingClientRect()
    const isVisible = domRect.top < window.innerHeight && domRect.bottom > 0
      && domRect.left < window.innerWidth && domRect.right > 0
    if (isVisible) {
      const computedStyle = window.getComputedStyle(cardEl)
      targetRect = {
        top: domRect.top,
        left: domRect.left,
        width: domRect.width,
        height: domRect.height,
        borderRadius: computedStyle.borderRadius,
      }
    }
  }

  const currentSrc = lightbox.currentItem.value?.src

  // No target card visible or no image — simple fade out
  if (!targetRect || !currentSrc) {
    gsap.to(container, {
      opacity: 0,
      duration: 0.3,
      ease: 'power2.in',
      onComplete: done,
    })
    return
  }

  // Get the lightbox image's current position for the clone starting point
  const lightboxImg = container.querySelector<HTMLElement>('.lightbox-image')
  let cloneStart: SourceRect
  if (lightboxImg) {
    const imgRect = lightboxImg.getBoundingClientRect()
    cloneStart = {
      top: imgRect.top,
      left: imgRect.left,
      width: imgRect.width,
      height: imgRect.height,
      borderRadius: '2px',
    }
  } else {
    const dest = getViewportCenter()
    cloneStart = { ...dest, borderRadius: '2px' }
  }

  // Remove any existing clone before creating a new one (prevents orphaned DOM nodes)
  removeFlipClone()

  // Hide the real lightbox content, create clone for fly-back
  if (imageEl.value) gsap.set(imageEl.value, { opacity: 0 })
  flipClone = createFlipClone(currentSrc, cloneStart)

  // Capture local reference so onComplete removes the correct clone
  // even if flipClone is reassigned by a rapid reopen
  const localClone = flipClone

  flipTl?.kill()
  flipTl = gsap.timeline({
    onComplete() {
      localClone?.remove()
      if (flipClone === localClone) flipClone = null
      done()
    },
  })

  // Fade out backdrop
  flipTl.to(backdropEl.value, {
    opacity: 0,
    duration: 0.4,
    ease: 'power2.in',
  }, 0)

  // Hide controls immediately
  const controls = container.querySelectorAll<HTMLElement>('.lightbox-controls, .lightbox-content')
  flipTl.to(controls, {
    opacity: 0,
    duration: 0.15,
    ease: 'power2.in',
  }, 0)

  // Animate clone from lightbox position back to card position
  flipTl.to(flipClone, {
    top: targetRect.top,
    left: targetRect.left,
    width: targetRect.width,
    height: targetRect.height,
    borderRadius: targetRect.borderRadius,
    duration: 0.45,
    ease: 'power3.inOut',
    force3D: true,
  }, 0)
}

// ─── Animated Close (replaces direct lightbox.close for exit FLIP) ──

function animatedClose() {
  if (isFlipAnimating.value) return
  lightbox.close()
}

function onImageLoad() {
  imageLoaded.value = true
}

// Only listen for keyboard events when lightbox is open
watch(() => lightbox.isOpen.value, (open) => {
  if (open) {
    previouslyFocused = document.activeElement
    window.addEventListener('keydown', handleKeydown)
  } else {
    window.removeEventListener('keydown', handleKeydown)
    showArchitect.value = false
    activeTl?.kill()
    activeTl = null
    ;(previouslyFocused as HTMLElement | null)?.focus()
    previouslyFocused = null
  }
})

function getFocusableElements(): HTMLElement[] {
  if (!containerEl.value) return []
  return Array.from(containerEl.value.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR))
    .filter(el => el.offsetParent !== null)
}

function handleKeydown(e: KeyboardEvent) {
  if (!lightbox.isOpen.value) return

  // Focus trap — wrap Tab focus within the dialog
  if (e.key === 'Tab') {
    const focusable = getFocusableElements()
    if (focusable.length === 0) {
      e.preventDefault()
      return
    }

    const first = focusable[0]
    const last = focusable[focusable.length - 1]

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault()
      first.focus()
    }
    return
  }

  // Close architect panel on Escape if open, otherwise close lightbox
  if (e.key === 'Escape') {
    if (showArchitect.value) {
      showArchitect.value = false
    } else {
      animatedClose()
    }
    return
  }
  if (e.key === 'ArrowRight') lightbox.next()
  if (e.key === 'ArrowLeft') lightbox.prev()
  // 'a' key toggles architect panel
  if (e.key === 'a' || e.key === 'A') {
    if (hasOssuaryData.value) toggleArchitect()
  }
}

// Watch copied state to show toast
watch(copied, (isCopied) => {
  if (isCopied) {
    showToast.value = true
    if (toastTimeoutId) clearTimeout(toastTimeoutId)
    toastTimeoutId = setTimeout(() => {
      showToast.value = false
    }, 3000)
  }
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
  activeTl?.kill()
  flipTl?.kill()
  removeFlipClone()
  if (toastTimeoutId) clearTimeout(toastTimeoutId)
})
</script>

<template>
  <Transition :css="false" @enter="flipEnter" @leave="flipLeave">
    <div
      v-if="lightbox.isOpen.value"
      ref="containerEl"
      tabindex="-1"
      class="fixed inset-0 z-[60] flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      :aria-label="`${lightbox.currentItem.value?.title || 'Artwork'} — Lightbox`"
      @click="onBackdropClick"
      @touchstart.passive="onTouchStart"
      @touchmove="onTouchMove"
      @touchend="onTouchEnd"
    >
      <!-- Backdrop — separate element so FLIP can control its opacity independently -->
      <div
        ref="backdropEl"
        class="absolute inset-0 bg-black/95 backdrop-blur-xl"
      />

      <!-- Top bar -->
      <div class="lightbox-controls absolute top-0 left-0 right-0 flex items-center justify-between px-5 md:px-8 py-5 z-10">
        <!-- Counter -->
        <div class="font-body text-xs text-lavender-300 tracking-wider tabular-nums">
          <span class="text-lavender-200">{{ String(lightbox.currentIndex.value + 1).padStart(2, '0') }}</span>
          <span class="mx-1.5">/</span>
          <span>{{ String(lightbox.total.value).padStart(2, '0') }}</span>
        </div>

        <div class="flex items-center gap-2">
          <!-- Resonance Ripple — Like button -->
          <ResonanceButton
            v-if="lightbox.currentItem.value?.id"
            :artwork-id="lightbox.currentItem.value.id"
            size="md"
          />

          <!-- Architect Panel toggle -->
          <button
            v-if="hasOssuaryData"
            class="btn-press schema-button group"
            :class="showArchitect ? 'active' : ''"
            aria-label="View prompt architecture"
            title="View prompt architecture"
            :aria-pressed="showArchitect"
            @click.stop="toggleArchitect"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" class="transition-transform duration-200 group-hover:rotate-12">
              <path d="M4 2v4a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2V2" />
              <circle cx="4" cy="2" r="1" />
              <circle cx="10" cy="2" r="1" />
              <line x1="7" y1="8" x2="7" y2="12" />
              <circle cx="7" cy="12" r="1" />
            </svg>
            <span class="hidden sm:inline">Schema</span>
          </button>

          <!-- Buy Print -->
          <NuxtLink
            v-if="printProductForCurrent"
            :to="`/shop/${printProductForCurrent.id}`"
            class="btn-press schema-button group"
            aria-label="Buy print of this artwork"
            title="Buy print"
            @click.stop
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="transition-transform duration-200 group-hover:scale-110">
              <circle cx="8" cy="21" r="1" /><circle cx="19" cy="21" r="1" />
              <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
            </svg>
            <span class="hidden sm:inline">Buy Print</span>
          </NuxtLink>

          <!-- Info toggle -->
          <button
            class="btn-press w-10 h-10 flex items-center justify-center rounded-full text-lavender-400 hover:text-lavender-100 transition-colors duration-200 cursor-hover"
            :class="showCaption ? 'bg-white/10' : 'bg-white/5'"
            aria-label="Toggle info"
            @click="toggleCaption"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
              <circle cx="8" cy="8" r="6.5" />
              <line x1="8" y1="7" x2="8" y2="11" />
              <circle cx="8" cy="5" r="0.5" fill="currentColor" stroke="none" />
            </svg>
          </button>
          <!-- Close button -->
          <button
            class="btn-press w-10 h-10 flex items-center justify-center rounded-full bg-white/5 text-lavender-400 hover:text-lavender-100 hover:bg-white/10 transition-all duration-200 cursor-hover"
            aria-label="Close lightbox"
            @click="animatedClose()"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
              <line x1="2" y1="2" x2="14" y2="14" />
              <line x1="14" y1="2" x2="2" y2="14" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Previous arrow -->
      <button
        v-if="lightbox.hasPrev.value"
        class="btn-press absolute left-3 md:left-6 top-1/2 -translate-y-1/2 w-12 h-12 md:w-14 md:h-14 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-lavender-300 hover:text-lavender-100 transition-all duration-200 z-10 cursor-hover group"
        aria-label="Previous artwork"
        @click="lightbox.prev()"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="transition-transform duration-200 group-hover:-translate-x-0.5">
          <polyline points="13 4 7 10 13 16" />
        </svg>
      </button>

      <!-- Next arrow -->
      <button
        v-if="lightbox.hasNext.value"
        class="btn-press absolute right-3 md:right-6 top-1/2 -translate-y-1/2 w-12 h-12 md:w-14 md:h-14 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-lavender-300 hover:text-lavender-100 transition-all duration-200 z-10 cursor-hover group"
        aria-label="Next artwork"
        @click="lightbox.next()"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="transition-transform duration-200 group-hover:translate-x-0.5">
          <polyline points="7 4 13 10 7 16" />
        </svg>
      </button>

      <!-- Content area — image fills viewport -->
      <div
        v-if="lightbox.currentItem.value"
        class="lightbox-content"
        :class="{ 'panel-open': showArchitect }"
        @click.stop="toggleCaption"
      >
        <!-- Image -->
        <div ref="imageEl" class="lightbox-image-wrap">
          <!-- Loading indicator -->
          <div
            v-if="!imageLoaded && lightbox.currentItem.value.src"
            class="absolute inset-0 flex flex-col items-center justify-center gap-4 z-10"
          >
            <div class="relative w-12 h-12">
              <div class="absolute inset-0 rounded-full border border-lavender-400/10" />
              <div class="absolute inset-0 rounded-full border border-transparent border-t-accent-red/60 animate-spin" style="animation-duration: 0.8s" />
              <div class="absolute inset-1.5 rounded-full border border-transparent border-b-lavender-300/30 animate-spin" style="animation-duration: 1.4s; animation-direction: reverse" />
            </div>
            <span class="font-body text-[10px] uppercase tracking-[0.2em] text-lavender-400/40">Loading</span>
          </div>

          <img
            v-if="lightbox.currentItem.value.src"
            :key="lightbox.currentIndex.value"
            :src="lightbox.currentItem.value.src"
            :alt="lightbox.currentItem.value.title"
            class="lightbox-image select-none"
            :class="imageLoaded ? 'opacity-100' : 'opacity-0'"
            draggable="false"
            @load="onImageLoad"
          >

          <!-- Fallback if no image -->
          <div
            v-else
            class="max-w-4xl w-full bg-gradient-to-br from-dark-700 to-dark-800 rounded-lg flex items-center justify-center aspect-[4/3]"
          >
            <span class="font-display text-lg text-lavender-400 select-none">
              {{ lightbox.currentItem.value.title }}
            </span>
          </div>
        </div>

        <!-- Caption overlay — anchored to bottom of viewport -->
        <Transition name="caption-fade">
          <div
            v-if="showCaption && !showArchitect"
            ref="captionEl"
            class="absolute bottom-0 left-0 right-0 px-6 md:px-24 pb-8 md:pb-6 pt-16 pointer-events-none"
            style="background: linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 60%, transparent 100%)"
          >
            <div class="max-w-2xl mx-auto text-center pointer-events-auto max-h-[40vh] overflow-y-auto">
              <h3 class="font-display text-xl md:text-2xl lg:text-3xl text-white font-semibold">
                {{ lightbox.currentItem.value.title }}
              </h3>
              <p
                v-if="lightbox.currentItem.value.medium"
                class="text-xs text-lavender-300/70 mt-2 uppercase tracking-[0.15em]"
              >
                {{ lightbox.currentItem.value.medium }}<span v-if="lightbox.currentItem.value.year"> &middot; {{ lightbox.currentItem.value.year }}</span>
              </p>
              <p
                v-if="lightbox.currentItem.value.description"
                class="text-sm text-lavender-200/60 mt-3 leading-relaxed font-body max-w-lg mx-auto"
              >
                {{ lightbox.currentItem.value.description }}
              </p>
              <div class="flex justify-center mt-3">
                <ArtworkStats :artwork-id="lightbox.currentItem.value.id" />
              </div>
            </div>
          </div>
        </Transition>
      </div>

      <!-- Mobile scrim behind bottom sheet -->
      <Transition name="scrim-fade">
        <div
          v-if="showArchitect && isMobile"
          class="absolute inset-0 bg-black/50 z-[15]"
          @click="showArchitect = false"
        />
      </Transition>

      <!-- Architect Panel — slides in from right on desktop, up from bottom on mobile -->
      <ArchitectPanel
        v-if="lightbox.currentItem.value"
        :item="lightbox.currentItem.value"
        :visible="showArchitect"
        @close="showArchitect = false"
      />

      <!-- Keyboard hints (desktop only) -->
      <Transition name="caption-fade">
        <div
          v-if="!isMobile && !showArchitect && showCaption"
          class="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 pointer-events-none"
        >
          <div class="flex items-center gap-4 px-4 py-2 rounded-full bg-white/[0.04] backdrop-blur-sm border border-white/[0.06]">
            <span class="flex items-center gap-1.5 text-[10px] text-lavender-400/40 font-body tracking-wide">
              <kbd class="px-1.5 py-0.5 rounded bg-white/[0.06] text-lavender-300/50 font-mono text-[9px]">&larr;</kbd>
              <kbd class="px-1.5 py-0.5 rounded bg-white/[0.06] text-lavender-300/50 font-mono text-[9px]">&rarr;</kbd>
              Navigate
            </span>
            <span v-if="hasOssuaryData" class="flex items-center gap-1.5 text-[10px] text-lavender-400/40 font-body tracking-wide">
              <kbd class="px-1.5 py-0.5 rounded bg-white/[0.06] text-lavender-300/50 font-mono text-[9px]">A</kbd>
              Schema
            </span>
            <span class="flex items-center gap-1.5 text-[10px] text-lavender-400/40 font-body tracking-wide">
              <kbd class="px-1.5 py-0.5 rounded bg-white/[0.06] text-lavender-300/50 font-mono text-[9px]">Esc</kbd>
              Close
            </span>
          </div>
        </div>
      </Transition>

      <!-- Toast notification -->
      <Transition name="toast-fade">
        <div
          v-if="showToast && copiedType"
          class="fixed bottom-8 left-1/2 -translate-x-1/2 z-30 pointer-events-none"
        >
          <div class="toast-pill backdrop-blur-md bg-dark-900/80 border border-dark-700/50 px-4 py-2.5 rounded-full shadow-xl">
            <span class="text-accent-red font-medium text-sm flex items-center gap-2">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="2 6 5 9 10 3" />
              </svg>
              <span v-if="copiedType === 'fork'">Template copied — paste into Midjourney</span>
              <span v-else>Prompt copied — paste into Midjourney</span>
            </span>
          </div>
        </div>
      </Transition>
    </div>
  </Transition>
</template>

<style scoped>
.caption-fade-enter-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.caption-fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.caption-fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}
.caption-fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

/* Content area fills viewport with room for controls */
.lightbox-content {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 56px 64px 0;
  transition: padding-right 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  will-change: padding;
}

.lightbox-content.panel-open {
  padding-right: 360px;
}

@media (max-width: 768px) {
  .lightbox-content {
    padding: 56px 12px 0;
  }

  .lightbox-content.panel-open {
    padding-right: 12px;
  }
}

/* Image wrapper fills available space */
.lightbox-image-wrap {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  will-change: transform, opacity;
}

/* Image fills container while maintaining aspect ratio */
.lightbox-image {
  max-width: 100%;
  max-height: 100%;
  width: auto;
  height: auto;
  object-fit: contain;
  transition: opacity 0.3s ease;
  box-shadow: 0 0 80px rgba(0, 0, 0, 0.6);
  border-radius: 2px;
  image-rendering: high-quality;
}

/* Schema button */
.schema-button {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 100px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: #a5b0c8;
  font-family: var(--font-body, 'PP Neue Montreal', sans-serif);
  font-size: 10px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  transition: all 0.25s ease;
  cursor: pointer;
}

.schema-button:hover {
  background: rgba(237, 84, 77, 0.08);
  border-color: rgba(237, 84, 77, 0.2);
  color: #ed544d;
}

.schema-button.active {
  background: rgba(237, 84, 77, 0.12);
  border-color: rgba(237, 84, 77, 0.25);
  color: #ed544d;
}

/* Toast notification */
.toast-pill {
  animation: toast-float 3s ease-in-out infinite;
}

@keyframes toast-float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-3px);
  }
}

.toast-fade-enter-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.toast-fade-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.toast-fade-enter-from {
  opacity: 0;
  transform: translateY(12px);
}

.toast-fade-leave-to {
  opacity: 0;
  transform: translateY(-12px);
}

/* Mobile scrim fade transition */
.scrim-fade-enter-active,
.scrim-fade-leave-active {
  transition: opacity 0.3s ease;
}

.scrim-fade-enter-from,
.scrim-fade-leave-to {
  opacity: 0;
}
</style>
