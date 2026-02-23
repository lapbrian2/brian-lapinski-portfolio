<template>
  <div ref="bioRef">
    <h2 class="font-display text-section font-bold text-lavender-100 mb-8">
      About
    </h2>
    <div class="space-y-6">
      <p class="font-body text-base leading-relaxed text-lavender-200">
        I use images as a way to explore what it means to be human. My work is
        rooted in personal exploration, emotion, and connection &mdash; not trends or
        technique for its own sake.
      </p>
      <p class="font-body text-base leading-relaxed text-lavender-300">
        I'm interested in images that speak without words and create a quiet
        connection between people. Through creating and teaching, I see
        image-making as a form of self-discovery and shared understanding.
      </p>
      <p class="font-body text-base leading-relaxed text-lavender-300">
        As AI Architect at The House of Curiosity, Creative Partner at ImagineArt
        and Caimera, and a contributor to Creativa Magazine Volume 7, my practice
        bridges art and education &mdash; using my Style DNA methodology to treat image
        generation as a reproducible craft rather than random experimentation.
      </p>
      <p class="font-body text-base leading-relaxed text-lavender-300">
        My work has been exhibited internationally including Dream AI Gallery (NJ),
        Fundaci&oacute;n Nestl&eacute; Barcelona, FNAC Asturias, and Art Innovation
        Gallery New York.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const bioRef = ref<HTMLElement | null>(null)
let ctx: gsap.Context | null = null

onMounted(() => {
  if (!bioRef.value) return

  ctx = gsap.context(() => {
    const paragraphs = bioRef.value!.querySelectorAll('p')

    paragraphs.forEach((p, i) => {
      gsap.set(p, { opacity: 0, y: 30 + i * 10 })
      ScrollTrigger.create({
        trigger: p,
        start: 'top 88%',
        once: true,
        onEnter: () => {
          gsap.to(p, {
            opacity: 1,
            y: 0,
            duration: 0.8,
            delay: i * 0.1,
            ease: 'power2.out',
            force3D: true,
          })
        },
      })
    })
  }, bioRef.value)
})

onUnmounted(() => {
  ctx?.revert()
})
</script>
