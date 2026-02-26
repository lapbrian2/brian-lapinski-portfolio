<template>
  <div>
    <h1 class="text-2xl font-display font-bold text-white mb-8">Orders</h1>

    <div v-if="loading" class="text-gray-400 text-center py-12">Loading orders...</div>

    <div v-else-if="!ordersList.length" class="bg-gray-900 border border-gray-800 rounded-xl text-gray-500 text-center py-12">
      No orders yet. Orders will appear here once customers make purchases.
    </div>

    <div v-else class="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
      <table class="w-full">
        <thead>
          <tr class="border-b border-gray-800 text-left">
            <th class="px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Order #</th>
            <th class="px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Email</th>
            <th class="px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
            <th class="px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Total</th>
            <th class="px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-800">
          <tr
            v-for="order in ordersList"
            :key="order.id"
            class="hover:bg-gray-800/50 transition-colors"
          >
            <td class="px-5 py-4 text-sm font-medium text-white">#{{ order.id }}</td>
            <td class="px-5 py-4 text-sm text-gray-400">{{ order.email }}</td>
            <td class="px-5 py-4">
              <span
                class="inline-flex px-2 py-0.5 text-xs font-medium rounded-full capitalize"
                :class="statusClass(order.status)"
              >
                {{ order.status }}
              </span>
            </td>
            <td class="px-5 py-4 text-sm text-white font-medium">${{ (order.total / 100).toFixed(2) }}</td>
            <td class="px-5 py-4 text-sm text-gray-500">{{ formatDate(order.createdAt) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })

import type { Order } from '~/types/shop'

const ordersList = ref<Order[]>([])
const loading = ref(true)

onMounted(async () => {
  try {
    const res = await $fetch<{ data: Order[] }>('/api/admin/orders')
    ordersList.value = res.data || []
  } catch {
    ordersList.value = []
  } finally {
    loading.value = false
  }
})

function statusClass(status: string) {
  switch (status) {
    case 'paid': return 'bg-green-500/15 text-green-400'
    case 'fulfilled': return 'bg-blue-500/15 text-blue-400'
    case 'cancelled': return 'bg-red-500/15 text-red-400'
    default: return 'bg-yellow-500/15 text-yellow-400'
  }
}

function formatDate(dateStr?: string | null) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
}
</script>
