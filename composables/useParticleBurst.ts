import gsap from 'gsap'

const PARTICLE_COUNT = 6
const PARTICLE_DISTANCE = 40 // px
const PARTICLE_SIZE = 4 // px
const PARTICLE_DURATION = 0.6 // seconds

/**
 * Particle burst utility — 6 small dots explode outward from an element's center.
 * GPU-friendly: only uses transform + opacity. Auto-cleans up DOM nodes.
 */
export function useParticleBurst() {
  function burst(el: HTMLElement | null, color = '#ed544d') {
    if (!el) return

    // Check reduced motion preference
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return
    }

    const rect = el.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const angle = (360 / PARTICLE_COUNT) * i * (Math.PI / 180)
      const distance = PARTICLE_DISTANCE + Math.random() * 15

      const dot = document.createElement('div')
      dot.style.cssText = `
        position: fixed;
        z-index: 200;
        top: ${cy - PARTICLE_SIZE / 2}px;
        left: ${cx - PARTICLE_SIZE / 2}px;
        width: ${PARTICLE_SIZE}px;
        height: ${PARTICLE_SIZE}px;
        border-radius: 50%;
        background: ${color};
        pointer-events: none;
        will-change: transform, opacity;
      `
      document.body.appendChild(dot)

      gsap.to(dot, {
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance,
        opacity: 0,
        scale: 0.3,
        duration: PARTICLE_DURATION,
        ease: 'power2.out',
        force3D: true,
        onComplete: () => dot.remove(),
      })
    }
  }

  return { burst }
}
