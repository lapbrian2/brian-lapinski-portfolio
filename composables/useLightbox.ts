import { computed } from 'vue'
import type { PromptNode, TechniqueCategory } from '~/types/artwork'
import type { LenisInstance } from '~/types/lenis'

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
  likeCount?: number
  // Purchase gating
  promptUnlocked?: boolean
  promptPrice?: number
  hasPrompt?: boolean
}

export interface SourceRect {
  top: number
  left: number
  width: number
  height: number
  borderRadius: string
}

// Use useState for SSR-safe shared state (avoids cross-request contamination)
function useLightboxState() {
  const isOpen = useState<boolean>('lightbox-open', () => false)
  const items = useState<LightboxItem[]>('lightbox-items', () => [])
  const currentIndex = useState<number>('lightbox-index', () => 0)
  const direction = useState<'next' | 'prev'>('lightbox-direction', () => 'next')
  const sourceRect = useState<SourceRect | null>('lightbox-source-rect', () => null)
  const sourceArtworkId = useState<string | null>('lightbox-source-id', () => null)
  return { isOpen, items, currentIndex, direction, sourceRect, sourceArtworkId }
}

function getLenis(): LenisInstance | null {
  if (typeof window === 'undefined') return null
  try {
    const nuxtApp = useNuxtApp()
    return (nuxtApp.$lenis as LenisInstance) || null
  } catch {
    return null
  }
}

export function useLightbox() {
  const { isOpen, items, currentIndex, direction, sourceRect, sourceArtworkId } = useLightboxState()

  const currentItem = computed(() => items.value[currentIndex.value] || null)
  const hasNext = computed(() => currentIndex.value < items.value.length - 1)
  const hasPrev = computed(() => currentIndex.value > 0)
  const total = computed(() => items.value.length)

  function open(allItems: LightboxItem[], startIndex: number = 0, rect?: SourceRect | null) {
    items.value = allItems
    currentIndex.value = startIndex
    direction.value = 'next'
    sourceRect.value = rect || null
    sourceArtworkId.value = allItems[startIndex]?.id || null
    isOpen.value = true
    getLenis()?.stop()
    // Track artwork view
    const item = allItems[startIndex]
    if (item?.id) trackView(item.id)
  }

  function close() {
    // Note: sourceArtworkId is intentionally preserved here so the FLIP
    // leave animation can find the original card element. It gets cleared
    // on the next open() call or via clearSourceRect().
    isOpen.value = false
    sourceRect.value = null
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

  function getSourceRect(): SourceRect | null {
    return sourceRect.value
  }

  function clearSourceRect() {
    sourceRect.value = null
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
    getSourceRect,
    clearSourceRect,
  }
}
