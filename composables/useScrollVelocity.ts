import { ref, onMounted, onUnmounted } from 'vue'

/**
 * Exposes Lenis smooth-scroll velocity as a reactive ref.
 * Velocity is typically in the -10 to 10 range.
 */
export function useScrollVelocity() {
  const velocity = ref(0)
  let handler: ((e: { velocity: number }) => void) | null = null

  onMounted(() => {
    const { $lenis } = useNuxtApp()
    if (!$lenis) return

    handler = (e: { velocity: number }) => {
      velocity.value = e.velocity
    }

    ;($lenis as any).on('scroll', handler)
  })

  onUnmounted(() => {
    if (!handler) return
    try {
      const { $lenis } = useNuxtApp()
      if ($lenis) {
        ;($lenis as any).off('scroll', handler)
      }
    } catch {
      // App may be unmounting
    }
  })

  return { velocity }
}
