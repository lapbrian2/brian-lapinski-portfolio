<template>
  <div class="max-w-3xl">
    <div class="flex items-center justify-between mb-8">
      <h1 class="text-2xl font-display font-bold text-white">Credentials</h1>
      <button
        @click="showAddForm = true"
        class="inline-flex items-center gap-2 px-4 py-2.5 bg-accent-red hover:bg-accent-red-hover text-white text-sm font-medium rounded-lg transition-colors"
      >
        <IconPlus class="w-4 h-4" />
        Add Credential
      </button>
    </div>

    <div v-if="loading" class="text-gray-400 text-center py-12">Loading...</div>

    <!-- Add Form -->
    <div v-if="showAddForm" class="bg-gray-900 border border-gray-800 rounded-xl p-5 mb-6">
      <h3 class="text-sm font-medium text-white mb-4">New Credential</h3>
      <div class="grid grid-cols-3 gap-4">
        <div class="col-span-2">
          <input
            v-model="newCredential.name"
            type="text"
            placeholder="Name (e.g. 'AI Art Gallery Exhibition')"
            class="admin-input"
          />
        </div>
        <div>
          <select v-model="newCredential.type" class="admin-input">
            <option value="exhibition">Exhibition</option>
            <option value="role">Role</option>
            <option value="award">Award</option>
          </select>
        </div>
      </div>
      <div class="flex gap-2 mt-3">
        <button
          @click="addCredential"
          :disabled="!newCredential.name || addingCredential"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-accent-red hover:bg-accent-red-hover text-white text-xs font-medium rounded-lg transition-colors disabled:opacity-50"
        >
          {{ addingCredential ? 'Adding...' : 'Add' }}
        </button>
        <button
          @click="showAddForm = false"
          class="px-3 py-1.5 text-xs font-medium text-gray-400 hover:text-white transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>

    <!-- List -->
    <div v-if="!loading" class="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
      <div v-if="!credentialsList.length" class="text-gray-500 text-center py-12">
        No credentials yet.
      </div>
      <div v-else class="divide-y divide-gray-800">
        <div
          v-for="cred in credentialsList"
          :key="cred.id"
          class="flex items-center gap-4 px-5 py-4"
        >
          <div class="flex-1 min-w-0">
            <div v-if="editingId === cred.id" class="flex gap-3">
              <input
                v-model="editName"
                type="text"
                class="flex-1 px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-accent-red"
                @keyup.enter="saveEdit(cred.id)"
              />
              <button
                @click="saveEdit(cred.id)"
                class="px-3 py-1.5 bg-accent-red text-white text-xs font-medium rounded-lg"
              >
                Save
              </button>
              <button
                @click="editingId = null"
                class="px-3 py-1.5 text-gray-400 text-xs"
              >
                Cancel
              </button>
            </div>
            <div v-else>
              <span class="text-sm text-white">{{ cred.name }}</span>
              <span class="ml-2 inline-flex px-2 py-0.5 bg-gray-800 text-gray-400 text-xs font-medium rounded-full capitalize">
                {{ cred.type }}
              </span>
            </div>
          </div>
          <div class="flex items-center gap-1" v-if="editingId !== cred.id">
            <button
              @click="startEdit(cred)"
              class="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
            >
              <IconEdit class="w-4 h-4" />
            </button>
            <button
              @click="deleteCredential(cred.id)"
              class="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <IconTrash class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })

import type { Credential, CredentialsApiResponse } from '~/types/api'

const credentialsList = ref<Credential[]>([])
const loading = ref(true)
const showAddForm = ref(false)
const addingCredential = ref(false)
const editingId = ref<number | null>(null)
const editName = ref('')

const newCredential = reactive({
  name: '',
  type: 'exhibition',
})

onMounted(async () => {
  await fetchCredentials()
})

async function fetchCredentials() {
  loading.value = true
  try {
    const res = await $fetch<any>('/api/admin/credentials')
    credentialsList.value = res.data || []
  } catch {
    credentialsList.value = []
  } finally {
    loading.value = false
  }
}

async function addCredential() {
  addingCredential.value = true
  try {
    await $fetch('/api/admin/credentials', {
      method: 'POST',
      body: { name: newCredential.name, type: newCredential.type },
    })
    newCredential.name = ''
    showAddForm.value = false
    await fetchCredentials()
  } catch (e) {
    alert(getFetchErrorMessage(e, 'Failed to add credential'))
  } finally {
    addingCredential.value = false
  }
}

function startEdit(cred: Credential) {
  editingId.value = cred.id
  editName.value = cred.name
}

async function saveEdit(id: number) {
  try {
    await $fetch(`/api/admin/credentials/${id}`, {
      method: 'PUT',
      body: { name: editName.value },
    })
    editingId.value = null
    await fetchCredentials()
  } catch (e) {
    alert(getFetchErrorMessage(e, 'Failed to update'))
  }
}

async function deleteCredential(id: number) {
  if (!confirm('Delete this credential?')) return
  try {
    await $fetch(`/api/admin/credentials/${id}`, { method: 'DELETE' })
    credentialsList.value = credentialsList.value.filter(c => c.id !== id)
  } catch (e) {
    alert(getFetchErrorMessage(e, 'Failed to delete'))
  }
}
</script>

<style scoped>
.admin-input {
  @apply w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-accent-red focus:ring-1 focus:ring-accent-red transition-colors text-sm;
}
</style>
