import { onMounted, onUnmounted, type Ref } from 'vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useIsMobile, useReducedMotion } from './useMediaQuery'

interface SectionTransitionOptions {
  scaleFrom?: number
  opacityFrom?: number
  enterStart?: string
}

/**
 * Lightweight section reveal — fires once on scroll, no continuous scrub.
 * Eliminates the "dragging through mud" feel of scrub-based transitions.
 */
export function useSectionTransition(
  element: Ref<HTMLElement | null>,
  options: SectionTransitionOptions = {},
) {
  const {
    scaleFrom = 0.99,
    opacityFrom = 0.8,
    enterStart = 'top 90%',
  } = options

  // Clamp opacityFrom so sections are never too dim before reveal
  const clampedOpacity = Math.max(opacityFrom, 0.6)

  const isMobile = useIsMobile()
  const reducedMotion = useReducedMotion()
  let ctx: gsap.Context | null = null

  onMounted(() => {
    if (!element.value) return

    if (reducedMotion.value) {
      gsap.set(element.value!, { opacity: 1, scale: 1, y: 0 })
      return
    }

    ctx = gsap.context(() => {
      if (isMobile.value) {
        // Mobile: simple fade-up reveal
        gsap.set(element.value!, { opacity: 0, y: 30 })
        ScrollTrigger.create({
          trigger: element.value!,
          start: 'top 90%',
          once: true,
          onEnter: () => {
            gsap.to(element.value!, {
              opacity: 1,
              y: 0,
              duration: 0.7,
              ease: 'power2.out',
              force3D: true,
              onComplete() {
                gsap.set(this.targets()[0], { clearProps: 'willChange,force3D' })
              },
            })
          },
        })
        return
      }

      // Desktop: one-shot reveal — no scrub, no scroll resistance
      gsap.set(element.value!, {
        opacity: clampedOpacity,
        scale: scaleFrom,
        y: 20,
      })

      ScrollTrigger.create({
        trigger: element.value!,
        start: enterStart,
        once: true,
        onEnter: () => {
          gsap.to(element.value!, {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: 0.8,
            ease: 'power2.out',
            force3D: true,
            onComplete() {
              // Release compositor layer after one-shot reveal
              gsap.set(this.targets()[0], { clearProps: 'willChange,force3D' })
            },
          })
        },
      })
    }, element.value)
  })

  onUnmounted(() => {
    ctx?.revert()
  })
}
