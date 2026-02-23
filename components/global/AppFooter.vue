<template>
  <footer class="bg-dark-900 border-t border-dark-700 py-12 px-6 md:px-12">
    <div class="max-w-[1400px] mx-auto">
      <!-- Top Row -->
      <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8">
        <!-- Name -->
        <span class="font-display text-xl font-semibold text-lavender-100">
          Brian Lapinski
        </span>

        <!-- Social Links -->
        <nav class="flex items-center gap-6">
          <a
            v-for="social in socialLinks"
            :key="social.label"
            :href="social.href"
            target="_blank"
            rel="noopener noreferrer"
            class="font-body text-sm text-lavender-300 hover:text-accent-red transition-colors duration-200"
          >
            {{ social.label }}
          </a>
        </nav>
      </div>

      <!-- Divider -->
      <div class="border-t border-dark-700 pt-6">
        <!-- Bottom Row -->
        <p class="text-sm text-lavender-400 font-body">
          &copy; 2025 Brian Lapinski. All rights reserved.
        </p>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
interface SocialLink {
  label: string
  href: string
}

const socialLinks: SocialLink[] = [
  { label: 'LinkedIn', href: '#' },
  { label: 'Instagram', href: '#' },
  { label: 'Twitter/X', href: '#' },
  { label: 'Behance', href: '#' },
]
</script>

<style scoped>
</style>
