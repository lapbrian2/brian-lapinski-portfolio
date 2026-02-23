<script setup lang="ts">
const lightbox = useLightbox()

function onBackdropClick(e: MouseEvent) {
  if (e.target === e.currentTarget) {
    lightbox.close()
  }
}

onMounted(() => {
  window.addEventListener('keydown', lightbox.handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', lightbox.handleKeydown)
})
</script>

<template>
  <Transition name="lightbox">
    <div
      v-if="lightbox.isOpen.value"
      class="fixed inset-0 z-[60] bg-dark-900/95 backdrop-blur-sm flex items-center justify-center"
      @click="onBackdropClick"
    >
      <!-- Close button -->
      <button
        class="absolute top-6 right-6 text-2xl text-lavender-300 hover:text-lavender-100 transition-colors duration-200 z-10"
        aria-label="Close lightbox"
        @click="lightbox.close()"
      >
        &times;
      </button>

      <!-- Previous arrow -->
      <button
        v-if="lightbox.hasPrev.value"
        class="absolute left-6 top-1/2 -translate-y-1/2 text-3xl text-lavender-300 hover:text-lavender-100 transition-colors duration-200 z-10"
        aria-label="Previous artwork"
        @click="lightbox.prev()"
      >
        &lsaquo;
      </button>

      <!-- Next arrow -->
      <button
        v-if="lightbox.hasNext.value"
        class="absolute right-6 top-1/2 -translate-y-1/2 text-3xl text-lavender-300 hover:text-lavender-100 transition-colors duration-200 z-10"
        aria-label="Next artwork"
        @click="lightbox.next()"
      >
        &rsaquo;
      </button>

      <!-- Content area -->
      <div
        v-if="lightbox.currentItem.value"
        class="flex flex-col items-center px-16"
        @click.stop
      >
        <!-- Image placeholder -->
        <div
          class="max-w-4xl w-full max-h-[80vh] bg-dark-700 bg-gradient-to-br from-dark-700 to-dark-800 rounded-lg flex items-center justify-center aspect-[4/3]"
        >
          <span class="font-display text-lg text-lavender-400 select-none">
            {{ lightbox.currentItem.value.title }}
          </span>
        </div>

        <!-- Caption -->
        <div class="mt-4 text-center">
          <h3 class="font-display text-xl text-lavender-100">
            {{ lightbox.currentItem.value.title }}
          </h3>
          <p
            v-if="lightbox.currentItem.value.medium"
            class="text-sm text-lavender-300 mt-1"
          >
            {{ lightbox.currentItem.value.medium }}
          </p>
        </div>
      </div>
    </div>
  </Transition>
</template>
