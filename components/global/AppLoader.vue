<template>
  <div
    v-if="!hidden"
    :class="[
      'fixed inset-0 z-[100] bg-dark-900 flex flex-col items-center justify-center transition-opacity duration-[600ms] ease-in-out',
      loaded ? 'opacity-0 pointer-events-none' : 'opacity-100',
    ]"
    @transitionend="onTransitionEnd"
  >
    <span class="font-display text-6xl font-bold text-lavender-100 mb-8">
      BL
    </span>

    <!-- Loading bar -->
    <div class="w-48 h-[2px] bg-dark-700 rounded-full overflow-hidden">
      <div
        class="h-full bg-accent-red rounded-full transition-all duration-300 ease-out"
        :style="{ width: `${progress}%` }"
      />
    </div>

    <span class="font-body text-xs text-lavender-400 mt-3 tabular-nums">
      {{ Math.round(progress) }}
    </span>
  </div>
</template>

<script setup lang="ts">
import gsap from 'gsap'

const loaded = ref(false)
const hidden = ref(false)
const progress = ref(0)

function onTransitionEnd(): void {
  if (loaded.value) {
    hidden.value = true
  }
}

onMounted(() => {
  const proxy = { value: 0 }

  gsap.to(proxy, {
    value: 100,
    duration: 1.8,
    ease: 'power2.inOut',
    onUpdate: () => {
      progress.value = proxy.value
    },
    onComplete: () => {
      loaded.value = true
    },
  })
})
</script>
