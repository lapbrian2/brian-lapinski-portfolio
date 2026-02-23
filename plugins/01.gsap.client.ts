import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ScrollToPlugin } from 'gsap/ScrollToPlugin'

export default defineNuxtPlugin(() => {
  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin)

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  gsap.defaults({
    ease: prefersReducedMotion ? 'none' : 'power2.out',
    duration: prefersReducedMotion ? 0.01 : 0.8,
  })

  // Globally disable ScrollTrigger animations for reduced motion
  if (prefersReducedMotion) {
    gsap.globalTimeline.timeScale(20)
  }

  return {
    provide: {
      gsap,
      ScrollTrigger,
    },
  }
})
