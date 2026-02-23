<template>
  <div class="min-h-screen bg-gray-950 text-gray-100">
    <div class="flex min-h-screen">
      <AdminSidebar />
      <main class="flex-1 ml-64 p-8 overflow-y-auto">
        <slot />
      </main>
    </div>
  </div>
</template>
