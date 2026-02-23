<template>
  <header
    :class="[
      'fixed top-0 left-0 w-full z-50 transition-all duration-300 px-6 md:px-12 py-4',
      scrolled ? 'bg-dark-900/95 backdrop-blur-md shadow-lg' : 'bg-transparent',
    ]"
  >
    <div class="max-w-[1400px] mx-auto flex items-center justify-between">
      <!-- Logo -->
      <a
        href="#"
        class="font-display font-bold text-2xl text-lavender-100 hover:text-accent-red transition-colors duration-200"
        @click.prevent="scrollToTop"
      >
        BL
      </a>

      <!-- Desktop Navigation -->
      <nav class="hidden md:flex items-center gap-8">
        <a
          v-for="link in navLinks"
          :key="link.id"
          :href="`#${link.id}`"
          class="font-body text-sm uppercase tracking-wider text-lavender-300 hover:text-lavender-100 transition-colors duration-200"
          @click.prevent="scrollToSection(link.id)"
        >
          {{ link.label }}
        </a>
      </nav>

      <!-- Mobile Hamburger Button -->
      <button
        class="md:hidden relative z-50 w-8 h-6 flex flex-col justify-between"
        aria-label="Toggle navigation menu"
        @click="toggleMobile"
      >
        <span
          :class="[
            'block w-full h-0.5 bg-lavender-100 transition-all duration-300 origin-center',
            mobileOpen ? 'rotate-45 translate-y-[11px]' : '',
          ]"
        />
        <span
          :class="[
            'block w-full h-0.5 bg-lavender-100 transition-all duration-300',
            mobileOpen ? 'opacity-0 scale-x-0' : 'opacity-100 scale-x-100',
          ]"
        />
        <span
          :class="[
            'block w-full h-0.5 bg-lavender-100 transition-all duration-300 origin-center',
            mobileOpen ? '-rotate-45 -translate-y-[11px]' : '',
          ]"
        />
      </button>
    </div>

    <!-- Mobile Overlay Menu -->
    <Transition name="mobile-menu">
      <div
        v-if="mobileOpen"
        class="fixed inset-0 z-40 bg-dark-900 flex items-center justify-center"
      >
        <nav class="flex flex-col items-center gap-8">
          <a
            v-for="link in navLinks"
            :key="link.id"
            :href="`#${link.id}`"
            class="font-display text-2xl text-lavender-300 hover:text-lavender-100 transition-colors duration-200"
            @click.prevent="scrollToSection(link.id)"
          >
            {{ link.label }}
          </a>
        </nav>
      </div>
    </Transition>
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

interface NavLink {
  id: string
  label: string
}

const navLinks: NavLink[] = [
  { id: 'work', label: 'Work' },
  { id: 'about', label: 'About' },
  { id: 'process', label: 'Process' },
  { id: 'contact', label: 'Contact' },
]

const scrolled = ref(false)
const mobileOpen = ref(false)

function handleScroll(): void {
  scrolled.value = window.scrollY > 80
}

function scrollToTop(): void {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function scrollToSection(sectionId: string): void {
  mobileOpen.value = false
  document.querySelector(`#${sectionId}`)?.scrollIntoView({ behavior: 'smooth' })
}

function toggleMobile(): void {
  mobileOpen.value = !mobileOpen.value
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
  handleScroll()
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
.mobile-menu-enter-active,
.mobile-menu-leave-active {
  transition: opacity 0.3s ease;
}

.mobile-menu-enter-from,
.mobile-menu-leave-to {
  opacity: 0;
}
</style>
