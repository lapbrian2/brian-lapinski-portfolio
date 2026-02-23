<template>
  <div ref="linksRef" class="max-w-2xl mx-auto">
    <a
      v-for="link in links"
      :key="link.label"
      :href="link.href"
      target="_blank"
      rel="noopener noreferrer"
      class="group relative flex items-center justify-between py-6 border-b border-dark-700 transition-colors duration-300 hover:border-lavender-400"
      data-cursor-text="Open"
      @mouseenter="onEnter($event.currentTarget as HTMLElement)"
      @mouseleave="onLeave($event.currentTarget as HTMLElement)"
    >
      <div class="flex items-center gap-4">
        <span class="font-body text-sm text-lavender-400 uppercase tracking-wider w-20">
          {{ link.type }}
        </span>
        <span class="font-display text-xl text-lavender-100 group-hover:text-accent-red transition-colors duration-200">
          {{ link.label }}
        </span>
      </div>
      <span class="link-arrow text-lavender-400 text-lg">
        &rarr;
      </span>

      <!-- Animated underline -->
      <div class="absolute bottom-0 left-0 h-px bg-accent-red/40 origin-left" style="width: 0%" />
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
  gsap.to(arrow, { x: 12, color: '#ede9fe', duration: 0.3, ease: 'power2.out' })
  gsap.to(el, { scale: 1.01, duration: 0.3, ease: 'power2.out' })
  if (line) gsap.to(line, { width: '100%', duration: 0.4, ease: 'power2.out' })
}

function onLeave(el: HTMLElement) {
  const arrow = el.querySelector('.link-arrow')
  const line = el.querySelector('div:last-child')
  gsap.to(arrow, { x: 0, color: '', duration: 0.3, ease: 'power2.out' })
  gsap.to(el, { scale: 1, duration: 0.3, ease: 'power2.out' })
  if (line) gsap.to(line, { width: '0%', duration: 0.3, ease: 'power2.in' })
}
</script>
