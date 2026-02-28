<template>
  <div>
    <AppLoader @complete="onLoaderComplete" @bridge-ready="onBridgeReady" />
    <HeroSection :ready="heroReady" />
    <StackedTypography />
    <CinematicReveal />
    <GalleryShowcase />
    <CollectionCTA />
    <FeaturedGalleryStrip />
    <ScrollMarquee text="About the Artist" direction="right" />
    <AboutSection />
    <SectionDivider />
    <ProcessSection />
    <PromptShowcase />
    <ScrollMarquee text="Let's Create" />
    <ContactSection />

    <!-- Newsletter signup -->
    <section class="section relative overflow-hidden py-16 md:py-24">
      <div class="max-w-5xl mx-auto px-6 md:px-12">
        <NewsletterSignup />
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
const heroReady = ref(false)

function onBridgeReady(): void {
  heroReady.value = true
}

function onLoaderComplete(): void {
  // Safety net: ensure hero starts even if bridge-ready was missed
  if (!heroReady.value) {
    heroReady.value = true
  }
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

// Structured data: WebSite + ArtGallery schema
useWebsiteSchema()
</script>
