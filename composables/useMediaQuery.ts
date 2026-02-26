import { ref, onUnmounted, getCurrentInstance } from 'vue'

export function useMediaQuery(query: string) {
  const matches = ref(false)
  let mediaQuery: MediaQueryList | null = null

  const update = (e: MediaQueryListEvent | MediaQueryList) => {
    matches.value = e.matches
  }

  // Read correct value synchronously on the client before first render
  if (import.meta.client) {
    mediaQuery = window.matchMedia(query)
    matches.value = mediaQuery.matches
    mediaQuery.addEventListener('change', update)
  }

  // Only register cleanup if called within a component setup context.
  // When called from a composable outside setup, onUnmounted silently no-ops,
  // leaving the listener dangling. Guard with getCurrentInstance().
  if (getCurrentInstance()) {
    onUnmounted(() => {
      mediaQuery?.removeEventListener('change', update)
    })
  }

  return matches
}

export function useIsMobile() {
  return useMediaQuery('(max-width: 767px)')
}

export function useIsTablet() {
  return useMediaQuery('(max-width: 1023px)')
}

export function useReducedMotion() {
  return useMediaQuery('(prefers-reduced-motion: reduce)')
}
