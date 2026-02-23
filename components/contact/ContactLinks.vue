<template>
  <div ref="linksRef" class="max-w-2xl mx-auto">
    <a
      v-for="link in links"
      :key="link.label"
      :href="link.href"
      target="_blank"
      rel="noopener noreferrer"
      class="group flex items-center justify-between py-5 border-b border-dark-700 transition-colors duration-200 hover:border-lavender-400"
    >
      <div class="flex items-center gap-4">
        <span class="font-body text-sm text-lavender-400 uppercase tracking-wider w-20">
          {{ link.type }}
        </span>
        <span class="font-display text-xl text-lavender-100 group-hover:text-accent-red transition-colors duration-200">
          {{ link.label }}
        </span>
      </div>
      <span
        class="text-lavender-400 group-hover:text-lavender-100 group-hover:translate-x-1 transition-all duration-200"
      >
        &rarr;
      </span>
    </a>
  </div>
</template>

<script setup lang="ts">
import { useScrollReveal } from '~/composables/useScrollReveal'

interface ContactLink {
  type: string
  label: string
  href: string
}

const links: ContactLink[] = [
  { type: 'Email', label: 'hello@brianlapinski.com', href: 'mailto:hello@brianlapinski.com' },
  { type: 'LinkedIn', label: 'Brian Lapinski', href: 'https://linkedin.com/in/brianlapinski' },
  { type: 'Instagram', label: '@brianlapinski', href: 'https://instagram.com/brianlapinski' },
  { type: 'Twitter', label: '@brianlapinski', href: 'https://x.com/brianlapinski' },
]

const linksRef = ref<HTMLElement | null>(null)

useScrollReveal(linksRef, {
  y: 20,
  stagger: 0.1,
  children: true,
})
</script>
