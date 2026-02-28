<template>
  <div>
    <h1 class="text-2xl font-display font-bold text-white mb-8">Subscribers</h1>

    <div v-if="loading" class="text-gray-400 text-center py-12">Loading subscribers...</div>

    <template v-else>
      <!-- Stats Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div class="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <div class="text-sm text-gray-400 mb-1">Active Subscribers</div>
          <div class="text-2xl font-display font-bold text-white">{{ stats.active }}</div>
        </div>
        <div class="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <div class="text-sm text-gray-400 mb-1">Total All-Time</div>
          <div class="text-2xl font-display font-bold text-gray-300">{{ stats.total }}</div>
        </div>
        <div class="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <div class="text-sm text-gray-400 mb-1">New This Week</div>
          <div class="text-2xl font-display font-bold text-green-400">{{ stats.recentWeek }}</div>
        </div>
      </div>

      <!-- Subscriber Table -->
      <div v-if="!subscriberList.length" class="text-gray-500 text-center py-12 bg-gray-900 border border-gray-800 rounded-xl">
        No subscribers yet. They'll appear here once people sign up.
      </div>

      <div v-else class="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <table class="w-full">
          <thead>
            <tr class="border-b border-gray-800 text-left">
              <th class="px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Email</th>
              <th class="px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Name</th>
              <th class="px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
              <th class="px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Subscribed</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-800">
            <tr
              v-for="sub in subscriberList"
              :key="sub.id"
              class="hover:bg-gray-800/50 transition-colors"
            >
              <td class="px-5 py-4 text-sm font-medium text-white">{{ sub.email }}</td>
              <td class="px-5 py-4 text-sm text-gray-400">{{ sub.name || '—' }}</td>
              <td class="px-5 py-4">
                <span
                  :class="sub.unsubscribedAt
                    ? 'bg-gray-700/50 text-gray-400'
                    : 'bg-green-500/10 text-green-400 border border-green-500/20'"
                  class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                >
                  {{ sub.unsubscribedAt ? 'Unsubscribed' : 'Active' }}
                </span>
              </td>
              <td class="px-5 py-4 text-sm text-gray-500 whitespace-nowrap">
                {{ formatDate(sub.createdAt) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })

interface Subscriber {
  id: number
  email: string
  name: string | null
  createdAt: string
  unsubscribedAt: string | null
}

interface SubscribersResponse {
  success: boolean
  data: { total: number; active: number; recentWeek: number }
  subscribers: Subscriber[]
}

const loading = ref(true)
const stats = ref({ total: 0, active: 0, recentWeek: 0 })
const subscriberList = ref<Subscriber[]>([])

onMounted(async () => {
  try {
    const res = await $fetch<SubscribersResponse>('/api/admin/subscribers')
    stats.value = res.data
    subscriberList.value = res.subscribers
  } catch {
    // Silently fail
  } finally {
    loading.value = false
  }
})

function formatDate(dateStr: string | null) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
</script>
