import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

export default defineNuxtPlugin(() => {
  const lenis = new Lenis({
    duration: 1.2,
    easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    touchMultiplier: 2,
  })

  // Sync Lenis scroll position with GSAP ScrollTrigger
  lenis.on('scroll', ScrollTrigger.update)

  // Use GSAP ticker for Lenis RAF loop (shared frame = no jitter)
  gsap.ticker.add((time: number) => {
    lenis.raf(time * 1000)
  })

  // Disable GSAP lag smoothing for buttery Lenis sync
  gsap.ticker.lagSmoothing(0)

  // Refresh ScrollTrigger after Lenis initializes
  ScrollTrigger.refresh()

  return {
    provide: {
      lenis,
    },
  }
})
