import { onMounted, onUnmounted, type Ref } from 'vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useIsMobile, useReducedMotion } from './useMediaQuery'
import { motion } from './useMotion'

interface SectionTransitionOptions {
  parallaxIntensity?: number
  scaleFrom?: number
  opacityFrom?: number
  enterStart?: string
  enterEnd?: string
  scrub?: number
}

export function useSectionTransition(
  element: Ref<HTMLElement | null>,
  options: SectionTransitionOptions = {},
) {
  const {
    parallaxIntensity = 0.3,
    scaleFrom = 0.97,
    opacityFrom = 0.3,
    enterStart = 'top 95%',
    enterEnd = 'top 40%',
    scrub = 1.5,
  } = options

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
        // Mobile: simple reveal (no scrub parallax)
        gsap.set(element.value!, { opacity: 0, y: 40 })
        ScrollTrigger.create({
          trigger: element.value!,
          start: 'top 90%',
          once: true,
          onEnter: () => {
            gsap.to(element.value!, {
              opacity: 1,
              y: 0,
              duration: motion.duration.slow,
              ease: motion.ease.out,
              force3D: true,
            })
          },
        })
        return
      }

      // Desktop: scroll-scrubbed entrance
      gsap.set(element.value!, {
        opacity: opacityFrom,
        scale: scaleFrom,
        y: parallaxIntensity * 100,
      })

      gsap.to(element.value!, {
        opacity: 1,
        scale: 1,
        y: 0,
        ease: 'none',
        force3D: true,
        scrollTrigger: {
          trigger: element.value!,
          start: enterStart,
          end: enterEnd,
          scrub,
        },
      })

      // Exit parallax: content drifts up slightly as scrolled past
      gsap.to(element.value!, {
        y: -(parallaxIntensity * 50),
        ease: 'none',
        scrollTrigger: {
          trigger: element.value!,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      })
    }, element.value)
  })

  onUnmounted(() => {
    ctx?.revert()
  })
}
