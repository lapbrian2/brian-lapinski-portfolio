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
      content: 'Brian Lapinski — exploring what it means to be human through images. AI artist, educator, and Creative Partner.',
    },
  ],
})
</script>
