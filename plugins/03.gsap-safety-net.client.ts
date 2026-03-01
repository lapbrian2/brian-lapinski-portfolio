/**
 * GSAP Animation Safety Net
 *
 * Protects against invisible content if ScrollTrigger animations
 * never fire (JS errors, rapid navigation, module loading issues).
 *
 * After a generous timeout, any element still holding an inline
 * `opacity: 0` from `gsap.set()` is smoothly revealed. Hero-cycle
 * images are excluded since they are intentionally managed.
 */
export default defineNuxtPlugin(() => {
  const SAFETY_DELAY = 8000 // ms — enough for all normal entrance animations

  const timer = setTimeout(() => {
    document.querySelectorAll<HTMLElement>('[style]').forEach((el) => {
      // Only care about elements GSAP set to invisible
      if (el.style.opacity === '' || parseFloat(el.style.opacity) > 0.05) return

      // Don't touch hero-cycle images — they're intentionally opacity:0 when inactive
      if (el.classList.contains('hero-img')) return

      // Smooth reveal: clear inline opacity & transform so CSS defaults (opacity:1) take over
      el.style.transition = 'opacity 0.6s ease, transform 0.6s ease'
      el.style.opacity = ''
      el.style.transform = ''
    })
  }, SAFETY_DELAY)

  // Cancel on route change so fresh page animations aren't interfered with
  const router = useRouter()
  router.afterEach(() => {
    clearTimeout(timer)
  })
})
