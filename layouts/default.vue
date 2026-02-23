<template>
  <div class="min-h-screen bg-dark-900 vignette grain-overlay overflow-x-hidden">
    <!-- Skip to content link for keyboard users -->
    <a
      href="#main-content"
      class="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:rounded-lg focus:bg-accent-red focus:text-white focus:font-body focus:text-sm focus:outline-none"
    >
      Skip to content
    </a>
    <ClientOnly>
      <ScrollProgress />
      <AppCursor />
    </ClientOnly>
    <AppHeader />
    <main id="main-content" role="main">
      <slot />
    </main>
    <AppFooter />
    <GalleryLightbox />
  </div>
</template>
