import { onMounted, onUnmounted, nextTick } from 'vue'

export interface SectionDef {
  id: string
  label: string
}

export const SECTIONS: SectionDef[] = [
  { id: 'work', label: 'Work' },
  { id: 'about', label: 'About' },
  { id: 'process', label: 'Process' },
  { id: 'contact', label: 'Contact' },
]

function useActiveSectionState() {
  const activeSection = useState<string>('active-section', () => '')
  return { activeSection }
}

/**
 * Owner composable -- sets up the IntersectionObserver.
 * Call once from AppHeader (or whichever component owns the lifecycle).
 */
export function useActiveSection() {
  const { activeSection } = useActiveSectionState()
  let observer: IntersectionObserver | null = null

  onMounted(() => {
    nextTick(() => {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              activeSection.value = entry.target.id
            }
          })
        },
        { rootMargin: '-20% 0px -60% 0px', threshold: 0 },
      )

      SECTIONS.forEach((s) => {
        const el = document.querySelector(`#${s.id}`)
        if (el) observer!.observe(el)
      })
    })
  })

  onUnmounted(() => {
    observer?.disconnect()
    observer = null
  })

  return { activeSection, sections: SECTIONS }
}

/**
 * Read-only consumer -- returns shared activeSection state without
 * creating an observer. Use from SectionProgressDots or any other
 * component that needs the current section.
 */
export function useActiveSectionValue() {
  const { activeSection } = useActiveSectionState()
  return { activeSection, sections: SECTIONS }
}
