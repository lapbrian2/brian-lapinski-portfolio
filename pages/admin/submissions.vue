<template>
  <div>
    <h1 class="text-2xl font-display font-bold text-white mb-8">Contact Submissions</h1>

    <div v-if="loading" class="text-gray-400 text-center py-12">Loading submissions...</div>

    <div v-else-if="!submissions.length" class="text-gray-500 text-center py-12 bg-gray-900 border border-gray-800 rounded-xl">
      No submissions yet. Messages from the contact form will appear here.
    </div>

    <div v-else class="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
      <table class="w-full">
        <thead>
          <tr class="border-b border-gray-800 text-left">
            <th class="px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Name</th>
            <th class="px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Email</th>
            <th class="px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Message</th>
            <th class="px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-800">
          <tr
            v-for="sub in submissions"
            :key="sub.id"
            class="hover:bg-gray-800/50 transition-colors cursor-pointer"
            @click="expandedId = expandedId === sub.id ? null : sub.id"
          >
            <td class="px-5 py-4 text-sm font-medium text-white whitespace-nowrap">{{ sub.name }}</td>
            <td class="px-5 py-4 text-sm text-gray-400 whitespace-nowrap">{{ sub.email }}</td>
            <td class="px-5 py-4 text-sm text-gray-400">
              <div v-if="expandedId === sub.id" class="whitespace-pre-wrap">{{ sub.message }}</div>
              <div v-else class="truncate max-w-md">{{ sub.message }}</div>
            </td>
            <td class="px-5 py-4 text-sm text-gray-500 whitespace-nowrap">
              {{ formatDate(sub.createdAt) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })

interface Submission {
  id: number
  name: string
  email: string
  message: string
  ip: string | null
  createdAt: string
}

const submissions = ref<Submission[]>([])
const loading = ref(true)
const expandedId = ref<number | null>(null)

onMounted(async () => {
  try {
    const res = await $fetch<any>('/api/admin/submissions')
    submissions.value = res.data || []
  } catch {
    submissions.value = []
  } finally {
    loading.value = false
  }
})

function formatDate(dateStr: string | null) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}
</script>
