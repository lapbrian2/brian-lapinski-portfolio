<template>
  <div class="max-w-4xl">
    <div class="flex items-center justify-between mb-8">
      <h1 class="text-2xl font-display font-bold text-white">Collections</h1>
    </div>

    <!-- Create Form -->
    <div class="bg-gray-900 border border-gray-800 rounded-xl p-5 mb-6">
      <h3 class="text-sm font-medium text-white mb-4">Create Collection</h3>
      <div class="space-y-3">
        <div>
          <label class="block text-xs text-gray-400 mb-1">Title</label>
          <input v-model="newCollection.title" placeholder="Collection title" class="admin-input" />
        </div>
        <div>
          <label class="block text-xs text-gray-400 mb-1">Description</label>
          <textarea v-model="newCollection.description" placeholder="Brief description of this collection..." rows="3" class="admin-input" />
        </div>
        <div>
          <label class="block text-xs text-gray-400 mb-1">Cover Image URL</label>
          <input v-model="newCollection.coverImage" placeholder="/images/artworks/example.webp" class="admin-input" />
        </div>
        <div class="flex items-center gap-2">
          <input
            v-model="newCollection.featured"
            type="checkbox"
            id="new-featured"
            class="w-4 h-4 rounded bg-gray-800 border-gray-700 text-accent-red focus:ring-accent-red"
          />
          <label for="new-featured" class="text-xs text-gray-400">Featured collection</label>
        </div>
      </div>
      <div class="flex gap-2 mt-4">
        <button
          @click="createCollection"
          :disabled="!newCollection.title || creating"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-accent-red hover:bg-accent-red-hover text-white text-xs font-medium rounded-lg transition-colors disabled:opacity-50"
        >
          {{ creating ? 'Creating...' : 'Create Collection' }}
        </button>
      </div>
    </div>

    <div v-if="loading" class="text-gray-400 text-center py-12">Loading collections...</div>

    <!-- Collections Table -->
    <div v-else-if="collections.length" class="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
      <table class="w-full">
        <thead>
          <tr class="border-b border-gray-800">
            <th class="text-left text-xs text-gray-400 font-medium px-5 py-3">Title</th>
            <th class="text-left text-xs text-gray-400 font-medium px-5 py-3">Slug</th>
            <th class="text-center text-xs text-gray-400 font-medium px-5 py-3">Artworks</th>
            <th class="text-center text-xs text-gray-400 font-medium px-5 py-3">Featured</th>
            <th class="text-center text-xs text-gray-400 font-medium px-5 py-3">Sort</th>
            <th class="text-right text-xs text-gray-400 font-medium px-5 py-3">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-800">
          <tr v-for="collection in collections" :key="collection.id">
            <td class="px-5 py-4">
              <span class="text-sm text-white font-medium">{{ collection.title }}</span>
            </td>
            <td class="px-5 py-4">
              <span class="text-xs text-gray-400 font-mono">{{ collection.slug }}</span>
            </td>
            <td class="px-5 py-4 text-center">
              <span class="text-sm text-gray-300">{{ collection.artworkCount }}</span>
            </td>
            <td class="px-5 py-4 text-center">
              <span
                v-if="collection.featured"
                class="inline-flex items-center px-2 py-0.5 bg-accent-red/10 text-accent-red text-[10px] font-medium rounded-full uppercase tracking-wider"
              >
                Featured
              </span>
              <span v-else class="text-xs text-gray-600">&mdash;</span>
            </td>
            <td class="px-5 py-4 text-center">
              <span class="text-sm text-gray-400">{{ collection.sortOrder }}</span>
            </td>
            <td class="px-5 py-4">
              <div class="flex items-center justify-end gap-2">
                <NuxtLink
                  :to="`/admin/collections/${collection.id}`"
                  class="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-white text-xs font-medium rounded-lg transition-colors"
                >
                  Edit
                </NuxtLink>
                <button
                  @click="deleteCollection(collection.id)"
                  class="px-3 py-1.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 text-xs font-medium rounded-lg transition-colors"
                >
                  Delete
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Empty State -->
    <div v-else class="bg-gray-900 border border-gray-800 rounded-xl text-gray-500 text-center py-12">
      No collections yet. Create one above to get started.
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })

interface AdminCollection {
  id: number
  title: string
  slug: string
  description: string
  coverImage: string
  artworkCount: number
  featured: boolean
  sortOrder: number
}

const collections = ref<AdminCollection[]>([])
const loading = ref(true)
const creating = ref(false)

const newCollection = reactive({
  title: '',
  description: '',
  coverImage: '',
  featured: false,
})

onMounted(async () => {
  await fetchCollections()
})

async function fetchCollections() {
  loading.value = true
  try {
    const res = await $fetch<{ data: AdminCollection[] }>('/api/admin/collections')
    collections.value = res.data || []
  } catch {
    collections.value = []
  } finally {
    loading.value = false
  }
}

async function createCollection() {
  if (!newCollection.title) return
  creating.value = true
  try {
    await $fetch('/api/admin/collections', {
      method: 'POST',
      body: {
        title: newCollection.title,
        description: newCollection.description,
        coverImage: newCollection.coverImage,
        featured: newCollection.featured,
      },
    })
    newCollection.title = ''
    newCollection.description = ''
    newCollection.coverImage = ''
    newCollection.featured = false
    await fetchCollections()
  } catch (e) {
    alert(getFetchErrorMessage(e, 'Failed to create collection'))
  } finally {
    creating.value = false
  }
}

async function deleteCollection(id: number) {
  if (!confirm('Delete this collection? This cannot be undone.')) return
  try {
    await $fetch(`/api/admin/collections/${id}`, { method: 'DELETE' })
    await fetchCollections()
  } catch (e) {
    alert(getFetchErrorMessage(e, 'Failed to delete collection'))
  }
}
</script>

<style scoped>
.admin-input {
  @apply w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-accent-red focus:ring-1 focus:ring-accent-red transition-colors text-sm;
}
</style>
