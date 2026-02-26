<script setup lang="ts">
import gsap from 'gsap'
import { useReducedMotion } from '~/composables/useMediaQuery'
import { motion } from '~/composables/useMotion'

const props = withDefaults(defineProps<{
  artworkId: string
  size?: 'sm' | 'md'
}>(), {
  size: 'md',
})

const likes = useLikes()
const reducedMotion = useReducedMotion()

const buttonEl = ref<HTMLElement | null>(null)
const iconEl = ref<HTMLElement | null>(null)
const ringsContainer = ref<HTMLElement | null>(null)
const countEl = ref<HTMLElement | null>(null)

const liked = computed(() => likes.isLiked(props.artworkId))
const likeCount = computed(() => likes.getLikeCount(props.artworkId))
const pending = computed(() => likes.isPending(props.artworkId))

// Size variants
const sizeClasses = computed(() => {
  if (props.size === 'sm') {
    return 'w-8 h-8'
  }
  return 'w-10 h-10'
})

const iconSize = computed(() => props.size === 'sm' ? 14 : 16)

async function handleClick() {
  if (pending.value) return

  const wasLiked = liked.value
  const newLiked = await likes.toggleLike(props.artworkId)

  // Animate only if state changed and motion is allowed
  if (newLiked !== wasLiked && !reducedMotion.value) {
    if (newLiked) {
      animateLike()
    } else {
      animateUnlike()
    }
  }
}

function animateLike() {
  if (!iconEl.value || !ringsContainer.value) return

  const tl = gsap.timeline()

  // Icon scale punch
  tl.to(iconEl.value, {
    scale: 1.3,
    duration: motion.duration.fast,
    ease: motion.ease.bounce,
    force3D: true,
  })
  tl.to(iconEl.value, {
    scale: 1,
    duration: motion.duration.moderate,
    ease: motion.ease.elastic,
    force3D: true,
  })

  // Spawn ripple rings
  spawnRippleRings()

  // Count animation
  if (countEl.value) {
    gsap.fromTo(countEl.value, {
      y: 4,
      scale: 0.8,
      opacity: 0,
    }, {
      y: 0,
      scale: 1,
      opacity: 1,
      duration: motion.duration.normal,
      delay: motion.duration.fast,
      ease: motion.ease.outStrong,
    })
  }
}

function animateUnlike() {
  if (!iconEl.value) return

  gsap.fromTo(iconEl.value, {
    scale: 0.8,
  }, {
    scale: 1,
    duration: motion.duration.normal,
    ease: motion.ease.bounce,
    force3D: true,
  })
}

function spawnRippleRings() {
  if (!ringsContainer.value) return

  // Create 3 expanding ring elements
  for (let i = 0; i < 3; i++) {
    const ring = document.createElement('div')
    ring.className = 'resonance-ring'
    ringsContainer.value.appendChild(ring)

    gsap.fromTo(ring, {
      width: 8,
      height: 8,
      opacity: 0.6,
      borderWidth: '1.5px',
    }, {
      width: props.size === 'sm' ? 48 : 64,
      height: props.size === 'sm' ? 48 : 64,
      opacity: 0,
      borderWidth: '0.5px',
      duration: 0.6 + i * 0.1,
      delay: i * motion.stagger.tight,
      ease: motion.ease.out,
      onComplete: () => {
        ring.remove()
      },
    })
  }
}

// Hover effect (pointer devices only)
function onMouseEnter() {
  if (reducedMotion.value || !iconEl.value) return
  gsap.to(iconEl.value, {
    scale: 1.1,
    duration: motion.duration.fast,
    ease: motion.ease.out,
  })
}

function onMouseLeave() {
  if (reducedMotion.value || !iconEl.value) return
  gsap.to(iconEl.value, {
    scale: 1,
    duration: motion.duration.normal,
    ease: motion.ease.out,
  })
}
</script>

<template>
  <button
    ref="buttonEl"
    class="btn-press resonance-button group relative flex items-center justify-center rounded-full transition-all duration-200 cursor-hover"
    :class="[
      sizeClasses,
      liked
        ? 'bg-accent-red/15 border border-accent-red/30 text-accent-red'
        : 'bg-white/5 border border-white/10 text-lavender-400 hover:text-lavender-100 hover:border-white/20',
    ]"
    :aria-label="liked ? 'Unlike this artwork' : 'Like this artwork'"
    :aria-pressed="liked"
    @click.stop="handleClick"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
  >
    <!-- Ripple rings container (positioned behind icon) -->
    <div
      ref="ringsContainer"
      class="absolute inset-0 flex items-center justify-center pointer-events-none overflow-visible"
    />

    <!-- Concentric circles icon -->
    <svg
      ref="iconEl"
      :width="iconSize"
      :height="iconSize"
      viewBox="0 0 16 16"
      fill="none"
      class="relative z-10 transition-colors duration-200"
    >
      <!-- Outer ring -->
      <circle
        cx="8"
        cy="8"
        r="7"
        stroke="currentColor"
        :stroke-width="liked ? '1' : '1.2'"
        :fill="liked ? 'currentColor' : 'none'"
        :fill-opacity="liked ? '0.15' : '0'"
        class="transition-all duration-300"
      />
      <!-- Middle ring -->
      <circle
        cx="8"
        cy="8"
        r="4.5"
        stroke="currentColor"
        :stroke-width="liked ? '0.8' : '1'"
        :fill="liked ? 'currentColor' : 'none'"
        :fill-opacity="liked ? '0.3' : '0'"
        class="transition-all duration-300"
      />
      <!-- Inner dot -->
      <circle
        cx="8"
        cy="8"
        r="2"
        :fill="liked ? 'currentColor' : 'none'"
        :stroke="liked ? 'none' : 'currentColor'"
        :stroke-width="liked ? '0' : '1'"
        :fill-opacity="liked ? '1' : '0'"
        class="transition-all duration-300"
      />
    </svg>

    <!-- Count badge (appears when > 0, outside the button on md size) -->
    <Transition name="count-fade">
      <span
        v-if="likeCount > 0 && size === 'md'"
        ref="countEl"
        class="absolute -bottom-5 left-1/2 -translate-x-1/2 font-body text-[10px] tabular-nums transition-colors duration-200"
        :class="liked ? 'text-accent-red/80' : 'text-lavender-500'"
      >
        {{ likeCount }}
      </span>
    </Transition>
  </button>
</template>

<style scoped>
.resonance-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  border-style: solid;
  border-color: currentColor;
  pointer-events: none;
}

.count-fade-enter-active,
.count-fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.count-fade-enter-from,
.count-fade-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(4px) scale(0.8);
}
</style>
