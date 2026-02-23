<template>
  <div class="min-h-screen bg-gray-950 flex items-center justify-center p-4">
    <div class="w-full max-w-sm">
      <!-- Logo -->
      <div class="text-center mb-8">
        <div class="w-12 h-12 bg-accent-red rounded-xl flex items-center justify-center text-white font-display font-bold text-lg mx-auto mb-4">
          BL
        </div>
        <h1 class="text-xl font-display font-semibold text-white">Admin Login</h1>
        <p class="text-sm text-gray-500 mt-1">Enter your password to continue</p>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <label for="password" class="block text-sm font-medium text-gray-400 mb-1.5">Password</label>
          <input
            id="password"
            v-model="password"
            type="password"
            placeholder="Enter admin password"
            :disabled="submitting"
            class="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-accent-red focus:ring-1 focus:ring-accent-red transition-colors disabled:opacity-50"
            autofocus
          />
        </div>

        <div v-if="error" class="text-sm text-red-400 bg-red-400/10 px-3 py-2 rounded-lg">
          {{ error }}
        </div>

        <button
          type="submit"
          :disabled="submitting || !password"
          class="w-full py-3 bg-accent-red hover:bg-accent-red-hover text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <div v-if="submitting" class="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
          <span>{{ submitting ? 'Signing in...' : 'Sign In' }}</span>
        </button>
      </form>

      <div class="mt-6 text-center">
        <NuxtLink to="/" class="text-sm text-gray-500 hover:text-gray-300 transition-colors">
          &larr; Back to site
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })

const { login } = useAdminAuth()
const password = ref('')
const error = ref('')
const submitting = ref(false)

async function handleLogin() {
  if (!password.value) return
  error.value = ''
  submitting.value = true

  try {
    await login(password.value)
    await navigateTo('/admin')
  } catch (e: any) {
    error.value = e?.data?.statusMessage || 'Invalid password'
  } finally {
    submitting.value = false
  }
}
</script>
