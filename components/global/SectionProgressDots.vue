<script setup lang="ts">
import { useActiveSectionValue } from '~/composables/useActiveSection'
import { useIsMobile } from '~/composables/useMediaQuery'

const { activeSection, sections } = useActiveSectionValue()
const isMobile = useIsMobile()
const route = useRoute()
const lightbox = useLightbox()

const visible = computed(() => {
  return !isMobile.value && !lightbox.isOpen.value && route.path === '/'
})

function scrollToSection(sectionId: string): void {
  const { $lenis } = useNuxtApp()
  const target = document.querySelector(`#${sectionId}`)
  if (!target) return

  if ($lenis) {
    ;($lenis as any).scrollTo(target, { offset: -80 })
  } else {
    target.scrollIntoView({ behavior: 'smooth' })
  }
}
</script>

<template>
  <nav
    v-show="visible"
    aria-label="Section navigation"
    class="fixed right-6 top-1/2 -translate-y-1/2 z-[55] flex flex-col items-center gap-4 transition-opacity duration-300"
    :class="visible ? 'opacity-100' : 'opacity-0'"
  >
    <button
      v-for="section in sections"
      :key="section.id"
      class="group relative flex items-center justify-center p-2"
      :aria-label="`Scroll to ${section.label}`"
      :aria-current="activeSection === section.id ? 'location' : undefined"
      @click="scrollToSection(section.id)"
    >
      <!-- Dot -->
      <span
        class="block rounded-full transition-all duration-200"
        :class="activeSection === section.id
          ? 'w-2 h-2 bg-accent-red shadow-[0_0_8px_rgba(237,84,77,0.4)]'
          : 'w-1.5 h-1.5 bg-lavender-400/40 group-hover:bg-lavender-400/60'"
      />
      <!-- Tooltip -->
      <span
        class="absolute right-full mr-3 px-2.5 py-1 rounded-md bg-dark-900/80 backdrop-blur-sm border border-white/10 font-body text-[10px] uppercase tracking-wider text-lavender-200 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
      >
        {{ section.label }}
      </span>
    </button>
  </nav>
</template>
