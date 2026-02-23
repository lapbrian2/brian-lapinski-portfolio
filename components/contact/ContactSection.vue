<template>
  <section id="contact" ref="sectionEl" class="section relative overflow-hidden">
    <!-- Warm radial glow — reveals on scroll -->
    <div
      ref="glowEl"
      class="absolute pointer-events-none"
      style="top: -10%; left: 50%; transform: translateX(-50%); width: 120%; height: 80%; opacity: 0"
    >
      <div class="w-full h-full rounded-full" style="background: radial-gradient(ellipse 50% 60% at 50% 40%, rgba(237, 84, 77, 0.08) 0%, rgba(237, 84, 77, 0.03) 40%, transparent 70%)" />
    </div>

    <div class="max-w-5xl mx-auto relative z-10">
      <!-- Label -->
      <p ref="labelEl" class="font-body text-xs uppercase tracking-[0.2em] text-lavender-400 mb-8 opacity-0">
        Get in touch
      </p>

      <!-- Large CTA heading with character animation -->
      <h2
        ref="headingEl"
        class="font-display text-hero font-bold text-lavender-100 mb-6 leading-none"
        style="perspective: 400px"
      >
        Let's Create Together
      </h2>
      <p ref="subtitleEl" class="font-body text-lg text-lavender-300 mb-20 max-w-2xl opacity-0">
        Have a project, collaboration, or just want to talk about AI art?
      </p>

      <!-- Contact Form -->
      <div ref="formWrapEl" class="opacity-0">
        <ContactForm />
      </div>

      <!-- Direct email fallback -->
      <p class="font-body text-sm text-lavender-400/60 mt-8 opacity-0" ref="emailFallbackEl">
        Or email directly at
        <a href="mailto:brian@lapinski.art" class="text-lavender-300 hover:text-accent-red transition-colors duration-200 underline underline-offset-4">
          brian@lapinski.art
        </a>
      </p>
    </div>

    <!-- Social links below -->
    <div class="mt-20 relative z-10">
      <ContactLinks />
    </div>
  </section>
</template>

<script setup lang="ts">
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useSectionTransition } from '~/composables/useSectionTransition'
const sectionEl = ref<HTMLElement | null>(null)
const labelEl = ref<HTMLElement | null>(null)
const headingEl = ref<HTMLElement | null>(null)
const subtitleEl = ref<HTMLElement | null>(null)
const formWrapEl = ref<HTMLElement | null>(null)
const emailFallbackEl = ref<HTMLElement | null>(null)
const glowEl = ref<HTMLElement | null>(null)

useSectionTransition(sectionEl, { scaleFrom: 0.95 })

let ctx: gsap.Context | null = null

onMounted(async () => {
  if (!headingEl.value) return

  const { default: Splitting } = await import('splitting')

  ctx = gsap.context(() => {
    // Warm glow reveal — scrub-driven radial pulse
    if (glowEl.value) {
      gsap.to(glowEl.value, {
        opacity: 1,
        scale: 1.1,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionEl.value!,
          start: 'top 80%',
          end: 'top 20%',
          scrub: true,
        },
      })
    }

    // Character-level split animation from center
    const result = Splitting({ target: headingEl.value!, by: 'chars' })
    const chars = result[0]?.chars || []

    if (chars.length) {
      gsap.set(chars, { opacity: 0, y: 40, rotateX: -60 })

      ScrollTrigger.create({
        trigger: headingEl.value!,
        start: 'top 80%',
        once: true,
        onEnter: () => {
          // Label slides in first
          if (labelEl.value) {
            gsap.to(labelEl.value, {
              opacity: 1,
              duration: 0.5,
              ease: 'power2.out',
            })
          }

          gsap.to(chars, {
            opacity: 1,
            y: 0,
            rotateX: 0,
            duration: 0.7,
            stagger: { each: 0.03, from: 'center' },
            ease: 'power4.out',
            force3D: true,
          })

          // Subtitle fades in after heading
          gsap.to(subtitleEl.value, {
            opacity: 1,
            y: 0,
            duration: 0.6,
            delay: 0.5,
            ease: 'power2.out',
          })

          // Form slides in
          if (formWrapEl.value) {
            gsap.to(formWrapEl.value, {
              opacity: 1,
              y: 0,
              duration: 0.8,
              delay: 0.7,
              ease: 'power3.out',
            })
          }

          // Email fallback fades in
          if (emailFallbackEl.value) {
            gsap.to(emailFallbackEl.value, {
              opacity: 1,
              duration: 0.5,
              delay: 1,
              ease: 'power2.out',
            })
          }
        },
      })
    }
  }, sectionEl.value!)
})

onUnmounted(() => {
  ctx?.revert()
})
</script>

<style scoped>
:deep(.char) {
  display: inline-block;
  will-change: transform, opacity;
}
</style>
