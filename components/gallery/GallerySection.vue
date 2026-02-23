<script setup lang="ts">
const activeCategory = ref('all')
</script>

<template>
  <section id="work" class="section">
    <!-- Heading area -->
    <div class="mb-12">
      <h2 class="font-display text-section font-bold text-lavender-100">
        Selected Works
      </h2>
      <p class="font-body text-lg text-lavender-300 mt-2">
        A curated collection of AI-generated art
      </p>
    </div>

    <!-- Filter bar -->
    <div class="mb-8">
      <GalleryFilter v-model="activeCategory" />
    </div>

    <!-- Grid -->
    <GalleryGrid :category="activeCategory" />
  </section>
</template>
