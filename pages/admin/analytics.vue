<template>
  <div>
    <h1 class="text-2xl font-display font-bold text-white mb-8">Analytics</h1>

    <div v-if="loading" class="text-gray-400 text-center py-12">Loading analytics...</div>

    <template v-else>
      <!-- Overview Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div
          v-for="card in overviewCards"
          :key="card.label"
          class="bg-gray-900 border border-gray-800 rounded-xl p-5"
        >
          <div class="text-sm text-gray-400 mb-1">{{ card.label }}</div>
          <div class="text-2xl font-display font-bold text-white">{{ card.value }}</div>
        </div>
      </div>

      <!-- Daily Views Chart -->
      <div v-if="dailyData.length" class="bg-gray-900 border border-gray-800 rounded-xl p-5 mb-8">
        <h2 class="text-lg font-display font-semibold text-white mb-4">Page Views (Last 30 Days)</h2>
        <div class="h-48 flex items-end gap-1">
          <div
            v-for="day in dailyData"
            :key="day.date"
            class="flex-1 flex flex-col items-center group relative"
          >
            <div
              class="w-full bg-accent-red/80 hover:bg-accent-red rounded-t transition-colors min-h-[2px]"
              :style="{ height: `${getBarHeight(day.views)}%` }"
            />
            <div class="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              {{ day.date }}: {{ day.views }} views
            </div>
          </div>
        </div>
        <div class="flex justify-between mt-2 text-xs text-gray-500">
          <span>{{ dailyData[0]?.date }}</span>
          <span>{{ dailyData[dailyData.length - 1]?.date }}</span>
        </div>
      </div>

      <!-- Prompt Revenue -->
      <div v-if="revenueData" class="mb-8">
        <h2 class="text-lg font-display font-semibold text-white mb-4">Prompt Revenue</h2>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div class="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <div class="text-sm text-gray-400 mb-1">All Time</div>
            <div class="text-2xl font-display font-bold text-green-400">${{ (revenueData.totalRevenue / 100).toFixed(2) }}</div>
            <div class="text-xs text-gray-500 mt-1">{{ revenueData.totalPurchases }} purchases</div>
          </div>
          <div class="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <div class="text-sm text-gray-400 mb-1">This Month</div>
            <div class="text-2xl font-display font-bold text-white">${{ (revenueData.monthRevenue / 100).toFixed(2) }}</div>
          </div>
          <div class="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <div class="text-sm text-gray-400 mb-1">Last 7 Days</div>
            <div class="text-2xl font-display font-bold text-white">${{ (revenueData.weekRevenue / 100).toFixed(2) }}</div>
          </div>
        </div>

        <!-- Top Selling Prompts -->
        <div v-if="revenueData.topPrompts.length" class="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <div class="px-5 py-4 border-b border-gray-800">
            <h3 class="text-sm font-semibold text-gray-300 uppercase tracking-wider">Top Selling Prompts</h3>
          </div>
          <div class="divide-y divide-gray-800">
            <div
              v-for="(prompt, idx) in revenueData.topPrompts"
              :key="prompt.artworkId"
              class="flex items-center justify-between px-5 py-3"
            >
              <div class="flex items-center gap-3 min-w-0">
                <span class="text-xs text-gray-500 w-5">{{ idx + 1 }}</span>
                <span class="text-sm text-white truncate">{{ prompt.title }}</span>
              </div>
              <div class="flex items-center gap-4 flex-shrink-0">
                <span class="text-xs text-gray-400">{{ prompt.count }} sales</span>
                <span class="text-sm text-green-400 font-medium">${{ (prompt.revenue / 100).toFixed(2) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Top Artworks -->
        <div class="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <div class="px-5 py-4 border-b border-gray-800">
            <h2 class="text-lg font-display font-semibold text-white">Top Artworks</h2>
          </div>
          <div v-if="!artworkViews.length" class="text-gray-500 text-center py-8 text-sm">
            No artwork views yet.
          </div>
          <div v-else class="divide-y divide-gray-800">
            <div
              v-for="(artwork, idx) in artworkViews"
              :key="artwork.artworkId"
              class="flex items-center justify-between px-5 py-3"
            >
              <div class="flex items-center gap-3 min-w-0">
                <span class="text-xs text-gray-500 w-5">{{ idx + 1 }}</span>
                <span class="text-sm text-white truncate">{{ artworkTitles.get(artwork.artworkId) || artwork.artworkId }}</span>
              </div>
              <span class="text-sm text-gray-400 font-medium">{{ artwork.views }}</span>
            </div>
          </div>
        </div>

        <!-- Top Referrers -->
        <div class="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <div class="px-5 py-4 border-b border-gray-800">
            <h2 class="text-lg font-display font-semibold text-white">Top Referrers</h2>
          </div>
          <div v-if="!referrers.length" class="text-gray-500 text-center py-8 text-sm">
            No referrer data yet.
          </div>
          <div v-else class="divide-y divide-gray-800">
            <div
              v-for="(ref, idx) in referrers"
              :key="ref.referrer"
              class="flex items-center justify-between px-5 py-3"
            >
              <div class="flex items-center gap-3 min-w-0">
                <span class="text-xs text-gray-500 w-5">{{ idx + 1 }}</span>
                <span class="text-sm text-white truncate">{{ ref.referrer }}</span>
              </div>
              <span class="text-sm text-gray-400 font-medium">{{ ref.views }}</span>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })

import type {
  DailyData, ArtworkView, Referrer, DashboardStat,
  AnalyticsOverviewResponse, AnalyticsDailyResponse,
  AnalyticsArtworksResponse, AnalyticsReferrersResponse,
} from '~/types/api'

interface RevenueTopPrompt {
  artworkId: string
  title: string
  revenue: number
  count: number
}

interface RevenueData {
  totalRevenue: number
  monthRevenue: number
  weekRevenue: number
  totalPurchases: number
  topPrompts: RevenueTopPrompt[]
}

const loading = ref(true)
const overviewCards = ref<DashboardStat[]>([])
const dailyData = ref<DailyData[]>([])
const artworkViews = ref<ArtworkView[]>([])
const referrers = ref<Referrer[]>([])
const revenueData = ref<RevenueData | null>(null)
const artworkTitles = ref(new Map<string, string>())

const maxDailyViews = computed(() =>
  Math.max(...dailyData.value.map(d => d.views), 1)
)

function getBarHeight(views: number) {
  return Math.max((views / maxDailyViews.value) * 100, 2)
}

onMounted(async () => {
  try {
    const [overviewRes, dailyRes, artworksRes, referrersRes, revenueRes] = await Promise.all([
      $fetch<AnalyticsOverviewResponse>('/api/admin/analytics/overview').catch(() => null),
      $fetch<AnalyticsDailyResponse>('/api/admin/analytics/daily').catch(() => null),
      $fetch<AnalyticsArtworksResponse>('/api/admin/analytics/artworks').catch(() => null),
      $fetch<AnalyticsReferrersResponse>('/api/admin/analytics/referrers').catch(() => null),
      $fetch<{ success: boolean; data: RevenueData }>('/api/admin/analytics/revenue').catch(() => null),
    ])

    if (overviewRes?.data) {
      const d = overviewRes.data
      overviewCards.value = [
        { label: 'Total Page Views', value: d.totalViews },
        { label: 'Today', value: d.todayViews },
        { label: 'This Week', value: d.weekViews },
        { label: 'Unique Visitors (30d)', value: d.uniqueVisitors30d },
      ]
    }

    dailyData.value = dailyRes?.data || []
    artworkViews.value = artworksRes?.data || []
    referrers.value = referrersRes?.data || []
    revenueData.value = revenueRes?.data || null

    // Resolve artwork titles for the Top Artworks table
    try {
      const artRes = await $fetch<{ success: boolean; data: Array<{ id: string; title: string }> }>('/api/artworks')
      if (artRes?.data) {
        const map = new Map<string, string>()
        artRes.data.forEach(a => map.set(a.id, a.title))
        artworkTitles.value = map
      }
    } catch {}
  } catch {
    // Silently fail
  } finally {
    loading.value = false
  }
})
</script>
