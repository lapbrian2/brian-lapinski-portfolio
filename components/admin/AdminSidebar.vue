<template>
  <aside
    :class="[
      'fixed top-0 left-0 h-screen w-64 bg-gray-900 border-r border-gray-800 flex flex-col z-50 transition-transform duration-300',
      open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
    ]"
  >
    <!-- Logo -->
    <div class="p-6 border-b border-gray-800 flex items-center justify-between">
      <NuxtLink to="/admin" class="flex items-center gap-3">
        <div class="w-8 h-8 bg-accent-red rounded-lg flex items-center justify-center text-white font-display font-bold text-sm">
          BL
        </div>
        <span class="font-display font-semibold text-lg">Admin Panel</span>
      </NuxtLink>
      <!-- Close button (mobile only) -->
      <button
        class="lg:hidden w-9 h-9 flex items-center justify-center rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
        aria-label="Close sidebar"
        @click="$emit('close')"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
          <line x1="2" y1="2" x2="14" y2="14" />
          <line x1="14" y1="2" x2="2" y2="14" />
        </svg>
      </button>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 p-4 space-y-1 overflow-y-auto">
      <NuxtLink
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
        :class="isActive(item.to)
          ? 'bg-accent-red/10 text-accent-red'
          : 'text-gray-400 hover:text-gray-100 hover:bg-gray-800'"
      >
        <IconDashboard v-if="item.icon === 'dashboard'" class="w-5 h-5 flex-shrink-0" />
        <IconImage v-else-if="item.icon === 'image'" class="w-5 h-5 flex-shrink-0" />
        <IconEdit v-else-if="item.icon === 'edit'" class="w-5 h-5 flex-shrink-0" />
        <IconAward v-else-if="item.icon === 'award'" class="w-5 h-5 flex-shrink-0" />
        <IconMail v-else-if="item.icon === 'mail'" class="w-5 h-5 flex-shrink-0" />
        <IconChart v-else-if="item.icon === 'chart'" class="w-5 h-5 flex-shrink-0" />
        <span>{{ item.label }}</span>
      </NuxtLink>
    </nav>

    <!-- Footer -->
    <div class="p-4 border-t border-gray-800 space-y-2">
      <NuxtLink
        to="/"
        target="_blank"
        class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:text-gray-100 hover:bg-gray-800 transition-colors"
      >
        <IconExternalLink class="w-5 h-5" />
        <span>View Site</span>
      </NuxtLink>
      <button
        @click="handleLogout"
        class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-gray-800 transition-colors"
      >
        <IconLogout class="w-5 h-5" />
        <span>Log Out</span>
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
defineProps<{
  open: boolean
}>()

defineEmits<{
  close: []
}>()

const route = useRoute()
const { logout } = useAdminAuth()

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: 'dashboard' },
  { to: '/admin/artworks', label: 'Artworks', icon: 'image' },
  { to: '/admin/shop', label: 'Print Shop', icon: 'image' },
  { to: '/admin/orders', label: 'Orders', icon: 'mail' },
  { to: '/admin/collections', label: 'Collections', icon: 'image' },
  { to: '/admin/content', label: 'Content', icon: 'edit' },
  { to: '/admin/credentials', label: 'Credentials', icon: 'award' },
  { to: '/admin/submissions', label: 'Submissions', icon: 'mail' },
  { to: '/admin/subscribers', label: 'Subscribers', icon: 'mail' },
  { to: '/admin/newsletter', label: 'Newsletter', icon: 'edit' },
  { to: '/admin/analytics', label: 'Analytics', icon: 'chart' },
]

function isActive(path: string) {
  if (path === '/admin') return route.path === '/admin'
  return route.path.startsWith(path)
}

async function handleLogout() {
  await logout()
}
</script>
