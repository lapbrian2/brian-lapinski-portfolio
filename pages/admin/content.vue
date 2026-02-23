<template>
  <div class="max-w-3xl">
    <h1 class="text-2xl font-display font-bold text-white mb-8">Site Content</h1>

    <div v-if="loading" class="text-gray-400 text-center py-12">Loading content...</div>

    <div v-else class="space-y-6">
      <!-- Group by section -->
      <div
        v-for="(entries, section) in groupedContent"
        :key="section"
        class="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden"
      >
        <div class="px-5 py-4 border-b border-gray-800">
          <h2 class="text-lg font-display font-semibold text-white capitalize">{{ section }}</h2>
        </div>
        <div class="p-5 space-y-5">
          <div v-for="entry in entries" :key="entry.key">
            <label class="block text-sm font-medium text-gray-400 mb-1.5">
              {{ formatKey(entry.key) }}
            </label>
            <textarea
              v-model="entry.value"
              rows="4"
              class="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-accent-red focus:ring-1 focus:ring-accent-red transition-colors text-sm resize-none"
            />
            <div class="flex items-center gap-2 mt-2">
              <button
                @click="saveContent(entry)"
                :disabled="saving === entry.key"
                class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-accent-red hover:bg-accent-red-hover text-white text-xs font-medium rounded-lg transition-colors disabled:opacity-50"
              >
                <IconSave class="w-3.5 h-3.5" />
                {{ saving === entry.key ? 'Saving...' : 'Save' }}
              </button>
              <span v-if="saved === entry.key" class="text-xs text-green-400">Saved!</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })

interface ContentEntry {
  key: string
  value: string
  section: string
}

const contentEntries = ref<ContentEntry[]>([])
const loading = ref(true)
const saving = ref<string | null>(null)
const saved = ref<string | null>(null)

const groupedContent = computed(() => {
  const groups: Record<string, ContentEntry[]> = {}
  for (const entry of contentEntries.value) {
    if (!groups[entry.section]) groups[entry.section] = []
    groups[entry.section].push(entry)
  }
  return groups
})

onMounted(async () => {
  try {
    const res = await $fetch<any>('/api/admin/content')
    contentEntries.value = res.data || []
  } catch {
    contentEntries.value = []
  } finally {
    loading.value = false
  }
})

function formatKey(key: string) {
  return key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase())
}

async function saveContent(entry: ContentEntry) {
  saving.value = entry.key
  saved.value = null
  try {
    await $fetch(`/api/admin/content/${entry.key}`, {
      method: 'PUT',
      body: { value: entry.value },
    })
    saved.value = entry.key
    setTimeout(() => { if (saved.value === entry.key) saved.value = null }, 2000)
  } catch (e: any) {
    alert(e?.data?.statusMessage || 'Failed to save')
  } finally {
    saving.value = null
  }
}
</script>
