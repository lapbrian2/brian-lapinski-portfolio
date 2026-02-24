<script setup lang="ts">
import gsap from 'gsap'
import type { LightboxItem } from '~/composables/useLightbox'
import type { PromptNode, TechniqueCategory } from '~/types/artwork'

const props = defineProps<{
  item: LightboxItem
  visible: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

const panelEl = ref<HTMLElement | null>(null)
const contentEl = ref<HTMLElement | null>(null)
const { fork, quickFork, copied, copiedType } = usePromptFork()

// Scroll fade indicator state
const scrollTop = ref(0)
const canScrollMore = ref(true)

function onContentScroll(e: Event): void {
  const el = e.target as HTMLElement
  scrollTop.value = el.scrollTop
  canScrollMore.value = el.scrollTop + el.clientHeight < el.scrollHeight - 5
}

// GSAP tween trackers — kill before starting new animations to prevent ghost states
let activeTween: gsap.core.Tween | null = null
let staggerTween: gsap.core.Tween | null = null

// Technique category color mapping — matches the Ossuary design system
const categoryColors: Record<TechniqueCategory, { bg: string; text: string; border: string; dot: string }> = {
  lighting: { bg: 'bg-amber-500/10', text: 'text-amber-300', border: 'border-amber-500/20', dot: 'bg-amber-400' },
  camera: { bg: 'bg-rose-500/10', text: 'text-rose-300', border: 'border-rose-500/20', dot: 'bg-rose-400' },
  style: { bg: 'bg-violet-500/10', text: 'text-violet-300', border: 'border-violet-500/20', dot: 'bg-violet-400' },
  mood: { bg: 'bg-indigo-500/10', text: 'text-indigo-300', border: 'border-indigo-500/20', dot: 'bg-indigo-400' },
  composition: { bg: 'bg-emerald-500/10', text: 'text-emerald-300', border: 'border-emerald-500/20', dot: 'bg-emerald-400' },
  material: { bg: 'bg-orange-500/10', text: 'text-orange-300', border: 'border-orange-500/20', dot: 'bg-orange-400' },
  color: { bg: 'bg-cyan-500/10', text: 'text-cyan-300', border: 'border-cyan-500/20', dot: 'bg-cyan-400' },
  post: { bg: 'bg-pink-500/10', text: 'text-pink-300', border: 'border-pink-500/20', dot: 'bg-pink-400' },
}

const categoryLabels: Record<TechniqueCategory, string> = {
  lighting: 'Lighting',
  camera: 'Camera',
  style: 'Style',
  mood: 'Mood',
  composition: 'Composition',
  material: 'Material',
  color: 'Color',
  post: 'Post-Processing',
}

// Group prompt nodes by category
const groupedNodes = computed(() => {
  if (!props.item.promptNodes?.length) return new Map<TechniqueCategory, PromptNode[]>()
  const groups = new Map<TechniqueCategory, PromptNode[]>()
  for (const node of props.item.promptNodes) {
    if (!groups.has(node.category)) groups.set(node.category, [])
    groups.get(node.category)!.push(node)
  }
  return groups
})

const hasOssuaryData = computed(() => {
  return !!(props.item.rawPrompt || props.item.promptNodes?.length)
})

// GSAP slide-in/out animation with overwrite protection
watch(() => props.visible, (open) => {
  if (!panelEl.value) return

  // Kill any in-flight panel tween to prevent ghost states on rapid toggling
  activeTween?.kill()

  if (open) {
    // Slide in from right
    activeTween = gsap.fromTo(panelEl.value, {
      x: '100%',
      opacity: 0,
    }, {
      x: '0%',
      opacity: 1,
      duration: 0.5,
      ease: 'power3.out',
      force3D: true,
    })

    // Stagger content children and initialize scroll indicators
    nextTick(() => {
      if (contentEl.value) {
        const children = contentEl.value.querySelectorAll('.animate-in')
        staggerTween = gsap.fromTo(children, {
          opacity: 0,
          y: 16,
        }, {
          opacity: 1,
          y: 0,
          duration: 0.4,
          stagger: 0.06,
          ease: 'power2.out',
          delay: 0.15,
          overwrite: 'auto',
        })

        // Initialize scroll fade state after content renders
        const el = contentEl.value
        scrollTop.value = el.scrollTop
        canScrollMore.value = el.scrollTop + el.clientHeight < el.scrollHeight - 5
      }
    })
  } else {
    // Kill stagger animations before sliding out to prevent orphaned child tweens
    staggerTween?.kill()
    staggerTween = null

    // Slide out with a smoother ease
    activeTween = gsap.to(panelEl.value, {
      x: '100%',
      opacity: 0,
      duration: 0.35,
      ease: 'power2.inOut',
      force3D: true,
    })
  }
})

// Clean up all tweens when the component is destroyed
onUnmounted(() => {
  activeTween?.kill()
  staggerTween?.kill()
})

async function handleFork() {
  await fork({
    title: props.item.title,
    rawPrompt: props.item.rawPrompt,
    mjVersion: props.item.mjVersion,
    promptNodes: props.item.promptNodes,
  })
}

async function handleQuickFork() {
  await quickFork({
    title: props.item.title,
    rawPrompt: props.item.rawPrompt,
    mjVersion: props.item.mjVersion,
    promptNodes: props.item.promptNodes,
  })
}
</script>

<template>
  <div
    ref="panelEl"
    class="architect-panel"
    :class="{ 'pointer-events-none': !visible }"
    @click.stop
  >
    <!-- Glass backdrop -->
    <div class="absolute inset-0 bg-black/70 backdrop-blur-xl border-l border-white/[0.06]" />

    <!-- Content -->
    <div class="relative z-10 h-full flex flex-col">
      <!-- Header -->
      <div class="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
        <div class="flex items-center gap-2.5">
          <div class="w-1.5 h-1.5 rounded-full bg-accent-red animate-pulse-slow" />
          <span class="font-body text-[10px] uppercase tracking-[0.25em] text-lavender-300/70">
            Prompt Architecture
          </span>
        </div>
        <button
          class="w-7 h-7 flex items-center justify-center rounded-full hover:bg-white/10 text-lavender-400 hover:text-white transition-all duration-200"
          aria-label="Close architect panel"
          @click="emit('close')"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
            <line x1="1" y1="1" x2="11" y2="11" />
            <line x1="11" y1="1" x2="1" y2="11" />
          </svg>
        </button>
      </div>

      <!-- Scrollable body with fade indicators -->
      <div class="relative flex-1 min-h-0">
        <!-- Top fade -->
        <div
          class="absolute top-0 left-0 right-0 h-8 pointer-events-none z-10 transition-opacity duration-300"
          :class="scrollTop > 5 ? 'opacity-100' : 'opacity-0'"
          style="background: linear-gradient(to bottom, rgba(0,0,0,0.8), transparent)"
        />

        <!-- Scrollable content -->
        <div
          ref="contentEl"
          class="h-full overflow-y-auto overscroll-contain px-5 py-5 space-y-5 scrollbar-thin"
          @scroll="onContentScroll"
        >
          <!-- No data state -->
          <div v-if="!hasOssuaryData" class="flex flex-col items-center justify-center h-full text-center py-12">
            <div class="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center mb-3">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.2" class="text-lavender-400/50">
                <path d="M8 2v12M2 8h12" stroke-linecap="round" />
              </svg>
            </div>
            <p class="text-xs text-lavender-400/50 font-body">
              Schema data coming soon
            </p>
          </div>

          <template v-else>
            <!-- Version badge -->
            <div v-if="item.mjVersion" class="animate-in">
              <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-[10px] font-body text-lavender-300/60 uppercase tracking-wider">
                <span class="w-1 h-1 rounded-full bg-emerald-400" />
                {{ item.mjVersion }}
              </span>
            </div>

            <!-- Technique Tokens -->
            <div v-if="groupedNodes.size > 0" class="space-y-3.5">
              <div
                v-for="[category, nodes] in groupedNodes"
                :key="category"
                class="animate-in"
              >
                <!-- Category label -->
                <div class="flex items-center gap-2 mb-2">
                  <span
                    class="w-1.5 h-1.5 rounded-full"
                    :class="categoryColors[category]?.dot"
                  />
                  <span class="text-[10px] uppercase tracking-[0.2em] font-body" :class="categoryColors[category]?.text" style="opacity: 0.7">
                    {{ categoryLabels[category] || category }}
                  </span>
                </div>

                <!-- Tokens -->
                <div class="flex flex-wrap gap-1.5">
                  <span
                    v-for="node in nodes"
                    :key="node.id"
                    class="technique-token"
                    :class="[categoryColors[category]?.bg, categoryColors[category]?.border]"
                    :title="node.description || undefined"
                  >
                    <span class="text-[11px] font-body" :class="categoryColors[category]?.text">
                      {{ node.name }}
                    </span>
                  </span>
                </div>
              </div>
            </div>

            <!-- Raw Prompt -->
            <div v-if="item.rawPrompt" class="animate-in">
              <div class="flex items-center gap-2 mb-2">
                <span class="text-[10px] uppercase tracking-[0.2em] font-body text-lavender-400/50">
                  Raw Prompt
                </span>
              </div>
              <div class="prompt-block">
                <code class="text-[11px] leading-relaxed font-mono text-lavender-200/80 break-words whitespace-pre-wrap">{{ item.rawPrompt }}</code>
              </div>
            </div>

            <!-- Refinement Notes -->
            <div v-if="item.refinementNotes" class="animate-in">
              <div class="flex items-center gap-2 mb-2">
                <span class="text-[10px] uppercase tracking-[0.2em] font-body text-lavender-400/50">
                  Artist Notes
                </span>
              </div>
              <p class="text-[12px] leading-relaxed font-body text-lavender-300/60 italic">
                {{ item.refinementNotes }}
              </p>
            </div>

            <!-- Fork Actions -->
            <div class="animate-in pt-2 space-y-2">
              <button
                class="btn-press fork-button group w-full"
                @click="handleFork"
              >
                <span v-if="!copied || copiedType !== 'fork'" class="flex items-center justify-center gap-2">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" class="transition-transform duration-200 group-hover:rotate-12">
                    <path d="M4 2v4a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2V2" />
                    <circle cx="4" cy="2" r="1" />
                    <circle cx="10" cy="2" r="1" />
                    <line x1="7" y1="8" x2="7" y2="12" />
                    <circle cx="7" cy="12" r="1" />
                  </svg>
                  <span>Fork Template</span>
                </span>
                <Transition name="feedback-slide" mode="out-in">
                  <div v-if="copied && copiedType === 'fork'" class="flex flex-col items-center gap-0.5">
                    <span class="text-accent-red font-medium flex items-center gap-1.5">
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="2 6 5 9 10 3" />
                      </svg>
                      Template copied
                    </span>
                    <span class="text-dark-400 text-[10px] italic">
                      Paste into Midjourney and edit the bracketed sections
                    </span>
                  </div>
                </Transition>
              </button>

              <button
                v-if="item.rawPrompt"
                class="btn-press quick-fork-button group w-full"
                @click="handleQuickFork"
              >
                <span v-if="!copied || copiedType !== 'quick'" class="flex items-center justify-center gap-2">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round">
                    <rect x="2" y="2" width="7" height="9" rx="1" />
                    <path d="M5 2V1a1 1 0 0 1 1-1h5a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1h-1" />
                  </svg>
                  <span>Copy Raw Prompt</span>
                </span>
                <Transition name="feedback-slide" mode="out-in">
                  <div v-if="copied && copiedType === 'quick'" class="flex flex-col items-center gap-0.5">
                    <span class="text-accent-red font-medium flex items-center gap-1.5">
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="2 6 5 9 10 3" />
                      </svg>
                      Prompt copied
                    </span>
                    <span class="text-dark-400 text-[10px] italic">
                      Paste directly into Midjourney — ready to generate
                    </span>
                  </div>
                </Transition>
              </button>
            </div>
          </template>
        </div>

        <!-- Bottom fade -->
        <div
          class="absolute bottom-0 left-0 right-0 h-8 pointer-events-none z-10 transition-opacity duration-300"
          :class="canScrollMore ? 'opacity-100' : 'opacity-0'"
          style="background: linear-gradient(to top, rgba(0,0,0,0.8), transparent)"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.architect-panel {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 340px;
  max-width: 90vw;
  z-index: 20;
  transform: translateX(100%);
  opacity: 0;
  will-change: transform, opacity;
}

@media (max-width: 640px) {
  .architect-panel {
    width: 100%;
    max-width: 100vw;
  }
}

.technique-token {
  display: inline-flex;
  align-items: center;
  padding: 3px 10px;
  border-radius: 100px;
  border: 1px solid;
  transition: all 0.2s ease;
  cursor: default;
}

.technique-token:hover {
  filter: brightness(1.3);
  transform: translateY(-1px);
}

.prompt-block {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 8px;
  padding: 12px 14px;
  max-height: 160px;
  overflow-y: auto;
}

.prompt-block::-webkit-scrollbar {
  width: 3px;
}

.prompt-block::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.08);
  border-radius: 100px;
}

.fork-button {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px 16px;
  border-radius: 8px;
  background: rgba(237, 84, 77, 0.12);
  border: 1px solid rgba(237, 84, 77, 0.2);
  color: #ed544d;
  font-family: var(--font-body, 'Inter', sans-serif);
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  transition: all 0.25s ease;
}

.fork-button:hover {
  background: rgba(237, 84, 77, 0.2);
  border-color: rgba(237, 84, 77, 0.35);
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(237, 84, 77, 0.15);
}

.quick-fork-button {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 14px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: var(--color-lavender-300, #a5b0c8);
  font-family: var(--font-body, 'Inter', sans-serif);
  font-size: 10px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  transition: all 0.25s ease;
}

.quick-fork-button:hover {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.12);
  transform: translateY(-1px);
}

/* Custom scrollbar for the panel */
.scrollbar-thin::-webkit-scrollbar {
  width: 3px;
}

.scrollbar-thin::-webkit-scrollbar-track {
  background: transparent;
}

.scrollbar-thin::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.06);
  border-radius: 100px;
}

.scrollbar-thin::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.12);
}

/* iOS smooth scrolling */
.scrollbar-thin {
  -webkit-overflow-scrolling: touch;
}

/* Wider scrollbar on mobile for easier touch interaction */
@media (max-width: 640px) {
  .scrollbar-thin::-webkit-scrollbar {
    width: 6px;
  }

  .scrollbar-thin::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.12);
  }
}

/* Feedback slide transition */
.feedback-slide-enter-active,
.feedback-slide-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.feedback-slide-enter-from {
  opacity: 0;
  transform: translateY(8px);
}

.feedback-slide-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
