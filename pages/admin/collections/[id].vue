<template>
  <div class="max-w-3xl">
    <div class="flex items-center gap-4 mb-8">
      <NuxtLink
        to="/admin/collections"
        class="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
      >
        <IconArrowLeft class="w-5 h-5" />
      </NuxtLink>
      <h1 class="text-2xl font-display font-bold text-white">
        {{ loading ? 'Loading...' : `Edit: ${collection?.title}` }}
      </h1>
    </div>

    <div v-if="loading" class="text-gray-400 text-center py-12">Loading collection...</div>
    <div v-else-if="!collection" class="text-gray-400 text-center py-12">Collection not found.</div>

    <template v-else>
      <!-- Metadata Form -->
      <div class="bg-gray-900 border border-gray-800 rounded-xl p-5 mb-6">
        <h3 class="text-sm font-medium text-white mb-4">Collection Details</h3>
        <div class="space-y-3">
          <div>
            <label class="block text-xs text-gray-400 mb-1">Title</label>
            <input v-model="form.title" class="admin-input" />
          </div>
          <div>
            <label class="block text-xs text-gray-400 mb-1">Slug</label>
            <input v-model="form.slug" class="admin-input font-mono" />
          </div>
          <div>
            <label class="block text-xs text-gray-400 mb-1">Description</label>
            <textarea v-model="form.description" rows="3" class="admin-input" />
          </div>
          <div>
            <label class="block text-xs text-gray-400 mb-1">Cover Image URL</label>
            <input v-model="form.coverImage" placeholder="/images/artworks/example.webp" class="admin-input" />
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs text-gray-400 mb-1">Sort Order</label>
              <input v-model.number="form.sortOrder" type="number" class="admin-input" />
            </div>
            <div class="flex items-end pb-1">
              <div class="flex items-center gap-2">
                <input
                  v-model="form.featured"
                  type="checkbox"
                  id="edit-featured"
                  class="w-4 h-4 rounded bg-gray-800 border-gray-700 text-accent-red focus:ring-accent-red"
                />
                <label for="edit-featured" class="text-xs text-gray-400">Featured collection</label>
              </div>
            </div>
          </div>
        </div>
        <div class="mt-4">
          <button
            @click="saveCollection"
            :disabled="saving"
            class="inline-flex items-center gap-1.5 px-4 py-2 bg-accent-red hover:bg-accent-red-hover text-white text-xs font-medium rounded-lg transition-colors disabled:opacity-50"
          >
            <IconSave class="w-4 h-4" />
            {{ saving ? 'Saving...' : 'Save Changes' }}
          </button>
        </div>
      </div>

      <!-- Artworks Section -->
      <div class="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden mb-6">
        <div class="px-5 py-4 border-b border-gray-800">
          <h2 class="text-lg font-display font-semibold text-white">
            Artworks ({{ collectionArtworks.length }})
          </h2>
        </div>

        <!-- Add Artwork -->
        <div class="px-5 py-4 border-b border-gray-800">
          <label class="block text-xs text-gray-400 mb-1">Add Artwork</label>
          <div class="flex gap-2">
            <select v-model="selectedArtworkId" class="admin-input flex-1">
              <option value="">Choose an artwork...</option>
              <option
                v-for="a in availableArtworks"
                :key="a.id"
                :value="a.id"
              >
                {{ a.title }} ({{ a.category }})
              </option>
            </select>
            <button
              @click="addArtwork"
              :disabled="!selectedArtworkId"
              class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-accent-red hover:bg-accent-red-hover text-white text-xs font-medium rounded-lg transition-colors disabled:opacity-50 flex-shrink-0"
            >
              <IconPlus class="w-4 h-4" />
              Add
            </button>
          </div>
        </div>

        <!-- Current Artworks List -->
        <div v-if="!collectionArtworks.length" class="text-gray-500 text-center py-8 text-sm">
          No artworks in this collection. Add some above.
        </div>
        <div v-else class="divide-y divide-gray-800">
          <div
            v-for="(artwork, index) in collectionArtworks"
            :key="artwork.id"
            class="flex items-center gap-4 px-5 py-3"
          >
            <NuxtImg
              v-if="artwork.src"
              :src="artwork.src"
              :alt="artwork.title"
              width="64"
              height="64"
              class="w-12 h-12 object-cover rounded-lg flex-shrink-0"
            />
            <div v-else class="w-12 h-12 bg-gray-700 rounded-lg flex-shrink-0" />

            <div class="flex-1 min-w-0">
              <span class="text-sm text-white font-medium">{{ artwork.title }}</span>
              <p class="text-xs text-gray-400 mt-0.5">{{ artwork.category }} &middot; {{ artwork.year }}</p>
            </div>

            <!-- Reorder Buttons -->
            <div class="flex flex-col gap-0.5">
              <button
                @click="moveArtwork(index, -1)"
                :disabled="index === 0"
                class="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors disabled:opacity-25 disabled:hover:bg-transparent disabled:hover:text-gray-400"
                title="Move up"
              >
                <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="m18 15-6-6-6 6"/>
                </svg>
              </button>
              <button
                @click="moveArtwork(index, 1)"
                :disabled="index === collectionArtworks.length - 1"
                class="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors disabled:opacity-25 disabled:hover:bg-transparent disabled:hover:text-gray-400"
                title="Move down"
              >
                <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="m6 9 6 6 6-6"/>
                </svg>
              </button>
            </div>

            <!-- Remove -->
            <button
              @click="removeArtwork(index)"
              class="p-1.5 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded-lg transition-colors"
              title="Remove from collection"
            >
              <IconTrash class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <!-- Save Artworks -->
      <div class="flex justify-end">
        <button
          @click="saveCollection"
          :disabled="saving"
          class="inline-flex items-center gap-1.5 px-4 py-2 bg-accent-red hover:bg-accent-red-hover text-white text-xs font-medium rounded-lg transition-colors disabled:opacity-50"
        >
          <IconSave class="w-4 h-4" />
          {{ saving ? 'Saving...' : 'Save All Changes' }}
        </button>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })

import type { Artwork } from '~/types/artwork'

interface CollectionData {
  id: number
  title: string
  slug: string
  description: string
  coverImage: string
  sortOrder: number
  featured: boolean
  artworks: CollectionArtworkItem[]
}

interface CollectionArtworkItem {
  id: string
  title: string
  src: string
  category: string
  medium: string
  year: number
}

const route = useRoute()
const collectionId = route.params.id as string

const collection = ref<CollectionData | null>(null)
const allArtworks = ref<Artwork[]>([])
const loading = ref(true)
const saving = ref(false)
const selectedArtworkId = ref('')

const form = reactive({
  title: '',
  slug: '',
  description: '',
  coverImage: '',
  sortOrder: 0,
  featured: false,
})

const collectionArtworks = ref<CollectionArtworkItem[]>([])

// Artworks not already in the collection
const availableArtworks = computed(() => {
  const currentIds = new Set(collectionArtworks.value.map(a => a.id))
  return allArtworks.value.filter(a => !currentIds.has(a.id))
})

onMounted(async () => {
  await loadData()
})

async function loadData() {
  loading.value = true
  try {
    const [collectionRes, artworksRes] = await Promise.all([
      $fetch<{ data: CollectionData }>(`/api/admin/collections/${collectionId}`).catch(() => ({ data: null as CollectionData | null })),
      $fetch<{ data: Artwork[] }>('/api/admin/artworks').catch(() => ({ data: [] as Artwork[] })),
    ])

    if (collectionRes.data) {
      collection.value = collectionRes.data
      form.title = collectionRes.data.title
      form.slug = collectionRes.data.slug
      form.description = collectionRes.data.description
      form.coverImage = collectionRes.data.coverImage
      form.sortOrder = collectionRes.data.sortOrder
      form.featured = collectionRes.data.featured
      collectionArtworks.value = [...(collectionRes.data.artworks || [])]
    }

    allArtworks.value = artworksRes.data || []
  } finally {
    loading.value = false
  }
}

function addArtwork() {
  if (!selectedArtworkId.value) return
  const artwork = allArtworks.value.find(a => a.id === selectedArtworkId.value)
  if (!artwork) return
  collectionArtworks.value.push({
    id: artwork.id,
    title: artwork.title,
    src: artwork.src,
    category: artwork.category,
    medium: artwork.medium,
    year: artwork.year,
  })
  selectedArtworkId.value = ''
}

function removeArtwork(index: number) {
  collectionArtworks.value.splice(index, 1)
}

function moveArtwork(index: number, direction: number) {
  const newIndex = index + direction
  if (newIndex < 0 || newIndex >= collectionArtworks.value.length) return
  const items = [...collectionArtworks.value]
  const [moved] = items.splice(index, 1)
  items.splice(newIndex, 0, moved)
  collectionArtworks.value = items
}

async function saveCollection() {
  saving.value = true
  try {
    await $fetch(`/api/admin/collections/${collectionId}`, {
      method: 'PUT',
      body: {
        title: form.title,
        slug: form.slug,
        description: form.description,
        coverImage: form.coverImage,
        sortOrder: form.sortOrder,
        featured: form.featured,
        artworkIds: collectionArtworks.value.map(a => a.id),
      },
    })
    alert('Collection saved successfully.')
  } catch (e) {
    alert(getFetchErrorMessage(e, 'Failed to save collection'))
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.admin-input {
  @apply w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-accent-red focus:ring-1 focus:ring-accent-red transition-colors text-sm;
}
</style>
