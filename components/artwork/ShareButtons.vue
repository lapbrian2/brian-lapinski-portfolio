<template>
  <div class="flex items-center gap-3">
    <span class="font-body text-xs uppercase tracking-[0.15em] text-lavender-500/60">Share</span>

    <!-- Web Share API (mobile / supported browsers) -->
    <button
      v-if="canShare"
      class="share-btn"
      aria-label="Share this artwork"
      @click="nativeShare"
    >
      <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
        <polyline points="16 6 12 2 8 6" />
        <line x1="12" y1="2" x2="12" y2="15" />
      </svg>
    </button>

    <!-- X / Twitter -->
    <a
      :href="twitterUrl"
      target="_blank"
      rel="noopener noreferrer"
      class="share-btn"
      aria-label="Share on X"
    >
      <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    </a>

    <!-- Pinterest -->
    <a
      :href="pinterestUrl"
      target="_blank"
      rel="noopener noreferrer"
      class="share-btn"
      aria-label="Share on Pinterest"
    >
      <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0a12 12 0 0 0-4.373 23.178c-.07-.633-.133-1.606.028-2.298.145-.625.938-3.977.938-3.977s-.239-.479-.239-1.187c0-1.113.645-1.943 1.448-1.943.683 0 1.012.512 1.012 1.127 0 .687-.437 1.714-.663 2.668-.189.796.4 1.446 1.185 1.446 1.422 0 2.515-1.5 2.515-3.664 0-1.915-1.377-3.254-3.342-3.254-2.276 0-3.612 1.707-3.612 3.471 0 .688.265 1.425.595 1.826a.24.24 0 0 1 .056.23c-.061.252-.196.796-.222.907-.035.146-.116.177-.268.107-1-.465-1.624-1.926-1.624-3.1 0-2.523 1.834-4.84 5.286-4.84 2.775 0 4.932 1.977 4.932 4.62 0 2.757-1.739 4.976-4.151 4.976-.811 0-1.573-.421-1.834-.919l-.498 1.902c-.181.695-.669 1.566-.995 2.097A12 12 0 1 0 12 0z" />
      </svg>
    </a>

    <!-- Copy Link -->
    <button
      class="share-btn"
      :aria-label="copied ? 'Link copied' : 'Copy link'"
      @click="copyLink"
    >
      <svg v-if="!copied" class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
      </svg>
      <svg v-else class="w-4 h-4 text-emerald-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  title: string
  url: string
  imageUrl: string
}>()

const copied = ref(false)
const canShare = ref(false)

onMounted(() => {
  canShare.value = typeof navigator !== 'undefined' && !!navigator.share
})

const twitterUrl = computed(() => {
  const text = encodeURIComponent(`${props.title} — AI Art by Brian Lapinski`)
  const url = encodeURIComponent(props.url)
  return `https://twitter.com/intent/tweet?text=${text}&url=${url}`
})

const pinterestUrl = computed(() => {
  const url = encodeURIComponent(props.url)
  const media = encodeURIComponent(props.imageUrl)
  const description = encodeURIComponent(`${props.title} — AI Art by Brian Lapinski`)
  return `https://pinterest.com/pin/create/button/?url=${url}&media=${media}&description=${description}`
})

async function nativeShare() {
  try {
    await navigator.share({
      title: props.title,
      text: `${props.title} — AI Art by Brian Lapinski`,
      url: props.url,
    })
  } catch {
    // User cancelled or share failed — no-op
  }
}

async function copyLink() {
  try {
    await navigator.clipboard.writeText(props.url)
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  } catch {
    // Clipboard API unavailable — no-op
  }
}
</script>

<style scoped>
.share-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: rgba(196, 181, 253, 0.6);
  background: rgba(255, 255, 255, 0.02);
  transition: all 0.2s ease;
}

.share-btn:hover {
  border-color: rgba(255, 255, 255, 0.2);
  color: rgba(196, 181, 253, 1);
  background: rgba(255, 255, 255, 0.05);
}

.share-btn:focus-visible {
  outline: 2px solid #ed544d;
  outline-offset: 2px;
}
</style>
