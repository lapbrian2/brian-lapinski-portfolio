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
  // Enable transitions after first paint
  nextTick(() => {
    isFirstLoad.value = false
  })
})
</script>
