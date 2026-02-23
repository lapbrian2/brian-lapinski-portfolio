<template>
  <div>
    <AppLoader @complete="onLoaderComplete" />
    <HeroSection :ready="heroReady" />
    <SectionDivider />
    <GallerySection />
    <SectionDivider variant="accent" />
    <AboutSection />
    <SectionDivider />
    <ProcessSection />
    <SectionDivider variant="accent" />
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
})
</script>
