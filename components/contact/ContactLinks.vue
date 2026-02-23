<template>
  <div ref="linksRef" class="max-w-3xl mx-auto">
    <a
      v-for="(link, i) in links"
      :key="link.label"
      :href="link.href"
      target="_blank"
      rel="noopener noreferrer"
      class="group relative flex items-center justify-between py-6 border-b border-dark-700/60 transition-colors duration-300 hover:border-lavender-400/30"
      data-cursor-text="Open"
      @mouseenter="onEnter($event.currentTarget as HTMLElement)"
      @mouseleave="onLeave($event.currentTarget as HTMLElement)"
    >
      <div class="flex items-center gap-5">
        <span class="font-body text-xs text-lavender-500 tabular-nums w-8">
          {{ String(i + 1).padStart(2, '0') }}
        </span>
        <span class="font-body text-xs text-lavender-400 uppercase tracking-[0.15em] w-24">
          {{ link.type }}
        </span>
        <span class="font-display text-xl md:text-2xl text-lavender-100 group-hover:text-accent-red transition-colors duration-300">
          {{ link.label }}
        </span>
      </div>
      <span class="link-arrow flex-shrink-0 w-10 h-10 rounded-full border border-dark-600 flex items-center justify-center text-lavender-400 group-hover:border-accent-red/40 group-hover:text-accent-red transition-all duration-300">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
          <line x1="2" y1="12" x2="12" y2="2" />
          <polyline points="5 2 12 2 12 9" />
        </svg>
      </span>

      <!-- Animated underline -->
      <div class="absolute bottom-0 left-0 h-px bg-accent-red/30 origin-left" style="width: 0%" />
    </a>
  </div>
</template>

<script setup lang="ts">
import gsap from 'gsap'
import { useScrollReveal } from '~/composables/useScrollReveal'

interface ContactLink {
  type: string
  label: string
  href: string
}

const links: ContactLink[] = [
  { type: 'LinkedIn', label: 'Brian Lapinski', href: 'https://www.linkedin.com/in/brian-lapinski-a65238352' },
  { type: 'X / Twitter', label: '@Lapbrian2', href: 'https://x.com/Lapbrian2' },
]

const linksRef = ref<HTMLElement | null>(null)

useScrollReveal(linksRef, {
  y: 20,
  stagger: 0.1,
  children: true,
})

function onEnter(el: HTMLElement) {
  const arrow = el.querySelector('.link-arrow')
  const line = el.querySelector('div:last-child')
  gsap.to(arrow, { scale: 1.1, duration: 0.3, ease: 'power2.out' })
  gsap.to(el, { x: 4, duration: 0.3, ease: 'power2.out' })
  if (line) gsap.to(line, { width: '100%', duration: 0.4, ease: 'power2.out' })
}

function onLeave(el: HTMLElement) {
  const arrow = el.querySelector('.link-arrow')
  const line = el.querySelector('div:last-child')
  gsap.to(arrow, { scale: 1, duration: 0.3, ease: 'power2.out' })
  gsap.to(el, { x: 0, duration: 0.3, ease: 'power2.out' })
  if (line) gsap.to(line, { width: '0%', duration: 0.3, ease: 'power2.in' })
}
</script>
