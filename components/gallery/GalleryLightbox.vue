<script setup lang="ts">
import gsap from 'gsap'

const lightbox = useLightbox()
const imageEl = ref<HTMLElement | null>(null)
const captionEl = ref<HTMLElement | null>(null)
const containerEl = ref<HTMLElement | null>(null)
const imageLoaded = ref(false)
const showCaption = ref(true)

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

function toggleCaption() {
  showCaption.value = !showCaption.value
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
    x: 60 * dir,
    scale: 0.95,
  }, {
    opacity: 1,
    x: 0,
    scale: 1,
    duration: 0.5,
    ease: 'power3.out',
  })

  if (captionEl.value) {
    tl.fromTo(captionEl.value, {
      opacity: 0,
      y: 12,
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
        scale: 0.9,
        y: 30,
      }, {
        opacity: 1,
        scale: 1,
        y: 0,
        duration: 0.6,
        ease: 'power3.out',
      })
    }
    if (captionEl.value) {
      gsap.fromTo(captionEl.value, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.4, delay: 0.3, ease: 'power2.out' })
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

        <div class="flex items-center gap-3">
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
        class="relative flex items-center justify-center w-full h-full px-4 md:px-20 py-14"
        @click.stop="toggleCaption"
      >
        <!-- Image -->
        <div ref="imageEl" class="relative flex items-center justify-center w-full h-full">
          <!-- Loading spinner -->
          <div
            v-if="!imageLoaded && lightbox.currentItem.value.src"
            class="absolute inset-0 flex items-center justify-center"
          >
            <div class="w-10 h-10 border-2 border-lavender-400/20 border-t-lavender-100 rounded-full animate-spin" />
          </div>

          <NuxtImg
            v-if="lightbox.currentItem.value.src"
            :key="lightbox.currentIndex.value"
            :src="lightbox.currentItem.value.src"
            :alt="lightbox.currentItem.value.title"
            width="2400"
            height="1800"
            format="webp"
            quality="92"
            class="lightbox-image max-w-full max-h-full w-auto h-auto object-contain select-none"
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
            v-if="showCaption"
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

.lightbox-image {
  transition: opacity 0.3s ease;
  box-shadow: 0 0 80px rgba(0, 0, 0, 0.6);
}
</style>
