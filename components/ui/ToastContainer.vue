<script setup lang="ts">
import gsap from 'gsap'
import type { Toast } from '~/composables/useToast'

const { toasts, dismiss } = useToast()

// --- GSAP TransitionGroup hooks ---

function onBeforeEnter(el: Element) {
  gsap.set(el, { opacity: 0, y: 24, scale: 0.96 })
}

function onEnter(el: Element, done: () => void) {
  gsap.to(el, {
    opacity: 1,
    y: 0,
    scale: 1,
    duration: 0.35,
    ease: 'power2.out',
    onComplete: done,
  })
}

function onLeave(el: Element, done: () => void) {
  gsap.to(el, {
    opacity: 0,
    x: 80,
    scale: 0.95,
    duration: 0.25,
    ease: 'power2.in',
    onComplete: done,
  })
}

// --- Icon and accent color per type ---

const typeConfig: Record<Toast['type'], { accentClass: string; bgClass: string }> = {
  success: { accentClass: 'text-emerald-400', bgClass: 'bg-emerald-400/10' },
  error:   { accentClass: 'text-accent-red',   bgClass: 'bg-accent-red/10' },
  info:    { accentClass: 'text-accent-blue',   bgClass: 'bg-accent-blue/10' },
}
</script>

<template>
  <div
    class="fixed bottom-6 right-6 z-[70] flex flex-col-reverse gap-3 max-sm:bottom-4 max-sm:right-4 max-sm:left-4"
    aria-live="polite"
    aria-label="Notifications"
  >
    <TransitionGroup
      :css="false"
      @before-enter="onBeforeEnter"
      @enter="onEnter"
      @leave="onLeave"
    >
      <div
        v-for="toast in toasts"
        :key="toast.id"
        role="status"
        class="flex items-start gap-3 w-80 max-sm:w-full px-4 py-3 rounded-xl border border-lavender-400/10 bg-dark-700/95 backdrop-blur-sm shadow-lg shadow-black/30 font-body"
      >
        <!-- Type icon -->
        <div
          class="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center"
          :class="typeConfig[toast.type].bgClass"
        >
          <!-- Success: checkmark -->
          <svg
            v-if="toast.type === 'success'"
            class="w-3.5 h-3.5"
            :class="typeConfig[toast.type].accentClass"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M3.5 8.5L6.5 11.5L12.5 4.5" />
          </svg>

          <!-- Error: X circle -->
          <svg
            v-else-if="toast.type === 'error'"
            class="w-3.5 h-3.5"
            :class="typeConfig[toast.type].accentClass"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M5 5L11 11M11 5L5 11" />
          </svg>

          <!-- Info: i circle -->
          <svg
            v-else
            class="w-3.5 h-3.5"
            :class="typeConfig[toast.type].accentClass"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M8 5V5.01M8 7.5V11" />
          </svg>
        </div>

        <!-- Message -->
        <span class="flex-1 text-sm text-lavender-200 leading-snug">
          {{ toast.message }}
        </span>

        <!-- Close button -->
        <button
          class="flex-shrink-0 mt-0.5 p-0.5 rounded-md text-lavender-400 transition-colors hover:text-lavender-200 hover:bg-lavender-400/10"
          aria-label="Dismiss notification"
          @click="dismiss(toast.id)"
        >
          <svg
            class="w-3.5 h-3.5"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M4 4L12 12M12 4L4 12" />
          </svg>
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>
