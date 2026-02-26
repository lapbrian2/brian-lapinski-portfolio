import gsap from 'gsap'
import type { Ref } from 'vue'

/**
 * Composable that applies a scroll-velocity-based skewY to grid cells via
 * Lenis + GSAP ticker.  Extracted from GenerationGrid and GalleryGrid to
 * eliminate duplication.
 *
 * @param gridEl   - template ref pointing at the grid wrapper element
 * @param selector - CSS selector for the child cells to skew (e.g. '.grid-cell', '.gallery-card')
 */
export function useVelocitySkew(
  gridEl: Ref<HTMLElement | null>,
  selector: string,
) {
  let currentSkew = 0
  const skewTarget = ref(0)
  let skewTickerFn: (() => void) | null = null
  let lenisScrollHandler: ((e: any) => void) | null = null
  let lenisInstance: any = null

  function setup() {
    if (!gridEl.value) return

    // Hook into Lenis smooth-scroll velocity
    try {
      const { $lenis } = useNuxtApp()
      if ($lenis) {
        lenisInstance = $lenis
        lenisScrollHandler = (e: any) => {
          const velocity = e.velocity || 0
          skewTarget.value = Math.max(-3, Math.min(3, velocity * 0.8))
        }
        ;($lenis as any).on('scroll', lenisScrollHandler)
      }
    } catch {
      // Lenis not available -- skip velocity skew
    }

    // Smooth lerp the skew onto cells via GSAP ticker
    skewTickerFn = () => {
      currentSkew += (skewTarget.value - currentSkew) * 0.1
      skewTarget.value *= 0.95
      if (Math.abs(currentSkew) < 0.01) currentSkew = 0
      if (!gridEl.value) return
      const cells = gridEl.value.querySelectorAll(selector)
      gsap.set(cells, { skewY: currentSkew, force3D: true })
    }
    gsap.ticker.add(skewTickerFn)
  }

  function cleanup() {
    if (skewTickerFn) gsap.ticker.remove(skewTickerFn)
    if (lenisScrollHandler && lenisInstance) {
      lenisInstance.off('scroll', lenisScrollHandler)
    }
    skewTickerFn = null
    lenisScrollHandler = null
    lenisInstance = null
  }

  return { setup, cleanup }
}
