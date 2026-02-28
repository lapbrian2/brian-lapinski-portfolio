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

    <!-- Search & Filter Bar -->
    <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6">
      <div class="relative flex-1">
        <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search artworks..."
          class="w-full pl-10 pr-4 py-2.5 bg-gray-900 border border-gray-800 rounded-lg text-sm text-white placeholder:text-gray-500 focus:border-gray-600 focus:outline-none transition-colors"
        />
      </div>
      <select
        v-model="categoryFilter"
        class="px-4 py-2.5 bg-gray-900 border border-gray-800 rounded-lg text-sm text-white focus:border-gray-600 focus:outline-none transition-colors appearance-none cursor-pointer min-w-[160px]"
      >
        <option value="">All Categories</option>
        <option value="portraits">Portraits</option>
        <option value="landscapes">Landscapes</option>
        <option value="abstract">Abstract</option>
        <option value="surreal">Surreal</option>
      </select>
    </div>

    <!-- Bulk Actions Bar -->
    <Transition
      enter-active-class="transition-all duration-200 ease-out"
      enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition-all duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <div
        v-if="selectedIds.size > 0"
        class="flex items-center gap-3 mb-4 px-4 py-3 bg-accent-red/10 border border-accent-red/20 rounded-lg"
      >
        <span class="text-sm text-white font-medium">
          {{ selectedIds.size }} selected
        </span>
        <div class="flex items-center gap-2 ml-auto">
          <button
            @click="bulkPublish(true)"
            :disabled="bulkUpdating"
            class="px-3 py-1.5 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-500 rounded-md transition-colors disabled:opacity-50"
          >
            Publish
          </button>
          <button
            @click="bulkPublish(false)"
            :disabled="bulkUpdating"
            class="px-3 py-1.5 text-xs font-medium text-white bg-amber-600 hover:bg-amber-500 rounded-md transition-colors disabled:opacity-50"
          >
            Unpublish
          </button>
          <button
            @click="selectedIds.clear()"
            class="px-3 py-1.5 text-xs font-medium text-gray-300 hover:text-white bg-gray-700 hover:bg-gray-600 rounded-md transition-colors"
          >
            Deselect
          </button>
        </div>
      </div>
    </Transition>

    <!-- Loading -->
    <div v-if="loading" class="text-gray-400 text-center py-12">Loading artworks...</div>

    <!-- Artworks Table -->
    <div v-else class="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
      <table class="w-full">
        <thead>
          <tr class="border-b border-gray-800 text-left">
            <th class="px-3 py-3 w-8">
              <input
                type="checkbox"
                :checked="allSelected"
                :indeterminate="someSelected && !allSelected"
                @change="toggleSelectAll"
                class="w-4 h-4 rounded border-gray-600 bg-gray-800 text-accent-red focus:ring-accent-red/50 cursor-pointer"
              />
            </th>
            <th class="px-2 py-3 w-10">
              <span class="sr-only">Reorder</span>
            </th>
            <th class="px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider w-10">#</th>
            <th class="px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Image</th>
            <th class="px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Title</th>
            <th class="px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Category</th>
            <th class="px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Year</th>
            <th class="px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
            <th class="px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider text-right">Actions</th>
          </tr>
        </thead>
        <tbody ref="tbodyEl" class="divide-y divide-gray-800">
          <tr
            v-for="(artwork, index) in filteredList"
            :key="artwork.id"
            :data-id="artwork.id"
            class="hover:bg-gray-800/50 transition-colors"
          >
            <td class="px-3 py-3">
              <input
                type="checkbox"
                :checked="selectedIds.has(artwork.id)"
                @change="toggleSelect(artwork.id)"
                class="w-4 h-4 rounded border-gray-600 bg-gray-800 text-accent-red focus:ring-accent-red/50 cursor-pointer"
              />
            </td>
            <td class="px-2 py-3 cursor-grab active:cursor-grabbing drag-handle">
              <AdminIconsIconGripVertical class="w-4 h-4 text-gray-600 hover:text-gray-400 transition-colors" />
            </td>
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
            <td class="px-5 py-3">
              <span
                class="inline-flex px-2.5 py-1 text-xs font-medium rounded-full"
                :class="artwork.published
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-gray-800 text-gray-500 border border-gray-700'"
              >
                {{ artwork.published ? 'Published' : 'Draft' }}
              </span>
            </td>
            <td class="px-5 py-3 text-right">
              <div class="flex items-center justify-end gap-2">
                <NuxtLink
                  :to="`/admin/artworks/${artwork.id}`"
                  class="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                  :aria-label="`Edit ${artwork.title}`"
                >
                  <IconEdit class="w-4 h-4" />
                </NuxtLink>
                <button
                  @click="confirmDelete(artwork)"
                  class="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded-lg transition-colors"
                  :aria-label="`Delete ${artwork.title}`"
                >
                  <IconTrash class="w-4 h-4" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-if="!filteredList.length && (searchQuery || categoryFilter)" class="text-gray-500 text-center py-12">
        No artworks match your search. Try a different query or category.
      </div>
      <div v-else-if="!artworksList.length" class="text-gray-500 text-center py-12">
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
import Sortable from 'sortablejs'

definePageMeta({ layout: 'admin', middleware: 'admin' })

interface ArtworkItem {
  id: string
  title: string
  category: string
  medium: string
  src: string
  year: number
  sortOrder: number
  published: boolean
}

const artworksList = ref<ArtworkItem[]>([])
const loading = ref(true)
const deleteTarget = ref<ArtworkItem | null>(null)
const deleting = ref(false)

// Search & filter
const searchQuery = ref('')
const categoryFilter = ref('')

const filteredList = computed(() => {
  let results = artworksList.value
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    results = results.filter(a => a.title.toLowerCase().includes(q))
  }
  if (categoryFilter.value) {
    results = results.filter(a => a.category === categoryFilter.value)
  }
  return results
})

// Bulk selection
const selectedIds = ref(new Set<string>())
const bulkUpdating = ref(false)

const allSelected = computed(() => {
  if (filteredList.value.length === 0) return false
  return filteredList.value.every(a => selectedIds.value.has(a.id))
})

const someSelected = computed(() => {
  return filteredList.value.some(a => selectedIds.value.has(a.id))
})

function toggleSelectAll() {
  if (allSelected.value) {
    // Deselect all in filtered list
    for (const a of filteredList.value) {
      selectedIds.value.delete(a.id)
    }
  } else {
    // Select all in filtered list
    for (const a of filteredList.value) {
      selectedIds.value.add(a.id)
    }
  }
  // Trigger reactivity
  selectedIds.value = new Set(selectedIds.value)
}

function toggleSelect(id: string) {
  if (selectedIds.value.has(id)) {
    selectedIds.value.delete(id)
  } else {
    selectedIds.value.add(id)
  }
  selectedIds.value = new Set(selectedIds.value)
}

async function bulkPublish(published: boolean) {
  if (selectedIds.value.size === 0) return
  bulkUpdating.value = true
  try {
    await $fetch('/api/admin/artworks/bulk-update', {
      method: 'PUT',
      body: { ids: [...selectedIds.value], published },
    })
    // Update local state
    for (const artwork of artworksList.value) {
      if (selectedIds.value.has(artwork.id)) {
        artwork.published = published
      }
    }
    selectedIds.value = new Set()
  } catch (e) {
    alert(getFetchErrorMessage(e, 'Failed to update artworks'))
  } finally {
    bulkUpdating.value = false
  }
}

// Drag-to-reorder
const tbodyEl = ref<HTMLElement | null>(null)
let sortableInstance: Sortable | null = null

function initSortable() {
  if (!tbodyEl.value) return
  sortableInstance = Sortable.create(tbodyEl.value, {
    handle: '.drag-handle',
    animation: 150,
    ghostClass: 'opacity-30',
    onEnd: async () => {
      if (!tbodyEl.value) return
      const rows = tbodyEl.value.querySelectorAll('tr[data-id]')
      const order: { id: string; sortOrder: number }[] = []
      rows.forEach((row, index) => {
        const id = (row as HTMLElement).dataset.id
        if (id) {
          order.push({ id, sortOrder: index })
        }
      })

      // Update local state order
      const orderMap = new Map(order.map(o => [o.id, o.sortOrder]))
      for (const artwork of artworksList.value) {
        const newOrder = orderMap.get(artwork.id)
        if (newOrder !== undefined) {
          artwork.sortOrder = newOrder
        }
      }
      artworksList.value.sort((a, b) => a.sortOrder - b.sortOrder)

      // Persist to server
      try {
        await $fetch('/api/admin/artworks/reorder', {
          method: 'PUT',
          body: { order },
        })
      } catch (e) {
        alert(getFetchErrorMessage(e, 'Failed to save reorder'))
      }
    },
  })
}

onMounted(async () => {
  await fetchArtworks()
  nextTick(() => {
    initSortable()
  })
})

onUnmounted(() => {
  sortableInstance?.destroy()
})

async function fetchArtworks() {
  loading.value = true
  try {
    const res = await $fetch<Record<string, unknown>>('/api/admin/artworks')
    artworksList.value = (res.data as ArtworkItem[]) || []
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
    selectedIds.value.delete(deleteTarget.value.id)
    selectedIds.value = new Set(selectedIds.value)
    deleteTarget.value = null
  } catch (e) {
    alert(getFetchErrorMessage(e, 'Failed to delete artwork'))
  } finally {
    deleting.value = false
  }
}
</script>
