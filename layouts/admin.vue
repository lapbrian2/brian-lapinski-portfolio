<template>
  <div class="min-h-screen bg-gray-950 text-gray-100">
    <div class="flex min-h-screen">
      <!-- Mobile backdrop -->
      <Transition
        enter-active-class="transition-opacity duration-300"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition-opacity duration-200"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="sidebarOpen"
          class="fixed inset-0 z-40 bg-black/60 lg:hidden"
          @click="sidebarOpen = false"
        />
      </Transition>

      <AdminSidebar :open="sidebarOpen" @close="sidebarOpen = false" />

      <main class="flex-1 lg:ml-64 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        <!-- Mobile header bar -->
        <div class="flex items-center gap-3 mb-6 lg:hidden">
          <button
            class="w-11 h-11 flex items-center justify-center rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
            aria-label="Open sidebar menu"
            @click="sidebarOpen = true"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <NuxtLink to="/admin" class="flex items-center gap-2">
            <div class="w-7 h-7 bg-accent-red rounded-lg flex items-center justify-center text-white font-display font-bold text-xs">
              BL
            </div>
            <span class="font-display font-semibold text-sm">Admin</span>
          </NuxtLink>
        </div>

        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const sidebarOpen = ref(false)

// Close sidebar on route change (mobile navigation)
watch(() => route.path, () => {
  sidebarOpen.value = false
})
</script>
