<template>
  <div>
    <AppLoader />
    <HeroSection />
    <GallerySection />
    <AboutSection />
    <ProcessSection />
    <ContactSection />
  </div>
</template>

<script setup lang="ts">
useHead({
  title: 'Brian Lapinski | AI Art Portfolio',
  meta: [
    {
      name: 'description',
      content: 'AI Art Portfolio by Brian Lapinski — exploring the intersection of artificial intelligence and creative vision.',
    },
  ],
})
</script>
