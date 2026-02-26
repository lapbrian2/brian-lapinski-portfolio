<template>
  <NuxtLayout>
    <NuxtPage :transition="currentTransition" />
  </NuxtLayout>
  <ClientOnly>
    <AppCursor />
  </ClientOnly>
</template>

<script setup lang="ts">
// Skip page transition on initial load to prevent SSR hydration flash
const isFirstLoad = ref(true)

const currentTransition = computed(() => {
  if (isFirstLoad.value) return false
  return { name: 'page', mode: 'out-in' as const }
})

onMounted(() => {
  nextTick(() => {
    isFirstLoad.value = false
  })
})

// Reset Lenis scroll position to top on each page navigation
const router = useRouter()

router.afterEach((to, from) => {
  if (to.path !== from.path) {
    const lenis = useNuxtApp().$lenis as any
    if (lenis && !lenis.isStopped) {
      lenis.scrollTo(0, { immediate: true })
    }
  }
})
</script>
