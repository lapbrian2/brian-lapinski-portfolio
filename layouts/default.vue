<template>
  <div class="min-h-screen bg-dark-900 vignette">
    <ClientOnly>
      <ScrollProgress />
      <AppCursor />
    </ClientOnly>
    <AppHeader />
    <main>
      <slot />
    </main>
    <AppFooter />
  </div>
</template>
