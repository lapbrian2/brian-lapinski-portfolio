<template>
  <div v-if="views > 0 || likes > 0" class="flex items-center gap-4 text-lavender-400/60">
    <!-- Views -->
    <div v-if="views > 0" class="flex items-center gap-1.5">
      <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
      <span ref="viewsEl" class="font-body text-xs tabular-nums">{{ displayViews }}</span>
    </div>

    <!-- Likes -->
    <div v-if="likes > 0" class="flex items-center gap-1.5">
      <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
      <span ref="likesEl" class="font-body text-xs tabular-nums">{{ displayLikes }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import gsap from 'gsap'

const props = defineProps<{
  artworkId: string
}>()

const views = ref(0)
const likes = ref(0)
const displayViews = ref(0)
const displayLikes = ref(0)

let viewsTween: gsap.core.Tween | null = null
let likesTween: gsap.core.Tween | null = null

watch(
  () => props.artworkId,
  async (id) => {
    if (!id) return
    try {
      const res = await $fetch<{ views: number; likes: number }>(`/api/artworks/${id}/stats`)
      views.value = res.views || 0
      likes.value = res.likes || 0

      // Animate number tween with GSAP
      if (import.meta.client) {
        viewsTween?.kill()
        likesTween?.kill()
        viewsTween = gsap.to(displayViews, { value: views.value, duration: 0.8, ease: 'power2.out', roundProps: 'value' })
        likesTween = gsap.to(displayLikes, { value: likes.value, duration: 0.8, ease: 'power2.out', roundProps: 'value' })
      } else {
        displayViews.value = views.value
        displayLikes.value = likes.value
      }
    } catch {
      // Silently fail
    }
  },
  { immediate: true },
)

onUnmounted(() => {
  viewsTween?.kill()
  likesTween?.kill()
})
</script>
