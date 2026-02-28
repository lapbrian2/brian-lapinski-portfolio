import type { PromptNode } from '~/types/artwork'

const STORAGE_KEY = 'bl-saved-prompts'

export const MJ_VERSIONS = ['--v 7', '--v 6.1', '--v 6', '--v 5.2', '--niji 6'] as const

export interface SavedPrompt {
  id: string
  title: string
  prompt: string
  mjVersion: string
  savedAt: string
}

interface PlaygroundOpenOptions {
  title: string
  rawPrompt?: string | null
  mjVersion?: string | null
  promptNodes?: PromptNode[]
}

/**
 * Prompt Playground composable — interactive prompt editing drawer.
 * Follows the useState + localStorage pattern from useCart.
 */
export function usePlayground() {
  const isOpen = useState<boolean>('playground-open', () => false)
  const promptText = useState<string>('playground-prompt', () => '')
  const sourceTitle = useState<string>('playground-source', () => '')
  const mjVersion = useState<string>('playground-version', () => '--v 7')
  const allNodes = useState<PromptNode[]>('playground-nodes', () => [])
  const removedNodeIds = useState<Set<string>>('playground-removed', () => new Set())
  const savedPrompts = useState<SavedPrompt[]>('playground-saved', () => [])

  // Hydrate saved prompts from localStorage
  if (import.meta.client) {
    onMounted(() => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) {
          const parsed = JSON.parse(stored) as SavedPrompt[]
          if (Array.isArray(parsed)) {
            savedPrompts.value = parsed
          }
        }
      } catch {
        // Corrupt localStorage
      }
    })
  }

  function persistSaved() {
    if (!import.meta.client) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedPrompts.value))
    } catch {
      // Storage full
    }
  }

  const activeNodes = computed(() =>
    allNodes.value.filter(n => !removedNodeIds.value.has(n.id)),
  )

  const charCount = computed(() => promptText.value.length)

  function open(opts: PlaygroundOpenOptions) {
    if (!opts.rawPrompt) return // Don't open playground without prompt data
    sourceTitle.value = opts.title
    promptText.value = opts.rawPrompt || ''
    mjVersion.value = opts.mjVersion || '--v 7'
    allNodes.value = opts.promptNodes ? [...opts.promptNodes] : []
    removedNodeIds.value = new Set()
    isOpen.value = true
  }

  function close() {
    isOpen.value = false
  }

  function removeNode(id: string) {
    const next = new Set(removedNodeIds.value)
    next.add(id)
    removedNodeIds.value = next
  }

  function restoreNode(id: string) {
    const next = new Set(removedNodeIds.value)
    next.delete(id)
    removedNodeIds.value = next
  }

  function saveToProfile() {
    const entry: SavedPrompt = {
      id: crypto.randomUUID(),
      title: sourceTitle.value || 'Untitled',
      prompt: promptText.value,
      mjVersion: mjVersion.value,
      savedAt: new Date().toISOString(),
    }
    savedPrompts.value = [entry, ...savedPrompts.value]
    persistSaved()
    return entry
  }

  function deleteSaved(id: string) {
    savedPrompts.value = savedPrompts.value.filter(s => s.id !== id)
    persistSaved()
  }

  return {
    isOpen,
    promptText,
    sourceTitle,
    mjVersion,
    allNodes,
    removedNodeIds,
    savedPrompts,
    activeNodes,
    charCount,
    open,
    close,
    removeNode,
    restoreNode,
    saveToProfile,
    deleteSaved,
  }
}
