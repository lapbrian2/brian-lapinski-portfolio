import { ref, computed } from 'vue'
import type { PromptNode, TechniqueCategory } from '~/types/artwork'

export interface LightboxItem {
  id?: string
  src: string
  title: string
  medium?: string
  description?: string
  year?: number
  // Ossuary: prompt architecture
  rawPrompt?: string | null
  mjVersion?: string | null
  refinementNotes?: string | null
  promptNodes?: PromptNode[]
}

// Use useState for SSR-safe shared state (avoids cross-request contamination)
function useLightboxState() {
  const isOpen = useState<boolean>('lightbox-open', () => false)
  const items = useState<LightboxItem[]>('lightbox-items', () => [])
  const currentIndex = useState<number>('lightbox-index', () => 0)
  const direction = useState<'next' | 'prev'>('lightbox-direction', () => 'next')
  return { isOpen, items, currentIndex, direction }
}

function getLenis(): any {
  if (typeof window === 'undefined') return null
  try {
    const nuxtApp = useNuxtApp()
    return nuxtApp.$lenis || null
  } catch {
    return null
  }
}

export function useLightbox() {
  const { isOpen, items, currentIndex, direction } = useLightboxState()

  const currentItem = computed(() => items.value[currentIndex.value] || null)
  const hasNext = computed(() => currentIndex.value < items.value.length - 1)
  const hasPrev = computed(() => currentIndex.value > 0)
  const total = computed(() => items.value.length)

  function open(allItems: LightboxItem[], startIndex: number = 0) {
    items.value = allItems
    currentIndex.value = startIndex
    direction.value = 'next'
    isOpen.value = true
    getLenis()?.stop()
    // Track artwork view
    const item = allItems[startIndex]
    if (item?.id) trackView(item.id)
  }

  function close() {
    isOpen.value = false
    getLenis()?.start()
  }

  function next() {
    if (hasNext.value) {
      direction.value = 'next'
      currentIndex.value++
      const item = items.value[currentIndex.value]
      if (item?.id) trackView(item.id)
    }
  }

  function prev() {
    if (hasPrev.value) {
      direction.value = 'prev'
      currentIndex.value--
      const item = items.value[currentIndex.value]
      if (item?.id) trackView(item.id)
    }
  }

  function trackView(artworkId: string) {
    if (typeof window === 'undefined') return
    $fetch(`/api/artworks/${artworkId}/view`, { method: 'POST' }).catch(() => {})
  }

  function handleKeydown(e: KeyboardEvent) {
    if (!isOpen.value) return
    if (e.key === 'Escape') close()
    if (e.key === 'ArrowRight') next()
    if (e.key === 'ArrowLeft') prev()
  }

  return {
    isOpen,
    currentItem,
    currentIndex,
    direction,
    hasNext,
    hasPrev,
    total,
    open,
    close,
    next,
    prev,
    handleKeydown,
  }
}
