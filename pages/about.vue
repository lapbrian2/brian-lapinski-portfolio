<template>
  <div class="min-h-screen bg-dark-900 vignette grain-overlay overflow-x-hidden">
    <!-- Header -->
    <header class="fixed top-0 left-0 right-0 z-50 px-6 md:px-12 py-5 backdrop-blur-md bg-dark-900/70">
      <div class="flex items-center justify-between">
        <NuxtLink
          to="/"
          class="inline-flex items-center gap-2 text-lavender-300 hover:text-white transition-colors group"
        >
          <svg class="w-5 h-5 transition-transform group-hover:-translate-x-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="m12 19-7-7 7-7" />
            <path d="M19 12H5" />
          </svg>
          <span class="font-body text-sm">Back to Home</span>
        </NuxtLink>

        <NuxtLink to="/" class="font-display text-lg font-bold text-lavender-100 hover:text-white transition-colors">
          BL
        </NuxtLink>
      </div>
    </header>

    <!-- Hero -->
    <section class="pt-32 pb-12 px-6 md:px-12">
      <div class="max-w-5xl mx-auto text-center">
        <p class="font-body text-xs uppercase tracking-[0.3em] text-accent-red mb-4">
          The Artist
        </p>
        <div class="w-12 h-px bg-accent-red/40 mx-auto mb-6" />
        <h1 class="font-display text-hero font-bold text-lavender-100 leading-none mb-6">
          About
        </h1>
        <p class="font-body text-lg text-lavender-300 max-w-xl mx-auto">
          Brian Lapinski — exploring what it means to be human through images.
        </p>
      </div>
    </section>

    <!-- Artist Statement -->
    <section class="px-6 md:px-12 pb-16">
      <div class="max-w-3xl mx-auto">
        <div class="glass rounded-lg p-8 md:p-10 space-y-6">
          <h2 class="font-display text-xl font-bold text-lavender-100">Artist Statement</h2>
          <p class="font-body text-sm text-lavender-300 leading-relaxed">
            I work at the intersection of human intention and machine capability. Every piece begins with a question — about identity, memory, beauty, or the spaces between what we see and what we feel. The AI is my collaborator, not my tool. I guide it with language, and it responds with images that neither of us could have made alone.
          </p>
          <p class="font-body text-sm text-lavender-300 leading-relaxed">
            My practice is rooted in prompt architecture — the deliberate, iterative craft of translating vision into language that a generative model can interpret. Each prompt is a creative artifact in its own right: part poetry, part engineering, part intuition.
          </p>
          <p class="font-body text-sm text-lavender-300 leading-relaxed">
            The work spans portraiture, landscapes, abstraction, and worlds that don't exist yet. What ties it together isn't style — it's the persistent attempt to reach something true about being human, even when the means of creation is decidedly not.
          </p>
        </div>
      </div>
    </section>

    <!-- Process -->
    <section class="px-6 md:px-12 pb-16">
      <div class="max-w-3xl mx-auto">
        <h2 class="font-display text-xl font-bold text-lavender-100 mb-6 text-center">Creative Process</h2>
        <div class="space-y-4">
          <div class="glass rounded-lg p-6 flex gap-5">
            <div class="w-10 h-10 rounded-full bg-accent-red/10 border border-accent-red/20 flex items-center justify-center flex-shrink-0">
              <span class="font-display text-sm font-bold text-accent-red">1</span>
            </div>
            <div>
              <h3 class="font-display text-base font-semibold text-lavender-100 mb-1">Concept & Intent</h3>
              <p class="font-body text-sm text-lavender-300/70 leading-relaxed">
                Every piece starts with an emotional target — a feeling, a question, a visual tension I want to resolve. I sketch the concept in words before touching any tool.
              </p>
            </div>
          </div>

          <div class="glass rounded-lg p-6 flex gap-5">
            <div class="w-10 h-10 rounded-full bg-accent-red/10 border border-accent-red/20 flex items-center justify-center flex-shrink-0">
              <span class="font-display text-sm font-bold text-accent-red">2</span>
            </div>
            <div>
              <h3 class="font-display text-base font-semibold text-lavender-100 mb-1">Prompt Architecture</h3>
              <p class="font-body text-sm text-lavender-300/70 leading-relaxed">
                The prompt is the artwork's DNA. I craft it in layers — subject, atmosphere, technique references, compositional structure, color theory. Each word is chosen for how the model interprets it, not just what it means to us.
              </p>
            </div>
          </div>

          <div class="glass rounded-lg p-6 flex gap-5">
            <div class="w-10 h-10 rounded-full bg-accent-red/10 border border-accent-red/20 flex items-center justify-center flex-shrink-0">
              <span class="font-display text-sm font-bold text-accent-red">3</span>
            </div>
            <div>
              <h3 class="font-display text-base font-semibold text-lavender-100 mb-1">Iteration & Selection</h3>
              <p class="font-body text-sm text-lavender-300/70 leading-relaxed">
                Generation is a conversation. I refine the prompt across dozens of variations — adjusting weights, swapping references, pushing boundaries. The final image is selected from hundreds, sometimes thousands of outputs.
              </p>
            </div>
          </div>

          <div class="glass rounded-lg p-6 flex gap-5">
            <div class="w-10 h-10 rounded-full bg-accent-red/10 border border-accent-red/20 flex items-center justify-center flex-shrink-0">
              <span class="font-display text-sm font-bold text-accent-red">4</span>
            </div>
            <div>
              <h3 class="font-display text-base font-semibold text-lavender-100 mb-1">Curation & Presentation</h3>
              <p class="font-body text-sm text-lavender-300/70 leading-relaxed">
                The chosen image is upscaled, color-graded, and presented in context. I pair each work with its prompt architecture so collectors and fellow artists can learn from the creative decisions behind it.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Why Prompts -->
    <section class="px-6 md:px-12 pb-16">
      <div class="max-w-3xl mx-auto">
        <div class="glass rounded-lg p-8 md:p-10 space-y-6">
          <h2 class="font-display text-xl font-bold text-lavender-100">Why I Share Prompts</h2>
          <p class="font-body text-sm text-lavender-300 leading-relaxed">
            The prompts behind each artwork are as much a part of the creative work as the image itself. By making them available, I'm inviting you into the process — not just the result. You can study the architecture, remix it, learn from it, or use it as a starting point for your own exploration.
          </p>
          <p class="font-body text-sm text-lavender-300 leading-relaxed">
            Prompt unlocks include the raw prompt text, technique breakdowns, refinement notes, and Playground access where you can fork and experiment with the prompt yourself.
          </p>
          <div class="pt-2">
            <NuxtLink
              to="/gallery"
              class="inline-flex items-center gap-2 px-5 py-2.5 bg-accent-red/15 border border-accent-red/50 rounded-full font-body text-sm font-medium text-accent-red hover:bg-accent-red hover:text-dark-900 transition-all duration-300"
            >
              Browse the Gallery
              <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>

    <AppFooter />
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })

useHead({
  title: 'About | Brian Lapinski',
  meta: [
    { name: 'description', content: 'Brian Lapinski — AI artist exploring what it means to be human through images. Learn about the creative process, prompt architecture, and the art of human-AI collaboration.' },
    { property: 'og:title', content: 'About — Brian Lapinski' },
    { property: 'og:description', content: 'AI artist exploring what it means to be human through images. Learn about the creative process and prompt architecture.' },
    { property: 'og:image', content: 'https://lapinski.art/images/artworks/the-threshold.webp' },
    { property: 'og:type', content: 'profile' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: 'About | Brian Lapinski' },
    { name: 'twitter:description', content: 'AI artist exploring what it means to be human through images.' },
    { name: 'twitter:image', content: 'https://lapinski.art/images/artworks/the-threshold.webp' },
  ],
})

// Structured data: Person schema
useHead({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Person',
        name: 'Brian Lapinski',
        url: 'https://lapinski.art',
        sameAs: ['https://twitter.com/Lapbrian2'],
        jobTitle: 'AI Artist',
        description: 'Exploring what it means to be human through images. AI artist, educator, and Creative Partner.',
      }),
    },
  ],
})
</script>
