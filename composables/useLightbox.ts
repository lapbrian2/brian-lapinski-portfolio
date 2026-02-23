import { ref, computed } from 'vue'

export interface LightboxItem {
  src: string
  title: string
  medium?: string
}

const isOpen = ref(false)
const items = ref<LightboxItem[]>([])
const currentIndex = ref(0)
const direction = ref<'next' | 'prev'>('next')

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
  const total = computed(() => items.value.length)

  function open(allItems: LightboxItem[], startIndex: number = 0) {
    items.value = allItems
    currentIndex.value = startIndex
    direction.value = 'next'
    isOpen.value = true
    getLenis()?.stop()
  }

  function close() {
    isOpen.value = false
    getLenis()?.start()
  }

  function next() {
    if (hasNext.value) {
      direction.value = 'next'
      currentIndex.value++
    }
  }

  function prev() {
    if (hasPrev.value) {
      direction.value = 'prev'
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
