<script setup lang="ts">
import gsap from 'gsap'
import { categoryColors, categoryLabels } from '~/data/techniqueCategories'
import { MJ_VERSIONS } from '~/composables/usePlayground'
import type { TechniqueCategory } from '~/types/artwork'
import { useIsMobile, useReducedMotion } from '~/composables/useMediaQuery'

const playground = usePlayground()
const { copyToClipboard } = usePromptFork()
const { burst } = useParticleBurst()
const isMobile = useIsMobile()
const reducedMotion = useReducedMotion()

const drawerEl = ref<HTMLElement | null>(null)
const backdropEl = ref<HTMLElement | null>(null)
const copyBtnEl = ref<HTMLElement | null>(null)

const justCopied = ref(false)
const justSaved = ref(false)
let copyTimeout: ReturnType<typeof setTimeout> | null = null
let saveTimeout: ReturnType<typeof setTimeout> | null = null

// Group active nodes by category
const groupedActive = computed(() => {
  const groups = new Map<TechniqueCategory, typeof playground.activeNodes.value>()
  for (const node of playground.activeNodes.value) {
    if (!groups.has(node.category)) groups.set(node.category, [])
    groups.get(node.category)!.push(node)
  }
  return groups
})

// Removed nodes list
const removedNodes = computed(() =>
  playground.allNodes.value.filter(n => playground.removedNodeIds.value.has(n.id)),
)

// GSAP drawer animation
watch(() => playground.isOpen.value, (open) => {
  if (!drawerEl.value) return

  if (open) {
    if (isMobile.value) {
      // Mobile: slide up from bottom
      gsap.fromTo(drawerEl.value, {
        y: '100%',
      }, {
        y: '0%',
        duration: reducedMotion.value ? 0.01 : 0.4,
        ease: 'power3.out',
        force3D: true,
      })
    } else {
      // Desktop: slide from right
      gsap.fromTo(drawerEl.value, {
        x: '100%',
      }, {
        x: '0%',
        duration: reducedMotion.value ? 0.01 : 0.4,
        ease: 'power3.out',
        force3D: true,
      })
    }
  } else {
    if (isMobile.value) {
      gsap.to(drawerEl.value, {
        y: '100%',
        duration: reducedMotion.value ? 0.01 : 0.3,
        ease: 'power3.in',
        force3D: true,
      })
    } else {
      gsap.to(drawerEl.value, {
        x: '100%',
        duration: reducedMotion.value ? 0.01 : 0.3,
        ease: 'power3.in',
        force3D: true,
      })
    }
  }
})

async function handleCopy() {
  const text = buildPromptOutput()
  const success = await copyToClipboard(text)
  if (success) {
    justCopied.value = true
    burst(copyBtnEl.value)
    if (copyTimeout) clearTimeout(copyTimeout)
    copyTimeout = setTimeout(() => { justCopied.value = false }, 2000)
  }
}

function handleSave() {
  playground.saveToProfile()
  justSaved.value = true
  if (saveTimeout) clearTimeout(saveTimeout)
  saveTimeout = setTimeout(() => { justSaved.value = false }, 2000)
}

function buildPromptOutput(): string {
  const lines: string[] = []
  if (playground.promptText.value) {
    lines.push(playground.promptText.value)
  }
  if (playground.activeNodes.value.length) {
    lines.push('')
    lines.push(`// Techniques: ${playground.activeNodes.value.map(n => n.name).join(', ')}`)
  }
  if (playground.mjVersion.value) {
    lines.push(`// ${playground.mjVersion.value}`)
  }
  return lines.join('\n')
}

onUnmounted(() => {
  if (copyTimeout) clearTimeout(copyTimeout)
  if (saveTimeout) clearTimeout(saveTimeout)
})
</script>

<template>
  <Teleport to="body">
    <!-- Backdrop -->
    <Transition name="pg-backdrop">
      <div
        v-if="playground.isOpen.value"
        ref="backdropEl"
        class="fixed inset-0 z-[90] bg-black/60 backdrop-blur-sm"
        @click="playground.close()"
      />
    </Transition>

    <!-- Drawer -->
    <div
      ref="drawerEl"
      class="playground-drawer"
      :class="isMobile ? 'playground-mobile' : 'playground-desktop'"
      @click.stop
    >
      <!-- Glass backdrop -->
      <div class="absolute inset-0 bg-dark-800/95 backdrop-blur-xl" :class="isMobile ? 'rounded-t-2xl' : 'border-l border-white/[0.06]'" />

      <div class="relative z-10 h-full flex flex-col">
        <!-- Mobile drag handle -->
        <div v-if="isMobile" class="flex justify-center py-3 shrink-0">
          <div class="w-10 h-1 rounded-full bg-white/20" />
        </div>

        <!-- Header -->
        <div class="flex items-center justify-between px-5 py-4 border-b border-white/[0.06] shrink-0">
          <div class="flex items-center gap-2.5">
            <div class="w-1.5 h-1.5 rounded-full bg-accent-red animate-pulse-slow" />
            <span class="font-body text-[10px] uppercase tracking-[0.25em] text-lavender-300/70">
              Prompt Playground
            </span>
          </div>
          <button
            class="w-7 h-7 flex items-center justify-center rounded-full hover:bg-white/10 text-lavender-400 hover:text-white transition-all duration-200"
            aria-label="Close playground"
            @click="playground.close()"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
              <line x1="1" y1="1" x2="11" y2="11" />
              <line x1="11" y1="1" x2="1" y2="11" />
            </svg>
          </button>
        </div>

        <!-- Scrollable body -->
        <div class="flex-1 min-h-0 overflow-y-auto overscroll-contain px-5 py-5 space-y-5 scrollbar-thin">
          <!-- Source label -->
          <div class="flex items-center gap-2">
            <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" class="text-lavender-400/50 shrink-0">
              <path d="M4 2v4a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2V2" />
              <circle cx="4" cy="2" r="1" />
              <circle cx="10" cy="2" r="1" />
              <line x1="7" y1="8" x2="7" y2="12" />
              <circle cx="7" cy="12" r="1" />
            </svg>
            <span class="text-[10px] uppercase tracking-[0.15em] font-body text-lavender-400/50">
              Forked from: <span class="text-lavender-300/70">{{ playground.sourceTitle.value }}</span>
            </span>
          </div>

          <!-- Editable prompt textarea -->
          <div>
            <label class="text-[10px] uppercase tracking-[0.2em] font-body text-lavender-400/50 mb-2 block">
              Prompt
            </label>
            <textarea
              v-model="playground.promptText.value"
              class="w-full min-h-[120px] max-h-[200px] bg-white/[0.02] border border-white/[0.08] rounded-lg px-3.5 py-3 text-[12px] leading-relaxed font-mono text-lavender-200/80 resize-y focus:outline-none focus:border-accent-red/30 transition-colors placeholder:text-lavender-400/30"
              placeholder="Enter your prompt here..."
              spellcheck="false"
            />
            <div class="flex items-center justify-between mt-1.5">
              <span class="text-[10px] font-body text-lavender-400/30">
                {{ playground.charCount.value }} chars
              </span>
              <!-- Version selector -->
              <div class="flex items-center gap-1.5">
                <span class="text-[10px] font-body text-lavender-400/40">Version:</span>
                <select
                  v-model="playground.mjVersion.value"
                  class="bg-white/[0.04] border border-white/[0.08] rounded-md px-2 py-0.5 text-[10px] font-mono text-lavender-200/70 focus:outline-none focus:border-accent-red/30 transition-colors appearance-none cursor-pointer"
                >
                  <option
                    v-for="ver in MJ_VERSIONS"
                    :key="ver"
                    :value="ver"
                    class="bg-dark-800 text-lavender-200"
                  >
                    {{ ver }}
                  </option>
                </select>
              </div>
            </div>
          </div>

          <!-- Active technique tokens -->
          <div v-if="groupedActive.size > 0">
            <label class="text-[10px] uppercase tracking-[0.2em] font-body text-lavender-400/50 mb-2.5 block">
              Technique Tokens
            </label>
            <div class="space-y-3">
              <div v-for="[category, nodes] in groupedActive" :key="category">
                <div class="flex items-center gap-1.5 mb-1.5">
                  <span class="w-1 h-1 rounded-full" :class="categoryColors[category]?.dot" />
                  <span class="text-[9px] uppercase tracking-[0.15em] font-body" :class="categoryColors[category]?.text" style="opacity: 0.6">
                    {{ categoryLabels[category] || category }}
                  </span>
                </div>
                <TransitionGroup name="token-remove" tag="div" class="flex flex-wrap gap-1.5">
                  <span
                    v-for="node in nodes"
                    :key="node.id"
                    class="playground-token group"
                    :class="[categoryColors[category]?.bg, categoryColors[category]?.border]"
                  >
                    <span class="text-[11px] font-body" :class="categoryColors[category]?.text">
                      {{ node.name }}
                    </span>
                    <button
                      class="ml-1 w-3.5 h-3.5 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-white/10 transition-all"
                      :aria-label="`Remove ${node.name}`"
                      @click="playground.removeNode(node.id)"
                    >
                      <svg width="7" height="7" viewBox="0 0 7 7" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" class="text-lavender-300/60">
                        <line x1="1" y1="1" x2="6" y2="6" />
                        <line x1="6" y1="1" x2="1" y2="6" />
                      </svg>
                    </button>
                  </span>
                </TransitionGroup>
              </div>
            </div>
          </div>

          <!-- Removed tokens (restore) -->
          <div v-if="removedNodes.length > 0">
            <label class="text-[10px] uppercase tracking-[0.2em] font-body text-lavender-400/30 mb-2 block">
              Removed
            </label>
            <div class="flex flex-wrap gap-1.5">
              <button
                v-for="node in removedNodes"
                :key="node.id"
                class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/[0.02] border border-white/[0.04] text-[10px] font-body text-lavender-400/30 line-through hover:text-lavender-300/50 hover:border-white/[0.08] transition-all cursor-pointer"
                :aria-label="`Restore ${node.name}`"
                @click="playground.restoreNode(node.id)"
              >
                <svg width="8" height="8" viewBox="0 0 8 8" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" class="opacity-50">
                  <path d="M1 4h6M4 1v6" />
                </svg>
                {{ node.name }}
              </button>
            </div>
          </div>

          <!-- Saved prompts -->
          <div v-if="playground.savedPrompts.value.length > 0">
            <label class="text-[10px] uppercase tracking-[0.2em] font-body text-lavender-400/30 mb-2 block">
              Saved Prompts
            </label>
            <div class="space-y-2">
              <div
                v-for="saved in playground.savedPrompts.value"
                :key="saved.id"
                class="flex items-start justify-between gap-2 px-3 py-2 rounded-md bg-white/[0.02] border border-white/[0.04]"
              >
                <div class="min-w-0">
                  <p class="text-[11px] font-body text-lavender-200/70 truncate">{{ saved.title }}</p>
                  <p class="text-[9px] font-body text-lavender-400/30 mt-0.5">
                    {{ new Date(saved.savedAt).toLocaleDateString() }} &middot; {{ saved.mjVersion }}
                  </p>
                </div>
                <button
                  class="shrink-0 text-lavender-400/30 hover:text-accent-red transition-colors"
                  :aria-label="`Delete saved prompt ${saved.title}`"
                  @click="playground.deleteSaved(saved.id)"
                >
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round">
                    <line x1="1" y1="1" x2="9" y2="9" />
                    <line x1="9" y1="1" x2="1" y2="9" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer actions -->
        <div class="px-5 py-4 border-t border-white/[0.06] space-y-2 shrink-0">
          <!-- Copy to clipboard — primary CTA -->
          <button
            ref="copyBtnEl"
            class="playground-copy-btn w-full"
            @click="handleCopy"
          >
            <span v-if="!justCopied" class="flex items-center justify-center gap-2">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round">
                <rect x="2" y="2" width="7" height="9" rx="1" />
                <path d="M5 2V1a1 1 0 0 1 1-1h5a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1h-1" />
              </svg>
              <span>Copy to Clipboard</span>
            </span>
            <span v-else class="flex items-center justify-center gap-1.5 text-accent-red">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="2 6 5 9 10 3" />
              </svg>
              Copied!
            </span>
          </button>

          <!-- Save to profile — secondary -->
          <button
            class="playground-save-btn w-full"
            @click="handleSave"
          >
            <span v-if="!justSaved" class="flex items-center justify-center gap-2">
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round">
                <path d="M10.5 12H2.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h6l3 3v7a1 1 0 0 1-1 1z" />
                <path d="M9.5 12V8h-6v4" />
                <path d="M3.5 1v3h4" />
              </svg>
              <span>Save to Profile</span>
            </span>
            <span v-else class="flex items-center justify-center gap-1.5 text-emerald-400">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="2 6 5 9 10 3" />
              </svg>
              Saved!
            </span>
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
/* Desktop drawer — slides from right */
.playground-desktop {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  z-index: 95;
  width: 420px;
  max-width: 90vw;
  transform: translateX(100%);
  will-change: transform;
}

/* Mobile drawer — bottom sheet */
.playground-mobile {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 95;
  height: 75vh;
  max-height: 75vh;
  border-radius: 16px 16px 0 0;
  overflow: hidden;
  transform: translateY(100%);
  will-change: transform;
}

/* Technique token chip with remove button */
.playground-token {
  display: inline-flex;
  align-items: center;
  padding: 3px 10px;
  border-radius: 100px;
  border: 1px solid;
  transition: opacity 0.2s ease;
  cursor: default;
}

/* Token removal animation */
.token-remove-enter-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.token-remove-leave-active {
  transition: all 0.25s cubic-bezier(0.55, 0, 1, 0.45);
}

.token-remove-enter-from {
  opacity: 0;
  transform: scaleX(0.5);
}

.token-remove-leave-to {
  opacity: 0;
  transform: scaleX(0);
}

.token-remove-move {
  transition: transform 0.3s ease;
}

/* Copy button — primary CTA */
.playground-copy-btn {
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
  cursor: pointer;
}

.playground-copy-btn:hover {
  background: rgba(237, 84, 77, 0.2);
  border-color: rgba(237, 84, 77, 0.35);
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(237, 84, 77, 0.15);
}

/* Save button — secondary */
.playground-save-btn {
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
  cursor: pointer;
}

.playground-save-btn:hover {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.12);
  transform: translateY(-1px);
}

/* Backdrop transition */
.pg-backdrop-enter-active {
  transition: opacity 0.3s ease;
}

.pg-backdrop-leave-active {
  transition: opacity 0.2s ease;
}

.pg-backdrop-enter-from,
.pg-backdrop-leave-to {
  opacity: 0;
}

/* Scrollbar — matches architect panel */
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

.scrollbar-thin {
  -webkit-overflow-scrolling: touch;
}

@media (max-width: 767px) {
  .scrollbar-thin::-webkit-scrollbar {
    width: 6px;
  }

  .scrollbar-thin::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.12);
  }
}
</style>
