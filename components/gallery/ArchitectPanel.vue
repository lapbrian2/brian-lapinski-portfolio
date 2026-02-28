<script setup lang="ts">
import gsap from 'gsap'
import type { LightboxItem } from '~/composables/useLightbox'
import { useIsMobile } from '~/composables/useMediaQuery'
import type { PromptNode, TechniqueCategory } from '~/types/artwork'
import { categoryColors, categoryLabels } from '~/data/techniqueCategories'

const isMobile = useIsMobile()

const props = defineProps<{
  item: LightboxItem
  visible: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

const panelEl = ref<HTMLElement | null>(null)
const contentEl = ref<HTMLElement | null>(null)
const { quickFork, copied, copiedType } = usePromptFork()

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

// ── Feature: Interactive Token Focus (hyper-focus) ──
const hoveredNodeId = ref<string | null>(null)

function onTokenEnter(nodeId: string) {
  hoveredNodeId.value = nodeId
}

function onTokenLeave() {
  hoveredNodeId.value = null
}

// ── Feature: Progressive Disclosure ──
const DISCLOSURE_KEY = 'bl-architect-mode'
const mode = ref<'beginner' | 'advanced'>('beginner')

if (import.meta.client) {
  onMounted(() => {
    try {
      const stored = localStorage.getItem(DISCLOSURE_KEY)
      if (stored === 'beginner' || stored === 'advanced') {
        mode.value = stored
      }
    } catch {
      // Corrupt storage — use default
    }
  })
}

function toggleMode() {
  mode.value = mode.value === 'beginner' ? 'advanced' : 'beginner'
  if (import.meta.client) {
    try {
      localStorage.setItem(DISCLOSURE_KEY, mode.value)
    } catch {
      // Storage full
    }
  }
}

const beginnerCategories: TechniqueCategory[] = ['style', 'mood', 'lighting']

// categoryColors + categoryLabels imported from ~/data/techniqueCategories

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

// Filtered nodes based on disclosure mode
const visibleNodes = computed(() => {
  if (mode.value === 'advanced') return groupedNodes.value
  const filtered = new Map<TechniqueCategory, PromptNode[]>()
  for (const [cat, nodes] of groupedNodes.value) {
    if (beginnerCategories.includes(cat)) {
      filtered.set(cat, nodes)
    }
  }
  return filtered
})

const hasOssuaryData = computed(() => {
  return !!(props.item.rawPrompt || props.item.promptNodes?.length)
})

// GSAP slide-in/out animation with overwrite protection
watch(() => props.visible, (open) => {
  if (!panelEl.value) return

  // Kill any in-flight panel tween to prevent ghost states on rapid toggling
  activeTween?.kill()

  // Mobile: slide up from bottom; Desktop: slide in from right
  const axis = isMobile.value ? 'y' : 'x'

  if (open) {
    activeTween = gsap.fromTo(panelEl.value, {
      [axis]: '100%',
      opacity: 0,
    }, {
      [axis]: '0%',
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

    activeTween = gsap.to(panelEl.value, {
      [axis]: '100%',
      opacity: 0,
      duration: 0.35,
      ease: 'power2.inOut',
      force3D: true,
    })
  }
})

// Re-animate content when disclosure mode changes
watch(mode, () => {
  if (!props.visible || !contentEl.value) return
  nextTick(() => {
    const children = contentEl.value!.querySelectorAll('.animate-in')
    gsap.fromTo(children, {
      opacity: 0.5,
      y: 6,
    }, {
      opacity: 1,
      y: 0,
      duration: 0.3,
      stagger: 0.04,
      ease: 'power2.out',
      overwrite: 'auto',
    })
  })
})

// Reset panel position on orientation change to prevent stale transforms
watch(isMobile, () => {
  if (props.visible && panelEl.value) {
    activeTween?.kill()
    gsap.set(panelEl.value, { x: '0%', y: '0%', opacity: 1 })
  }
})

// Clean up all tweens when the component is destroyed
onUnmounted(() => {
  activeTween?.kill()
  staggerTween?.kill()
})

const playground = usePlayground()
const quickForkBtnEl = ref<HTMLElement | null>(null)

function handleOpenPlayground() {
  playground.open({
    title: props.item.title,
    rawPrompt: props.item.rawPrompt,
    mjVersion: props.item.mjVersion,
    promptNodes: props.item.promptNodes,
  })
}

async function handleQuickFork() {
  const success = await quickFork({
    title: props.item.title,
    rawPrompt: props.item.rawPrompt,
    mjVersion: props.item.mjVersion,
    promptNodes: props.item.promptNodes,
  })
  // Elastic scale feedback on copy success
  if (success && quickForkBtnEl.value) {
    gsap.fromTo(quickForkBtnEl.value, {
      scale: 1,
    }, {
      scale: 1.08,
      duration: 0.5,
      ease: 'elastic.out(1.2, 0.4)',
      yoyo: true,
      repeat: 1,
      force3D: true,
      clearProps: 'scale',
    })
  }
}

// Helper: get hovered node's description within a category group
function getHoveredDescription(nodes: PromptNode[]): string | null {
  if (!hoveredNodeId.value) return null
  const node = nodes.find(n => n.id === hoveredNodeId.value)
  return node?.description || null
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
      <!-- Mobile bottom sheet drag handle -->
      <div v-if="isMobile" class="flex justify-center py-3 shrink-0">
        <div class="w-10 h-1 rounded-full bg-white/20" />
      </div>

      <!-- Header -->
      <div class="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
        <div class="flex items-center gap-2.5">
          <div class="w-1.5 h-1.5 rounded-full bg-accent-red animate-pulse-slow" />
          <span class="font-body text-[10px] uppercase tracking-[0.25em] text-lavender-300/70">
            Prompt Architecture
          </span>
        </div>
        <div class="flex items-center gap-2">
          <!-- Disclosure mode toggle -->
          <button
            v-if="groupedNodes.size > 0"
            class="mode-toggle"
            :class="mode === 'advanced' ? 'is-advanced' : ''"
            :aria-label="`Switch to ${mode === 'beginner' ? 'advanced' : 'beginner'} mode`"
            @click="toggleMode"
          >
            <span class="mode-toggle-track">
              <span class="mode-toggle-thumb" />
            </span>
            <span class="text-[9px] uppercase tracking-[0.15em] font-body">
              {{ mode === 'beginner' ? 'Core' : 'Full' }}
            </span>
          </button>
          <!-- Close button -->
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

            <!-- Technique Tokens (filtered by disclosure mode) -->
            <div v-if="visibleNodes.size > 0" class="space-y-3.5">
              <div
                v-for="[category, nodes] in visibleNodes"
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

                <!-- Tokens with interactive focus -->
                <div class="flex flex-wrap gap-1.5">
                  <span
                    v-for="node in nodes"
                    :key="node.id"
                    class="technique-token"
                    :class="[
                      categoryColors[category]?.bg,
                      categoryColors[category]?.border,
                      hoveredNodeId && hoveredNodeId !== node.id ? 'is-dimmed' : '',
                      hoveredNodeId === node.id ? 'is-focused' : '',
                    ]"
                    @mouseenter="onTokenEnter(node.id)"
                    @mouseleave="onTokenLeave"
                  >
                    <span class="text-[11px] font-body" :class="categoryColors[category]?.text">
                      {{ node.name }}
                    </span>
                  </span>
                </div>

                <!-- Inline description tooltip for hovered token -->
                <Transition name="token-desc">
                  <div
                    v-if="getHoveredDescription(nodes)"
                    class="mt-2 px-2.5 py-2 rounded-md bg-white/[0.04] border border-white/[0.06]"
                  >
                    <p class="text-[10px] font-body text-lavender-300/60 leading-relaxed">
                      {{ getHoveredDescription(nodes) }}
                    </p>
                  </div>
                </Transition>
              </div>
            </div>

            <!-- Beginner mode hint -->
            <div v-if="mode === 'beginner' && groupedNodes.size > visibleNodes.size" class="animate-in">
              <button
                class="text-[10px] font-body text-lavender-400/40 hover:text-lavender-300/60 transition-colors"
                @click="toggleMode"
              >
                + {{ groupedNodes.size - visibleNodes.size }} more categories &middot; Switch to Full
              </button>
            </div>

            <!-- Raw Prompt (advanced only) -->
            <div v-if="item.rawPrompt && mode === 'advanced'" class="animate-in">
              <div class="flex items-center gap-2 mb-2">
                <span class="text-[10px] uppercase tracking-[0.2em] font-body text-lavender-400/50">
                  Raw Prompt
                </span>
              </div>
              <div class="prompt-block">
                <code class="text-[11px] leading-relaxed font-mono text-lavender-200/80 break-words whitespace-pre-wrap">{{ item.rawPrompt }}</code>
              </div>
            </div>

            <!-- Refinement Notes (advanced only) -->
            <div v-if="item.refinementNotes && mode === 'advanced'" class="animate-in">
              <div class="flex items-center gap-2 mb-2">
                <span class="text-[10px] uppercase tracking-[0.2em] font-body text-lavender-400/50">
                  Artist Notes
                </span>
              </div>
              <p class="text-[12px] leading-relaxed font-body text-lavender-300/60 italic">
                {{ item.refinementNotes }}
              </p>
            </div>

            <!-- Actions -->
            <div class="animate-in pt-2 space-y-2">
              <!-- Open Playground — primary -->
              <button
                class="btn-press fork-button group w-full"
                @click="handleOpenPlayground"
              >
                <span class="flex items-center justify-center gap-2">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" class="transition-transform duration-200 group-hover:rotate-12">
                    <rect x="1" y="3" width="12" height="9" rx="1.5" />
                    <path d="M4 3V1.5A.5.5 0 0 1 4.5 1h5a.5.5 0 0 1 .5.5V3" />
                    <line x1="4" y1="6.5" x2="10" y2="6.5" />
                    <line x1="4" y1="9" x2="7" y2="9" />
                  </svg>
                  <span>Open Playground</span>
                </span>
              </button>

              <!-- Copy Raw Prompt — secondary quick action -->
              <button
                v-if="item.rawPrompt"
                ref="quickForkBtnEl"
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

@media (max-width: 767px) {
  .architect-panel {
    top: auto;
    right: 0;
    bottom: 0;
    left: 0;
    width: 100%;
    max-width: 100vw;
    height: 65vh;
    border-radius: 16px 16px 0 0;
    overflow: hidden;
    transform: translateY(100%);
  }
}

/* ── Technique tokens with interactive focus ── */
.technique-token {
  display: inline-flex;
  align-items: center;
  padding: 3px 10px;
  border-radius: 100px;
  border: 1px solid;
  transition: opacity 0.2s ease, transform 0.2s ease;
  cursor: default;
}

.technique-token.is-dimmed {
  opacity: 0.25;
}

.technique-token.is-focused {
  opacity: 1;
  transform: translateY(-1px) scale(1.05);
}

/* ── Token description tooltip transition ── */
.token-desc-enter-active {
  transition: opacity 0.2s ease, max-height 0.25s ease;
  overflow: hidden;
}
.token-desc-leave-active {
  transition: opacity 0.15s ease, max-height 0.15s ease;
  overflow: hidden;
}
.token-desc-enter-from,
.token-desc-leave-to {
  opacity: 0;
  max-height: 0;
}

/* ── Disclosure mode toggle ── */
.mode-toggle {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 3px 8px 3px 4px;
  border-radius: 100px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: rgba(126, 127, 143, 1);
  cursor: pointer;
  transition: all 0.25s ease;
}

.mode-toggle:hover {
  border-color: rgba(255, 255, 255, 0.15);
  color: rgba(201, 210, 231, 1);
}

.mode-toggle.is-advanced {
  background: rgba(237, 84, 77, 0.08);
  border-color: rgba(237, 84, 77, 0.2);
  color: #ed544d;
}

.mode-toggle-track {
  width: 22px;
  height: 12px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.1);
  position: relative;
  transition: background 0.25s ease;
}

.mode-toggle.is-advanced .mode-toggle-track {
  background: rgba(237, 84, 77, 0.3);
}

.mode-toggle-thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(165, 176, 200, 1);
  transition: transform 0.25s ease, background 0.25s ease;
}

.mode-toggle.is-advanced .mode-toggle-thumb {
  transform: translateX(10px);
  background: #ed544d;
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
  font-family: var(--font-body, 'PP Neue Montreal', sans-serif);
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
  font-family: var(--font-body, 'PP Neue Montreal', sans-serif);
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
@media (max-width: 767px) {
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
