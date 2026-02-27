import { onMounted, onUnmounted, type Ref } from 'vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useReducedMotion } from './useMediaQuery'
import { motion } from './useMotion'

interface ScrollRevealOptions {
  y?: number
  x?: number
  opacity?: number
  duration?: number
  delay?: number
  stagger?: number
  start?: string
  once?: boolean
  ease?: string
  children?: boolean
}

export function useScrollReveal(
  element: Ref<HTMLElement | null>,
  options: ScrollRevealOptions = {},
) {
  const {
    y = 40,
    x = 0,
    opacity = 0,
    duration = motion.duration.slow,
    delay = 0,
    stagger = 0,
    start = 'top 85%',
    once = true,
    ease = motion.ease.out,
    children = false,
  } = options

  const reducedMotion = useReducedMotion()
  let ctx: gsap.Context | null = null

  onMounted(() => {
    if (!element.value) return

    const targets = children ? element.value!.children : element.value

    if (reducedMotion.value) {
      gsap.set(targets, { opacity: 1, y: 0, x: 0 })
      return
    }

    ctx = gsap.context(() => {
      gsap.set(targets, { opacity, y, x })

      ScrollTrigger.create({
        trigger: element.value,
        start,
        once,
        onEnter: () => {
          gsap.to(targets, {
            opacity: 1,
            y: 0,
            x: 0,
            duration,
            delay,
            stagger,
            ease,
            force3D: true,
            onComplete() {
              // Release compositor layers after reveal completes
              const t = this.targets()
              t.forEach((el: HTMLElement) => gsap.set(el, { clearProps: 'willChange,force3D' }))
            },
          })
        },
      })
    }, element.value)
  })

  onUnmounted(() => {
    ctx?.revert()
  })

  return { element }
}
