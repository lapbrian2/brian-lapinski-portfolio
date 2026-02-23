<script setup lang="ts">
import gsap from 'gsap'

const lightbox = useLightbox()
const imageEl = ref<HTMLElement | null>(null)
const captionEl = ref<HTMLElement | null>(null)
const containerEl = ref<HTMLElement | null>(null)
const imageLoaded = ref(false)

// Touch / swipe state
let touchStartX = 0
let touchStartY = 0
let touchDeltaX = 0
const SWIPE_THRESHOLD = 50

function onBackdropClick(e: MouseEvent) {
  if (e.target === e.currentTarget) {
    lightbox.close()
  }
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
    gsap.set(imageEl.value, { x: touchDeltaX * 0.4, rotation: touchDeltaX * 0.02 })
  }
}

function onTouchEnd() {
  if (Math.abs(touchDeltaX) > SWIPE_THRESHOLD) {
    if (touchDeltaX > 0 && lightbox.hasPrev.value) {
      lightbox.prev()
    } else if (touchDeltaX < 0 && lightbox.hasNext.value) {
      lightbox.next()
    } else {
      // Snap back
      if (imageEl.value) gsap.to(imageEl.value, { x: 0, rotation: 0, duration: 0.4, ease: 'elastic.out(1, 0.6)' })
    }
  } else {
    if (imageEl.value) gsap.to(imageEl.value, { x: 0, rotation: 0, duration: 0.3, ease: 'power2.out' })
  }
  touchDeltaX = 0
}

// Animate image transition on index change
watch(() => lightbox.currentIndex.value, (_, oldVal) => {
  if (oldVal === undefined) return
  imageLoaded.value = false
  animateImageTransition()
})

function animateImageTransition() {
  if (!imageEl.value) return
  const dir = lightbox.direction.value === 'next' ? 1 : -1
  const tl = gsap.timeline()

  tl.fromTo(imageEl.value, {
    opacity: 0,
    x: 80 * dir,
    scale: 0.92,
    rotation: 2 * dir,
  }, {
    opacity: 1,
    x: 0,
    scale: 1,
    rotation: 0,
    duration: 0.5,
    ease: 'power3.out',
  })

  if (captionEl.value) {
    tl.fromTo(captionEl.value, {
      opacity: 0,
      y: 16,
    }, {
      opacity: 1,
      y: 0,
      duration: 0.4,
      ease: 'power2.out',
    }, '-=0.3')
  }
}

// Entrance animation
function onEnter() {
  nextTick(() => {
    if (imageEl.value) {
      gsap.fromTo(imageEl.value, {
        opacity: 0,
        scale: 0.85,
        y: 40,
      }, {
        opacity: 1,
        scale: 1,
        y: 0,
        duration: 0.6,
        ease: 'power3.out',
      })
    }
    if (captionEl.value) {
      gsap.fromTo(captionEl.value, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.4, delay: 0.2, ease: 'power2.out' })
    }
  })
}

function onImageLoad() {
  imageLoaded.value = true
}

onMounted(() => {
  window.addEventListener('keydown', lightbox.handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', lightbox.handleKeydown)
})
</script>

<template>
  <Transition name="lightbox" @after-enter="onEnter">
    <div
      v-if="lightbox.isOpen.value"
      ref="containerEl"
      class="fixed inset-0 z-[60] bg-dark-900/95 backdrop-blur-md flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label="Artwork lightbox"
      @click="onBackdropClick"
      @touchstart.passive="onTouchStart"
      @touchmove.passive="onTouchMove"
      @touchend="onTouchEnd"
    >
      <!-- Close button -->
      <button
        class="absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-full glass text-lavender-300 hover:text-lavender-100 transition-colors duration-200 z-10 cursor-hover"
        aria-label="Close lightbox"
        @click="lightbox.close()"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
          <line x1="2" y1="2" x2="14" y2="14" />
          <line x1="14" y1="2" x2="2" y2="14" />
        </svg>
      </button>

      <!-- Counter -->
      <div class="absolute top-6 left-6 font-body text-xs text-lavender-400/60 tracking-wider tabular-nums z-10">
        <span class="text-lavender-200">{{ String(lightbox.currentIndex.value + 1).padStart(2, '0') }}</span>
        <span class="mx-1.5">/</span>
        <span>{{ String(lightbox.total.value).padStart(2, '0') }}</span>
      </div>

      <!-- Previous arrow -->
      <button
        v-if="lightbox.hasPrev.value"
        class="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center rounded-full glass text-lavender-300 hover:text-lavender-100 transition-all duration-200 z-10 cursor-hover group"
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
        class="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center rounded-full glass text-lavender-300 hover:text-lavender-100 transition-all duration-200 z-10 cursor-hover group"
        aria-label="Next artwork"
        @click="lightbox.next()"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="transition-transform duration-200 group-hover:translate-x-0.5">
          <polyline points="7 4 13 10 7 16" />
        </svg>
      </button>

      <!-- Content area -->
      <div
        v-if="lightbox.currentItem.value"
        class="flex flex-col items-center px-6 md:px-20 max-w-6xl w-full"
        @click.stop
      >
        <!-- Image with transition -->
        <div ref="imageEl" class="relative">
          <!-- Loading spinner -->
          <div
            v-if="!imageLoaded && lightbox.currentItem.value.src"
            class="absolute inset-0 flex items-center justify-center"
          >
            <div class="w-8 h-8 border-2 border-lavender-400/30 border-t-lavender-100 rounded-full animate-spin" />
          </div>

          <img
            v-if="lightbox.currentItem.value.src"
            :key="lightbox.currentIndex.value"
            :src="lightbox.currentItem.value.src"
            :alt="lightbox.currentItem.value.title"
            class="max-w-full max-h-[70vh] w-auto h-auto rounded-lg object-contain select-none shadow-2xl shadow-black/30"
            draggable="false"
            @load="onImageLoad"
          >

          <!-- Fallback if no image -->
          <div
            v-else
            class="max-w-4xl w-full max-h-[78vh] bg-gradient-to-br from-dark-700 to-dark-800 rounded-lg flex items-center justify-center aspect-[4/3]"
          >
            <span class="font-display text-lg text-lavender-400 select-none">
              {{ lightbox.currentItem.value.title }}
            </span>
          </div>
        </div>

        <!-- Caption -->
        <div ref="captionEl" class="mt-6 text-center max-w-xl mx-auto">
          <h3 class="font-display text-xl md:text-2xl text-lavender-100">
            {{ lightbox.currentItem.value.title }}
          </h3>
          <p
            v-if="lightbox.currentItem.value.medium"
            class="text-xs text-lavender-400 mt-2 uppercase tracking-[0.15em]"
          >
            {{ lightbox.currentItem.value.medium }}<span v-if="lightbox.currentItem.value.year"> &middot; {{ lightbox.currentItem.value.year }}</span>
          </p>
          <p
            v-if="lightbox.currentItem.value.description"
            class="text-sm text-lavender-300/70 mt-3 leading-relaxed font-body"
          >
            {{ lightbox.currentItem.value.description }}
          </p>
        </div>
      </div>
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
</style>
