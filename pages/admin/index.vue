<template>
  <div>
    <h1 class="text-2xl font-display font-bold text-white mb-8">Dashboard</h1>

    <!-- Quick Stats -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <div
        v-for="stat in dashboardStats"
        :key="stat.label"
        class="bg-gray-900 border border-gray-800 rounded-xl p-5"
      >
        <div class="text-sm text-gray-400 mb-1">{{ stat.label }}</div>
        <div class="text-2xl font-display font-bold text-white">{{ stat.value }}</div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="mb-8">
      <h2 class="text-lg font-display font-semibold text-white mb-4">Quick Actions</h2>
      <div class="flex flex-wrap gap-3">
        <NuxtLink
          to="/admin/artworks/new"
          class="inline-flex items-center gap-2 px-4 py-2.5 bg-accent-red hover:bg-accent-red-hover text-white text-sm font-medium rounded-lg transition-colors"
        >
          <IconPlus class="w-4 h-4" />
          New Artwork
        </NuxtLink>
        <NuxtLink
          to="/admin/content"
          class="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <IconEdit class="w-4 h-4" />
          Edit Content
        </NuxtLink>
        <NuxtLink
          to="/admin/submissions"
          class="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <IconMail class="w-4 h-4" />
          View Messages
        </NuxtLink>
      </div>
    </div>

    <!-- Recent Submissions -->
    <div v-if="recentSubmissions.length" class="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
      <div class="px-5 py-4 border-b border-gray-800">
        <h2 class="text-lg font-display font-semibold text-white">Recent Messages</h2>
      </div>
      <div class="divide-y divide-gray-800">
        <div
          v-for="sub in recentSubmissions.slice(0, 5)"
          :key="sub.id"
          class="px-5 py-4"
        >
          <div class="flex items-start justify-between gap-4">
            <div class="min-w-0">
              <div class="text-sm font-medium text-white">{{ sub.name }}</div>
              <div class="text-sm text-gray-400 truncate">{{ sub.email }}</div>
              <div class="text-sm text-gray-500 mt-1 line-clamp-1">{{ sub.message }}</div>
            </div>
            <div class="text-xs text-gray-500 whitespace-nowrap">
              {{ formatDate(sub.createdAt) }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })

import type { Submission } from '~/types/submission'
import type { ArtworksApiResponse, SubmissionsApiResponse, DashboardStat } from '~/types/api'

const dashboardStats = ref<DashboardStat[]>([])
const recentSubmissions = ref<Submission[]>([])

onMounted(async () => {
  try {
    const [artworksRes, statsRes, submissionsRes] = await Promise.all([
      $fetch<ArtworksApiResponse>('/api/admin/artworks'),
      $fetch<{ data: DashboardStat[] }>('/api/admin/stats'),
      $fetch<SubmissionsApiResponse>('/api/admin/submissions').catch(() => ({ success: true, data: [] as Submission[] })),
    ])

    dashboardStats.value = [
      { label: 'Total Artworks', value: artworksRes.data?.length || 0 },
      { label: 'Categories', value: new Set(artworksRes.data?.map((a: { category: string }) => a.category)).size || 0 },
      { label: 'Messages', value: submissionsRes.data?.length || 0 },
      { label: 'Stats Entries', value: statsRes.data?.length || 0 },
    ]

    recentSubmissions.value = submissionsRes.data || []
  } catch (err) {
    const fetchErr = err as { statusCode?: number; response?: { status?: number } } | undefined
    if (fetchErr?.statusCode === 401 || fetchErr?.response?.status === 401) {
      navigateTo('/admin/login')
      return
    }
    // Silently fail on dashboard — not critical
  }
})

function formatDate(dateStr: string | null) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
</script>
