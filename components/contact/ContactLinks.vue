<template>
  <div ref="linksRef" class="connect-links max-w-5xl mx-auto">
    <!-- Section label -->
    <p ref="labelEl" class="font-body text-xs uppercase tracking-[0.2em] text-lavender-400/50 mb-8 text-center opacity-0">
      Connect
    </p>

    <!-- Editorial link rows -->
    <nav class="connect-links__nav" aria-label="Social media links">
      <div class="connect-links__border origin-left" />
      <a
        v-for="link in links"
        :key="link.id"
        :href="link.href"
        target="_blank"
        rel="noopener noreferrer"
        class="btn-press connect-links__row group relative overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-red focus-visible:ring-offset-2 focus-visible:ring-offset-dark-900 rounded-sm opacity-0"
        :data-color="link.color"
        data-cursor-text="Open"
        @mouseenter="onEnter($event.currentTarget as HTMLElement, link)"
        @mouseleave="onLeave($event.currentTarget as HTMLElement, link)"
      >
        <!-- Hover glow -->
        <div
          class="connect-links__glow absolute pointer-events-none opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          :style="`background: radial-gradient(ellipse 60% 80% at 50% 0%, ${link.color}10 0%, ${link.color}05 40%, transparent 70%)`"
        />

        <!-- Left: large platform name -->
        <span class="connect-links__name font-display font-bold uppercase leading-none relative z-10">
          {{ link.type }}
        </span>

        <!-- Right: icon + handle + arrow -->
        <div class="flex items-center gap-4 md:gap-6 relative z-10">
          <!-- Handle -->
          <span class="connect-links__handle hidden md:block font-body text-xs uppercase tracking-[0.15em]">
            {{ link.label }}
          </span>

          <!-- Platform icon -->
          <div class="connect-links__icon flex-shrink-0">
            <!-- LinkedIn -->
            <svg v-if="link.id === 'linkedin'" width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
              <rect x="2" y="9" width="4" height="12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
              <circle cx="4" cy="4" r="2" stroke="currentColor" stroke-width="1.5" />
            </svg>
            <!-- X / Twitter -->
            <svg v-if="link.id === 'twitter'" width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M4 4l6.5 8L4 20h2l5.5-6.8L16 20h4l-6.8-8.5L19.5 4h-2l-5 6.2L8 4H4z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            <!-- Instagram -->
            <svg v-if="link.id === 'instagram'" width="18" height="18" viewBox="0 0 24 24" fill="none">
              <rect x="2" y="2" width="20" height="20" rx="5" stroke="currentColor" stroke-width="1.5" />
              <circle cx="12" cy="12" r="5" stroke="currentColor" stroke-width="1.5" />
              <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
            </svg>
          </div>

          <!-- Arrow -->
          <svg
            class="connect-links__arrow flex-shrink-0"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
          >
            <line x1="4" y1="20" x2="20" y2="4" />
            <polyline points="8 4 20 4 20 16" />
          </svg>
        </div>

        <!-- Bottom border -->
        <div class="connect-links__border origin-left" />
      </a>
    </nav>
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
    const rows = linksRef.value.querySelectorAll('.connect-links__row')
    gsap.set(rows, { opacity: 1 })
    return
  }

  ctx = gsap.context(() => {
    const rows = linksRef.value!.querySelectorAll('.connect-links__row')
    const borders = linksRef.value!.querySelectorAll('.connect-links__border')

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

    // Staggered row entrance — clean translate, no scale
    if (rows.length) {
      gsap.set(rows, { opacity: 0, y: 30 })
      if (borders.length) gsap.set(borders, { scaleX: 0 })

      ScrollTrigger.create({
        trigger: linksRef.value!,
        start: 'top 80%',
        once: true,
        onEnter: () => {
          gsap.to(rows, {
            opacity: 1,
            y: 0,
            duration: 0.7,
            stagger: 0.1,
            ease: 'power3.out',
            force3D: true,
            onComplete() {
              this.targets().forEach((el: HTMLElement) => gsap.set(el, { clearProps: 'transform,willChange,force3D' }))
            },
          })

          // Borders draw in after rows land
          if (borders.length) {
            gsap.to(borders, {
              scaleX: 1,
              duration: 0.6,
              stagger: 0.08,
              delay: 0.4,
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

function onEnter(el: HTMLElement, link: ContactLink) {
  const name = el.querySelector('.connect-links__name') as HTMLElement
  const handle = el.querySelector('.connect-links__handle') as HTMLElement
  const icon = el.querySelector('.connect-links__icon') as HTMLElement
  const arrow = el.querySelector('.connect-links__arrow') as HTMLElement
  const border = el.querySelector('.connect-links__border') as HTMLElement

  if (name) {
    gsap.to(name, { color: '#dae2f2', letterSpacing: '0.02em', duration: 0.4, ease: 'power2.out' })
  }
  if (handle) {
    gsap.to(handle, { color: `${link.color}cc`, duration: 0.4, ease: 'power2.out' })
  }
  if (icon) {
    gsap.to(icon, { color: link.color, duration: 0.3, ease: 'power2.out' })
  }
  if (arrow) {
    gsap.to(arrow, { color: link.color, x: 4, y: -4, duration: 0.4, ease: 'power2.out' })
  }
  if (border) {
    gsap.to(border, { background: `${link.color}33`, duration: 0.4, ease: 'power2.out' })
  }
}

function onLeave(el: HTMLElement, _link: ContactLink) {
  const name = el.querySelector('.connect-links__name') as HTMLElement
  const handle = el.querySelector('.connect-links__handle') as HTMLElement
  const icon = el.querySelector('.connect-links__icon') as HTMLElement
  const arrow = el.querySelector('.connect-links__arrow') as HTMLElement
  const border = el.querySelector('.connect-links__border') as HTMLElement

  if (name) {
    gsap.to(name, { color: 'rgba(218, 226, 242, 0.2)', letterSpacing: '-0.03em', duration: 0.4, ease: 'power2.out' })
  }
  if (handle) {
    gsap.to(handle, { color: 'rgba(201, 210, 231, 0.35)', duration: 0.4, ease: 'power2.out' })
  }
  if (icon) {
    gsap.to(icon, { color: 'rgba(201, 210, 231, 0.25)', duration: 0.3, ease: 'power2.out' })
  }
  if (arrow) {
    gsap.to(arrow, { color: 'rgba(218, 226, 242, 0.1)', x: 0, y: 0, duration: 0.4, ease: 'power2.out' })
  }
  if (border) {
    gsap.to(border, { background: 'rgba(201, 210, 231, 0.08)', duration: 0.4, ease: 'power2.out' })
  }
}
</script>

<style scoped>
.connect-links__nav {
  display: flex;
  flex-direction: column;
  gap: 0;
  position: relative;
}

.connect-links__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem 0;
  position: relative;
  text-decoration: none;
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

/* Animated border lines */
.connect-links__border {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: rgba(201, 210, 231, 0.08);
}

.connect-links__nav > .connect-links__border {
  position: relative;
  height: 1px;
  margin-bottom: 0;
}

/* Large editorial platform name */
.connect-links__name {
  font-size: clamp(2rem, 5vw, 4rem);
  letter-spacing: -0.03em;
  color: rgba(218, 226, 242, 0.2);
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

/* Handle text */
.connect-links__handle {
  color: rgba(201, 210, 231, 0.35);
  transition: color 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

/* Icon */
.connect-links__icon {
  color: rgba(201, 210, 231, 0.25);
  transition: color 0.3s ease;
}

/* Arrow */
.connect-links__arrow {
  color: rgba(218, 226, 242, 0.1);
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

/* Hover glow */
.connect-links__glow {
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

/* Mobile */
@media (max-width: 767px) {
  .connect-links__row {
    padding: 1.25rem 0;
  }
}
</style>
