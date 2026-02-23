<template>
  <div>
    <AppLoader @complete="onLoaderComplete" />
    <HeroSection :ready="heroReady" />
    <ScrollMarquee text="Selected Works" />
    <GallerySection />
    <ScrollMarquee text="About the Artist" direction="right" />
    <AboutSection />
    <SectionDivider />
    <ProcessSection />
    <ScrollMarquee text="Let's Create" />
    <ContactSection />
  </div>
</template>

<script setup lang="ts">
const heroReady = ref(false)

function onLoaderComplete() {
  heroReady.value = true
}

useHead({
  title: 'Brian Lapinski | AI Art Portfolio',
  meta: [
    {
      name: 'description',
      content: 'Brian Lapinski — exploring what it means to be human through images. AI artist, educator, and Creative Partner.',
    },
  ],
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'Brian Lapinski | AI Art Portfolio',
        url: 'https://brian-lapinski-portfolio.vercel.app',
        description: 'Exploring what it means to be human through images. AI artist, educator, and Creative Partner.',
        author: {
          '@type': 'Person',
          name: 'Brian Lapinski',
          jobTitle: 'AI Artist & Educator',
          sameAs: [
            'https://www.instagram.com/brian_lapinski1/',
            'https://x.com/Lapbrian2',
            'https://www.linkedin.com/in/brian-lapinski-a65238352',
          ],
        },
      }),
    },
  ],
})
</script>
