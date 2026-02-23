import { ref, computed } from 'vue'

interface LightboxItem {
  src: string
  title: string
  medium?: string
}

const isOpen = ref(false)
const items = ref<LightboxItem[]>([])
const currentIndex = ref(0)

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
  const currentItem = computed(() => items.value[currentIndex.value] || null)
  const hasNext = computed(() => currentIndex.value < items.value.length - 1)
  const hasPrev = computed(() => currentIndex.value > 0)

  function open(allItems: LightboxItem[], startIndex: number = 0) {
    items.value = allItems
    currentIndex.value = startIndex
    isOpen.value = true
    getLenis()?.stop()
  }

  function close() {
    isOpen.value = false
    getLenis()?.start()
  }

  function next() {
    if (hasNext.value) {
      currentIndex.value++
    }
  }

  function prev() {
    if (hasPrev.value) {
      currentIndex.value--
    }
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
    hasNext,
    hasPrev,
    open,
    close,
    next,
    prev,
    handleKeydown,
  }
}
