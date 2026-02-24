import { computed } from 'vue'
import { useReducedMotion } from './useMediaQuery'

/**
 * Centralized motion design tokens for GSAP animations.
 *
 * These values form a deliberate scale aligned with the CSS custom properties
 * in assets/css/main.css. Import `motion` directly for static access or use
 * `useMotionValues()` inside components that need reduced-motion awareness.
 */
export const motion = Object.freeze({
  duration: {
    instant: 0.01,
    fast: 0.2,
    normal: 0.4,
    moderate: 0.6,
    slow: 0.8,
    dramatic: 1.2,
  },
  ease: {
    out: 'power2.out',
    outStrong: 'power3.out',
    outSmooth: 'power4.out',
    inOut: 'power2.inOut',
    inOutStrong: 'power3.inOut',
    in: 'power2.in',
    elastic: 'elastic.out(1, 0.5)',
    bounce: 'back.out(1.4)',
  },
  stagger: {
    tight: 0.04,
    normal: 0.08,
    relaxed: 0.12,
    slow: 0.2,
  },
})

/** Returns motion tokens that collapse all durations to `instant` when the user prefers reduced motion. */
export function useMotionValues() {
  const reduced = useReducedMotion()

  return computed(() => {
    if (!reduced.value) return motion

    const instantDurations = Object.fromEntries(
      Object.keys(motion.duration).map((key) => [key, motion.duration.instant]),
    ) as typeof motion.duration

    return { ...motion, duration: instantDurations }
  })
}
