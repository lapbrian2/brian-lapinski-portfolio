import { onMounted, onUnmounted, type Ref } from 'vue'
import gsap from 'gsap'

interface TiltOptions {
  /** CSS selector for tiltable children within the container */
  selector: string
  /** Maximum rotation in degrees (default: 6) */
  maxRotation?: number
  /** CSS perspective value in px (default: 800) */
  perspective?: number
}

/**
 * 3D perspective tilt that follows cursor position within child elements.
 * Uses event delegation on the container for efficient binding on dynamic lists.
 * Desktop-only; respects prefers-reduced-motion.
 */
export function useTiltHover(container: Ref<HTMLElement | null>, options: TiltOptions) {
  const { selector, maxRotation = 6, perspective = 800 } = options
  let currentCard: Element | null = null
  let boundMove: ((e: MouseEvent) => void) | null = null
  let boundLeave: (() => void) | null = null

  function resetCard(card: Element) {
    gsap.to(card, {
      rotateX: 0,
      rotateY: 0,
      duration: 0.6,
      ease: 'elastic.out(1, 0.5)',
      overwrite: 'auto',
      force3D: true,
    })
  }

  onMounted(() => {
    if (!container.value) return
    if (!window.matchMedia('(hover: hover)').matches) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    boundMove = (e: MouseEvent) => {
      const card = (e.target as HTMLElement).closest(selector) as HTMLElement | null

      if (currentCard && currentCard !== card) {
        resetCard(currentCard)
      }

      currentCard = card
      if (!card) return

      const rect = card.getBoundingClientRect()
      const percentX = ((e.clientX - rect.left) / rect.width - 0.5) * 2
      const percentY = ((e.clientY - rect.top) / rect.height - 0.5) * 2

      gsap.to(card, {
        rotateY: percentX * maxRotation,
        rotateX: -percentY * maxRotation,
        transformPerspective: perspective,
        duration: 0.3,
        ease: 'power2.out',
        overwrite: 'auto',
        force3D: true,
      })
    }

    boundLeave = () => {
      if (currentCard) {
        resetCard(currentCard)
        currentCard = null
      }
    }

    container.value.addEventListener('mousemove', boundMove, { passive: true })
    container.value.addEventListener('mouseleave', boundLeave)
  })

  onUnmounted(() => {
    if (container.value) {
      if (boundMove) container.value.removeEventListener('mousemove', boundMove)
      if (boundLeave) container.value.removeEventListener('mouseleave', boundLeave)
    }
  })
}
