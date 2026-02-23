import { onMounted, onUnmounted, type Ref } from 'vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Splitting from 'splitting'

interface TextRevealOptions {
  by?: 'chars' | 'words'
  y?: number
  rotateX?: number
  blur?: number
  stagger?: number
  staggerFrom?: string | number
  duration?: number
  delay?: number
  ease?: string
  scrollTrigger?: boolean
  triggerStart?: string
  once?: boolean
}

export function useTextReveal(
  element: Ref<HTMLElement | null>,
  options: TextRevealOptions = {},
) {
  const {
    by = 'chars',
    y = 80,
    rotateX = -90,
    blur = 0,
    stagger = 0.04,
    staggerFrom = 'start',
    duration = 0.9,
    delay = 0,
    ease = 'power4.out',
    scrollTrigger = false,
    triggerStart = 'top 80%',
    once = true,
  } = options

  let ctx: gsap.Context | null = null
  let tl: gsap.core.Timeline | null = null

  function play() {
    tl?.play()
  }

  onMounted(() => {
    if (!element.value) return

    ctx = gsap.context(() => {
      const result = Splitting({ target: element.value!, by })
      const targets = by === 'chars' ? result[0].chars : result[0].words

      if (!targets || targets.length === 0) return

      const fromVars: gsap.TweenVars = { opacity: 0, y }
      const toVars: gsap.TweenVars = {
        opacity: 1,
        y: 0,
        duration,
        stagger: { each: stagger, from: staggerFrom },
        ease,
        force3D: true,
      }

      if (by === 'chars' && rotateX !== 0) {
        fromVars.rotateX = rotateX
        toVars.rotateX = 0
        if (element.value) {
          element.value.style.perspective = '400px'
        }
      }

      if (blur > 0) {
        fromVars.filter = `blur(${blur}px)`
        toVars.filter = 'blur(0px)'
      }

      gsap.set(targets, fromVars)

      tl = gsap.timeline({ paused: !scrollTrigger ? true : false })
      tl.to(targets, toVars)

      if (scrollTrigger) {
        tl.pause()
        ScrollTrigger.create({
          trigger: element.value,
          start: triggerStart,
          once,
          onEnter: () => tl!.play(),
        })
      }
    }, element.value)
  })

  onUnmounted(() => {
    ctx?.revert()
  })

  return { play, element }
}
