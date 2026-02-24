<script setup lang="ts">
import gsap from 'gsap'

const lightbox = useLightbox()
const imageEl = ref<HTMLElement | null>(null)
const captionEl = ref<HTMLElement | null>(null)
const containerEl = ref<HTMLElement | null>(null)
const imageLoaded = ref(false)
const showCaption = ref(true)
const showArchitect = ref(false)

// Active transition timeline — kill on rapid navigation
let activeTl: gsap.core.Timeline | null = null

// Focus management state
let previouslyFocused: Element | null = null

const FOCUSABLE_SELECTOR = 'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'

// Touch / swipe state
let touchStartX = 0
let touchStartY = 0
let touchDeltaX = 0
const SWIPE_THRESHOLD = 50

// Check if current item has Ossuary data
const hasOssuaryData = computed(() => {
  const item = lightbox.currentItem.value
  return !!(item?.rawPrompt || item?.promptNodes?.length)
})

function onBackdropClick(e: MouseEvent) {
  if (e.target === e.currentTarget) {
    lightbox.close()
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
}

function onTouchMove(e: TouchEvent) {
  touchDeltaX = e.touches[0].clientX - touchStartX
  const deltaY = Math.abs(e.touches[0].clientY - touchStartY)
  // Only track horizontal swipes
  if (Math.abs(touchDeltaX) > deltaY && imageEl.value) {
    gsap.set(imageEl.value, { x: touchDeltaX * 0.4, rotation: touchDeltaX * 0.02, force3D: true })
  }
}

function onTouchEnd() {
  if (Math.abs(touchDeltaX) > SWIPE_THRESHOLD) {
    if (touchDeltaX > 0 && lightbox.hasPrev.value) {
      lightbox.prev()
    } else if (touchDeltaX < 0 && lightbox.hasNext.value) {
      lightbox.next()
    } else {
      // Snap back — elastic for edge bounce feel
      if (imageEl.value) gsap.to(imageEl.value, { x: 0, rotation: 0, duration: 0.5, ease: 'elastic.out(1, 0.5)', force3D: true })
    }
  } else {
    if (imageEl.value) gsap.to(imageEl.value, { x: 0, rotation: 0, duration: 0.3, ease: 'power2.out', force3D: true })
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

// Entrance animation
function onEnter() {
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
  })
}

function onImageLoad() {
  imageLoaded.value = true
}

// Only listen for keyboard events when lightbox is open
watch(() => lightbox.isOpen.value, (open) => {
  if (open) {
    previouslyFocused = document.activeElement
    window.addEventListener('keydown', handleKeydown)
    nextTick(() => {
      containerEl.value?.focus()
    })
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
      lightbox.close()
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

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
  activeTl?.kill()
})
</script>

<template>
  <Transition name="lightbox" @after-enter="onEnter">
    <div
      v-if="lightbox.isOpen.value"
      ref="containerEl"
      tabindex="-1"
      class="fixed inset-0 z-[60] bg-black/95 backdrop-blur-xl flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label="Artwork lightbox"
      @click="onBackdropClick"
      @touchstart.passive="onTouchStart"
      @touchmove.passive="onTouchMove"
      @touchend="onTouchEnd"
    >
      <!-- Top bar -->
      <div class="absolute top-0 left-0 right-0 flex items-center justify-between px-5 md:px-8 py-5 z-10">
        <!-- Counter -->
        <div class="font-body text-xs text-lavender-400/60 tracking-wider tabular-nums">
          <span class="text-lavender-200">{{ String(lightbox.currentIndex.value + 1).padStart(2, '0') }}</span>
          <span class="mx-1.5">/</span>
          <span>{{ String(lightbox.total.value).padStart(2, '0') }}</span>
        </div>

        <div class="flex items-center gap-2">
          <!-- Architect Panel toggle -->
          <button
            v-if="hasOssuaryData"
            class="schema-button group"
            :class="showArchitect ? 'active' : ''"
            aria-label="View prompt architecture"
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

          <!-- Info toggle -->
          <button
            class="w-10 h-10 flex items-center justify-center rounded-full text-lavender-400 hover:text-lavender-100 transition-colors duration-200 cursor-hover"
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
            class="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 text-lavender-400 hover:text-lavender-100 hover:bg-white/10 transition-all duration-200 cursor-hover"
            aria-label="Close lightbox"
            @click="lightbox.close()"
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
        class="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 w-12 h-12 md:w-14 md:h-14 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-lavender-300 hover:text-lavender-100 transition-all duration-200 z-10 cursor-hover group"
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
        class="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 w-12 h-12 md:w-14 md:h-14 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-lavender-300 hover:text-lavender-100 transition-all duration-200 z-10 cursor-hover group"
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
          />

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
            class="absolute bottom-0 left-0 right-0 px-6 md:px-24 pb-6 pt-16 pointer-events-none"
            style="background: linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 60%, transparent 100%)"
          >
            <div class="max-w-2xl mx-auto text-center pointer-events-auto">
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
            </div>
          </div>
        </Transition>
      </div>

      <!-- Architect Panel — slides in from right -->
      <ArchitectPanel
        v-if="lightbox.currentItem.value"
        :item="lightbox.currentItem.value"
        :visible="showArchitect"
        @close="showArchitect = false"
      />
    </div>
  </Transition>
</template>

<style scoped>
.lightbox-enter-active {
  transition: opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}
.lightbox-leave-active {
  transition: opacity 0.3s cubic-bezier(0.55, 0, 1, 0.45);
}
.lightbox-enter-from,
.lightbox-leave-to {
  opacity: 0;
}

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
  font-family: var(--font-body, 'Inter', sans-serif);
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
</style>
