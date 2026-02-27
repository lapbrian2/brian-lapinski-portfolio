<template>
  <div ref="linksRef" class="max-w-4xl mx-auto">
    <!-- Section label -->
    <p ref="labelEl" class="font-body text-xs uppercase tracking-[0.2em] text-lavender-400/50 mb-8 text-center opacity-0">
      Connect
    </p>

    <!-- Card grid -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
      <a
        v-for="link in links"
        :key="link.label"
        :href="link.href"
        target="_blank"
        rel="noopener noreferrer"
        class="btn-press link-card group relative overflow-hidden rounded-xl border border-lavender-400/8 bg-dark-800/40 backdrop-blur-sm p-8 flex flex-col items-center text-center transition-colors duration-500 hover:border-lavender-400/20 opacity-0"
        :data-color="link.color"
        data-cursor-text="Open"
        @mouseenter="onEnter($event.currentTarget as HTMLElement)"
        @mouseleave="onLeave($event.currentTarget as HTMLElement)"
      >
        <!-- Accent top border — draws in on entrance -->
        <div class="link-card__accent absolute top-0 left-0 right-0 h-[2px] origin-left" :style="`background: ${link.color}50`" />

        <!-- Hover glow -->
        <div
          class="glow-orb absolute pointer-events-none rounded-full opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          :style="`top: -40%; left: 50%; transform: translateX(-50%); width: 200%; height: 120%; background: radial-gradient(ellipse 40% 50% at 50% 60%, ${link.color}12 0%, ${link.color}06 40%, transparent 70%)`"
        />

        <!-- Icon -->
        <div
          class="icon-ring relative z-10 w-14 h-14 rounded-full flex items-center justify-center mb-6 transition-all duration-500"
          :style="`border: 1px solid ${link.color}25; background: linear-gradient(135deg, ${link.color}08, ${link.color}04)`"
        >
          <!-- LinkedIn -->
          <svg v-if="link.id === 'linkedin'" width="20" height="20" viewBox="0 0 24 24" fill="none" class="text-lavender-300 transition-colors duration-300 group-hover:text-lavender-100">
            <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            <rect x="2" y="9" width="4" height="12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            <circle cx="4" cy="4" r="2" stroke="currentColor" stroke-width="1.5" />
          </svg>
          <!-- X / Twitter -->
          <svg v-if="link.id === 'twitter'" width="18" height="18" viewBox="0 0 24 24" fill="none" class="text-lavender-300 transition-colors duration-300 group-hover:text-lavender-100">
            <path d="M4 4l6.5 8L4 20h2l5.5-6.8L16 20h4l-6.8-8.5L19.5 4h-2l-5 6.2L8 4H4z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          <!-- Instagram -->
          <svg v-if="link.id === 'instagram'" width="20" height="20" viewBox="0 0 24 24" fill="none" class="text-lavender-300 transition-colors duration-300 group-hover:text-lavender-100">
            <rect x="2" y="2" width="20" height="20" rx="5" stroke="currentColor" stroke-width="1.5" />
            <circle cx="12" cy="12" r="5" stroke="currentColor" stroke-width="1.5" />
            <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
          </svg>
        </div>

        <!-- Platform name -->
        <span class="relative z-10 font-body text-[10px] uppercase tracking-[0.2em] text-lavender-400/50 mb-2 transition-colors duration-300 group-hover:text-lavender-400/80">
          {{ link.type }}
        </span>

        <!-- Handle / name -->
        <span class="relative z-10 font-display text-lg text-lavender-100 transition-colors duration-300 group-hover:text-white">
          {{ link.label }}
        </span>

        <!-- Subtle arrow indicator -->
        <div class="link-arrow relative z-10 mt-5 w-8 h-8 rounded-full border border-lavender-400/10 flex items-center justify-center text-lavender-400/40 transition-all duration-500 group-hover:border-lavender-400/25 group-hover:text-lavender-300">
          <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
            <line x1="3" y1="11" x2="11" y2="3" />
            <polyline points="5 3 11 3 11 9" />
          </svg>
        </div>
      </a>
    </div>
  </div>
</template>

<script setup lang="ts">
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useReducedMotion } from '~/composables/useMediaQuery'

interface ContactLink {
  id: string
  type: string
  label: string
  href: string
  color: string
}

const links: ContactLink[] = [
  { id: 'linkedin', type: 'LinkedIn', label: 'Brian Lapinski', href: 'https://www.linkedin.com/in/brian-lapinski-a65238352', color: '#0A66C2' },
  { id: 'twitter', type: 'X / Twitter', label: '@Lapbrian2', href: 'https://x.com/Lapbrian2', color: '#E7E9EA' },
  { id: 'instagram', type: 'Instagram', label: '@brian_lapinski1', href: 'https://www.instagram.com/brian_lapinski1/', color: '#E1306C' },
]

const linksRef = ref<HTMLElement | null>(null)
const labelEl = ref<HTMLElement | null>(null)
const reducedMotion = useReducedMotion()

let ctx: gsap.Context | null = null

onMounted(() => {
  if (!linksRef.value) return

  // Respect reduced-motion preference — show all content immediately
  if (reducedMotion.value) {
    if (labelEl.value) gsap.set(labelEl.value, { opacity: 1 })
    const cards = linksRef.value.querySelectorAll('.link-card')
    gsap.set(cards, { opacity: 1 })
    return
  }

  ctx = gsap.context(() => {
    const cards = linksRef.value!.querySelectorAll('.link-card')

    // Label fade
    if (labelEl.value) {
      ScrollTrigger.create({
        trigger: linksRef.value!,
        start: 'top 85%',
        once: true,
        onEnter: () => {
          gsap.to(labelEl.value, {
            opacity: 1,
            duration: 0.5,
            ease: 'power2.out',
          })
        },
      })
    }

    // Staggered card entrance with scale + fade
    const accents = linksRef.value!.querySelectorAll('.link-card__accent')
    if (cards.length) {
      gsap.set(cards, { opacity: 0, y: 40, scale: 0.95 })
      if (accents.length) gsap.set(accents, { scaleX: 0 })
      ScrollTrigger.create({
        trigger: linksRef.value!,
        start: 'top 80%',
        once: true,
        onEnter: () => {
          gsap.to(cards, {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.7,
            stagger: 0.12,
            ease: 'power3.out',
          })
          // Accent borders draw after cards land
          if (accents.length) {
            gsap.to(accents, {
              scaleX: 1,
              duration: 0.5,
              stagger: 0.12,
              delay: 0.5,
              ease: 'power2.out',
            })
          }
        },
      })
    }
  }, linksRef.value!)
})

onUnmounted(() => {
  ctx?.revert()
})

function onEnter(el: HTMLElement) {
  const arrow = el.querySelector('.link-arrow')
  const ring = el.querySelector('.icon-ring')
  const color = el.dataset.color || '#ed544d'
  gsap.to(el, { y: -4, duration: 0.4, ease: 'power2.out' })
  if (arrow) {
    gsap.to(arrow, { scale: 1.15, y: -2, duration: 0.3, ease: 'power2.out' })
  }
  if (ring) {
    gsap.to(ring, { borderColor: `${color}60`, boxShadow: `0 0 20px ${color}15`, duration: 0.4, ease: 'power2.out' })
  }
}

function onLeave(el: HTMLElement) {
  const arrow = el.querySelector('.link-arrow')
  const ring = el.querySelector('.icon-ring')
  const color = el.dataset.color || '#ed544d'
  gsap.to(el, { y: 0, duration: 0.4, ease: 'power2.out' })
  if (arrow) {
    gsap.to(arrow, { scale: 1, y: 0, duration: 0.3, ease: 'power2.out' })
  }
  if (ring) {
    gsap.to(ring, { borderColor: `${color}25`, boxShadow: '0 0 0 transparent', duration: 0.4, ease: 'power2.out' })
  }
}
</script>

<style scoped>
.link-card {
  will-change: transform;
}
</style>
