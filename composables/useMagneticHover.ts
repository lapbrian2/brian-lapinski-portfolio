import { onMounted, onUnmounted, type Ref } from 'vue'
import gsap from 'gsap'

interface MagneticHoverOptions {
  strength?: number
  scaleTo?: number
  duration?: number
}

export function useMagneticHover(
  element: Ref<HTMLElement | null>,
  options: MagneticHoverOptions = {},
) {
  const { strength = 0.3, scaleTo = 1.04, duration = 0.4 } = options

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
        ease: 'power2.out',
        force3D: true,
      })
    }

    boundLeave = () => {
      gsap.to(el, {
        x: 0,
        y: 0,
        scale: 1,
        duration: 0.6,
        ease: 'elastic.out(1, 0.5)',
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
