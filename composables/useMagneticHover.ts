import { onMounted, onUnmounted, type Ref } from 'vue'
import gsap from 'gsap'
import { motion } from './useMotion'

interface MagneticHoverOptions {
  strength?: number
  scaleTo?: number
  duration?: number
}

/**
 * Applies magnetic hover to a DOM element without lifecycle hooks.
 * Call in onMounted; returns a cleanup function for onUnmounted.
 * Desktop-only check is the caller's responsibility.
 */
export function applyMagneticHover(
  el: HTMLElement,
  options: MagneticHoverOptions = {},
): () => void {
  const { strength = 0.3, scaleTo = 1.04, duration = motion.duration.normal } = options

  const onMove = (e: MouseEvent) => {
    const rect = el.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    gsap.to(el, {
      x: (e.clientX - centerX) * strength,
      y: (e.clientY - centerY) * strength,
      scale: scaleTo,
      duration,
      ease: motion.ease.out,
      force3D: true,
      overwrite: 'auto',
    })
  }

  const onLeave = () => {
    gsap.to(el, {
      x: 0,
      y: 0,
      scale: 1,
      duration: motion.duration.moderate,
      ease: motion.ease.elastic,
      force3D: true,
      overwrite: 'auto',
    })
  }

  el.addEventListener('mousemove', onMove, { passive: true })
  el.addEventListener('mouseleave', onLeave)

  return () => {
    el.removeEventListener('mousemove', onMove)
    el.removeEventListener('mouseleave', onLeave)
  }
}

export function useMagneticHover(
  element: Ref<HTMLElement | null>,
  options: MagneticHoverOptions = {},
) {
  const { strength = 0.3, scaleTo = 1.04, duration = motion.duration.normal } = options

  let boundMove: ((e: MouseEvent) => void) | null = null
  let boundLeave: (() => void) | null = null

  onMounted(() => {
    if (!element.value) return

    // Only enable on pointer devices
    if (!window.matchMedia('(hover: hover)').matches) return

    const el = element.value

    boundMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      const offsetX = (e.clientX - centerX) * strength
      const offsetY = (e.clientY - centerY) * strength

      gsap.to(el, {
        x: offsetX,
        y: offsetY,
        scale: scaleTo,
        duration,
        ease: motion.ease.out,
        force3D: true,
      })
    }

    boundLeave = () => {
      gsap.to(el, {
        x: 0,
        y: 0,
        scale: 1,
        duration: motion.duration.moderate,
        ease: motion.ease.elastic,
        force3D: true,
      })
    }

    el.addEventListener('mousemove', boundMove, { passive: true })
    el.addEventListener('mouseleave', boundLeave)
  })

  onUnmounted(() => {
    if (!element.value) return
    if (boundMove) element.value.removeEventListener('mousemove', boundMove)
    if (boundLeave) element.value.removeEventListener('mouseleave', boundLeave)
  })
}
