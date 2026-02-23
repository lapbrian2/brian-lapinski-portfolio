<template>
  <div>
    <!-- Header -->
    <div class="flex items-center justify-between mb-8">
      <h1 class="text-2xl font-display font-bold text-white">Artworks</h1>
      <NuxtLink
        to="/admin/artworks/new"
        class="inline-flex items-center gap-2 px-4 py-2.5 bg-accent-red hover:bg-accent-red-hover text-white text-sm font-medium rounded-lg transition-colors"
      >
        <IconPlus class="w-4 h-4" />
        Add Artwork
      </NuxtLink>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="text-gray-400 text-center py-12">Loading artworks...</div>

    <!-- Artworks Table -->
    <div v-else class="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
      <table class="w-full">
        <thead>
          <tr class="border-b border-gray-800 text-left">
            <th class="px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider w-10">#</th>
            <th class="px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Image</th>
            <th class="px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Title</th>
            <th class="px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Category</th>
            <th class="px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Year</th>
            <th class="px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider text-right">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-800">
          <tr
            v-for="(artwork, index) in artworksList"
            :key="artwork.id"
            class="hover:bg-gray-800/50 transition-colors"
          >
            <td class="px-5 py-3 text-sm text-gray-500">
              {{ index + 1 }}
            </td>
            <td class="px-5 py-3">
              <img
                :src="artwork.src"
                :alt="artwork.title"
                class="w-12 h-12 object-cover rounded-lg"
              />
            </td>
            <td class="px-5 py-3">
              <div class="text-sm font-medium text-white">{{ artwork.title }}</div>
              <div class="text-xs text-gray-500">{{ artwork.medium }}</div>
            </td>
            <td class="px-5 py-3">
              <span class="inline-flex px-2.5 py-1 bg-gray-800 text-gray-300 text-xs font-medium rounded-full capitalize">
                {{ artwork.category }}
              </span>
            </td>
            <td class="px-5 py-3 text-sm text-gray-400">{{ artwork.year }}</td>
            <td class="px-5 py-3 text-right">
              <div class="flex items-center justify-end gap-2">
                <NuxtLink
                  :to="`/admin/artworks/${artwork.id}`"
                  class="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                  title="Edit"
                >
                  <IconEdit class="w-4 h-4" />
                </NuxtLink>
                <button
                  @click="confirmDelete(artwork)"
                  class="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded-lg transition-colors"
                  title="Delete"
                >
                  <IconTrash class="w-4 h-4" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-if="!artworksList.length" class="text-gray-500 text-center py-12">
        No artworks yet. Add your first artwork to get started.
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <Teleport to="body">
      <div v-if="deleteTarget" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/60" @click="deleteTarget = null" />
        <div class="relative bg-gray-900 border border-gray-800 rounded-xl p-6 max-w-sm w-full">
          <h3 class="text-lg font-display font-semibold text-white mb-2">Delete Artwork</h3>
          <p class="text-sm text-gray-400 mb-6">
            Are you sure you want to delete <strong class="text-white">{{ deleteTarget.title }}</strong>? This action cannot be undone.
          </p>
          <div class="flex gap-3 justify-end">
            <button
              @click="deleteTarget = null"
              class="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              @click="handleDelete"
              :disabled="deleting"
              class="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-500 rounded-lg transition-colors disabled:opacity-50"
            >
              {{ deleting ? 'Deleting...' : 'Delete' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })

interface ArtworkItem {
  id: string
  title: string
  category: string
  medium: string
  src: string
  year: number
  sortOrder: number
}

const artworksList = ref<ArtworkItem[]>([])
const loading = ref(true)
const deleteTarget = ref<ArtworkItem | null>(null)
const deleting = ref(false)

onMounted(async () => {
  await fetchArtworks()
})

async function fetchArtworks() {
  loading.value = true
  try {
    const res = await $fetch<any>('/api/admin/artworks')
    artworksList.value = res.data || []
  } catch {
    artworksList.value = []
  } finally {
    loading.value = false
  }
}

function confirmDelete(artwork: ArtworkItem) {
  deleteTarget.value = artwork
}

async function handleDelete() {
  if (!deleteTarget.value) return
  deleting.value = true
  try {
    await $fetch(`/api/admin/artworks/${deleteTarget.value.id}`, { method: 'DELETE' })
    artworksList.value = artworksList.value.filter(a => a.id !== deleteTarget.value!.id)
    deleteTarget.value = null
  } catch (e: any) {
    alert(e?.data?.statusMessage || 'Failed to delete artwork')
  } finally {
    deleting.value = false
  }
}
</script>
