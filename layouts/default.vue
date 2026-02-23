<template>
  <div class="min-h-screen bg-dark-900 vignette grain-overlay">
    <ClientOnly>
      <ScrollProgress />
      <AppCursor />
    </ClientOnly>
    <AppHeader />
    <main>
      <slot />
    </main>
    <AppFooter />
    <GalleryLightbox />
  </div>
</template>
