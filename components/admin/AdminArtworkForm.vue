<template>
  <form @submit.prevent="handleSubmit" class="space-y-6">
    <!-- Image Upload -->
    <div>
      <label class="block text-sm font-medium text-gray-400 mb-2">Image</label>
      <div class="flex items-start gap-6">
        <!-- Preview -->
        <div v-if="form.src" class="w-32 h-32 bg-gray-800 rounded-lg overflow-hidden flex-shrink-0">
          <img :src="form.src" alt="Preview" class="w-full h-full object-cover" />
        </div>
        <!-- Upload zone -->
        <div
          @click="fileInput?.click()"
          @dragover.prevent="dragOver = true"
          @dragleave="dragOver = false"
          @drop.prevent="handleDrop"
          class="flex-1 border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors"
          :class="dragOver ? 'border-accent-red bg-accent-red/5' : 'border-gray-700 hover:border-gray-500'"
        >
          <IconUpload class="w-8 h-8 text-gray-500 mx-auto mb-2" />
          <p class="text-sm text-gray-400">
            <span v-if="uploading">Uploading...</span>
            <span v-else>Click or drag to upload an image</span>
          </p>
          <p class="text-xs text-gray-600 mt-1">Max 10MB. JPG, PNG, WebP</p>
          <input
            ref="fileInput"
            type="file"
            accept="image/*"
            class="hidden"
            @change="handleFileSelect"
          />
        </div>
      </div>
      <div v-if="form.src && !uploading" class="mt-2">
        <input
          v-model="form.src"
          type="text"
          placeholder="Or enter image URL directly"
          class="w-full px-3 py-2 bg-gray-900 border border-gray-800 rounded-lg text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:border-accent-red"
        />
      </div>
    </div>

    <!-- Title + ID -->
    <div class="grid grid-cols-2 gap-4">
      <div>
        <label class="block text-sm font-medium text-gray-400 mb-1.5">Title</label>
        <input
          v-model="form.title"
          type="text"
          required
          placeholder="e.g. The Watcher"
          class="admin-input"
          @blur="autoGenerateId"
        />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-400 mb-1.5">ID (slug)</label>
        <input
          v-model="form.id"
          type="text"
          required
          :disabled="isEditing"
          placeholder="e.g. veiled-gaze"
          class="admin-input disabled:opacity-50"
        />
      </div>
    </div>

    <!-- Category + Aspect -->
    <div class="grid grid-cols-2 gap-4">
      <div>
        <label class="block text-sm font-medium text-gray-400 mb-1.5">Category</label>
        <select v-model="form.category" required class="admin-input">
          <option value="">Select category</option>
          <option value="portraits">Portraits</option>
          <option value="landscapes">Landscapes</option>
          <option value="abstract">Abstract</option>
          <option value="surreal">Surreal</option>
        </select>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-400 mb-1.5">Aspect Ratio</label>
        <select v-model="form.aspect" required class="admin-input">
          <option value="">Select aspect</option>
          <option value="tall">Tall (portrait)</option>
          <option value="wide">Wide (landscape)</option>
          <option value="square">Square</option>
        </select>
      </div>
    </div>

    <!-- Medium + Year -->
    <div class="grid grid-cols-2 gap-4">
      <div>
        <label class="block text-sm font-medium text-gray-400 mb-1.5">Medium</label>
        <input
          v-model="form.medium"
          type="text"
          required
          placeholder="e.g. Midjourney + Photoshop"
          class="admin-input"
        />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-400 mb-1.5">Year</label>
        <input
          v-model.number="form.year"
          type="number"
          required
          min="2020"
          :max="new Date().getFullYear()"
          class="admin-input"
        />
      </div>
    </div>

    <!-- Description -->
    <div>
      <label class="block text-sm font-medium text-gray-400 mb-1.5">Description</label>
      <textarea
        v-model="form.description"
        required
        rows="4"
        placeholder="Describe the artwork..."
        class="admin-input resize-none"
      />
    </div>

    <!-- Error -->
    <div v-if="error" class="text-sm text-red-400 bg-red-400/10 px-3 py-2 rounded-lg">
      {{ error }}
    </div>

    <!-- Actions -->
    <div class="flex items-center gap-3 pt-2">
      <button
        type="submit"
        :disabled="saving"
        class="inline-flex items-center gap-2 px-6 py-2.5 bg-accent-red hover:bg-accent-red-hover text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
      >
        <IconSave class="w-4 h-4" />
        {{ saving ? 'Saving...' : (isEditing ? 'Update Artwork' : 'Create Artwork') }}
      </button>
      <NuxtLink
        to="/admin/artworks"
        class="px-4 py-2.5 text-sm font-medium text-gray-400 hover:text-white transition-colors"
      >
        Cancel
      </NuxtLink>
    </div>
  </form>
</template>

<script setup lang="ts">
interface ArtworkFormData {
  id: string
  title: string
  category: string
  medium: string
  description: string
  src: string
  aspect: string
  year: number
}

const props = defineProps<{
  initialData?: ArtworkFormData
}>()

const emit = defineEmits<{
  saved: [id: string]
}>()

const isEditing = computed(() => !!props.initialData)
const fileInput = ref<HTMLInputElement | null>(null)
const dragOver = ref(false)
const uploading = ref(false)
const saving = ref(false)
const error = ref('')

const form = reactive<ArtworkFormData>({
  id: props.initialData?.id || '',
  title: props.initialData?.title || '',
  category: props.initialData?.category || '',
  medium: props.initialData?.medium || '',
  description: props.initialData?.description || '',
  src: props.initialData?.src || '',
  aspect: props.initialData?.aspect || '',
  year: props.initialData?.year || new Date().getFullYear(),
})

function autoGenerateId() {
  if (!isEditing.value && form.title && !form.id) {
    form.id = form.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
  }
}

async function uploadFile(file: File) {
  if (!file.type.startsWith('image/')) {
    error.value = 'Only image files are allowed'
    return
  }
  if (file.size > 10 * 1024 * 1024) {
    error.value = 'File too large (max 10MB)'
    return
  }

  uploading.value = true
  error.value = ''

  try {
    const formData = new FormData()
    formData.append('file', file)
    const res = await $fetch<any>('/api/admin/upload', {
      method: 'POST',
      body: formData,
    })
    form.src = res.data.url
  } catch (e: any) {
    error.value = e?.data?.statusMessage || 'Upload failed'
  } finally {
    uploading.value = false
  }
}

function handleFileSelect(e: Event) {
  const input = e.target as HTMLInputElement
  if (input.files?.[0]) uploadFile(input.files[0])
}

function handleDrop(e: DragEvent) {
  dragOver.value = false
  if (e.dataTransfer?.files?.[0]) uploadFile(e.dataTransfer.files[0])
}

async function handleSubmit() {
  error.value = ''
  saving.value = true

  try {
    if (isEditing.value) {
      await $fetch(`/api/admin/artworks/${form.id}`, {
        method: 'PUT',
        body: { ...form },
      })
    } else {
      await $fetch('/api/admin/artworks', {
        method: 'POST',
        body: { ...form },
      })
    }
    emit('saved', form.id)
  } catch (e: any) {
    error.value = e?.data?.statusMessage || 'Failed to save artwork'
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.admin-input {
  @apply w-full px-4 py-2.5 bg-gray-900 border border-gray-800 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-accent-red focus:ring-1 focus:ring-accent-red transition-colors text-sm;
}
</style>
