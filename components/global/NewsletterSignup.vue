<script setup lang="ts">
const form = reactive({
  email: '',
  name: '',
  website: '', // Honeypot
})

const status = ref<'idle' | 'submitting' | 'success' | 'error'>('idle')
const errorMessage = ref('')

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

async function submit() {
  errorMessage.value = ''

  if (!form.email.trim() || !validateEmail(form.email)) {
    errorMessage.value = 'Please enter a valid email address.'
    status.value = 'error'
    return
  }

  status.value = 'submitting'

  try {
    await $fetch('/api/newsletter/subscribe', {
      method: 'POST',
      body: {
        email: form.email,
        name: form.name || undefined,
        website: form.website, // Honeypot
      },
    })
    status.value = 'success'
    form.email = ''
    form.name = ''
    form.website = ''
  } catch (err) {
    status.value = 'error'
    errorMessage.value = getFetchErrorMessage(err, 'Something went wrong. Please try again.')
  }
}

function reset() {
  status.value = 'idle'
  errorMessage.value = ''
}
</script>

<template>
  <div class="max-w-xl mx-auto">
    <!-- Success state -->
    <div v-if="status === 'success'" class="glass rounded-xl p-8 text-center">
      <div class="w-14 h-14 rounded-full bg-accent-red/10 border border-accent-red/30 flex items-center justify-center mx-auto mb-5">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ed544d" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>
      <h3 class="font-display text-xl text-lavender-100 mb-2">You're in</h3>
      <p class="font-body text-sm text-lavender-300 mb-5">
        Thanks for subscribing. You'll hear from me when something worth sharing happens.
      </p>
      <button
        class="font-body text-sm text-accent-red hover:text-accent-red-hover transition-colors duration-200 underline underline-offset-4"
        @click="reset"
      >
        Subscribe another email
      </button>
    </div>

    <!-- Form -->
    <form v-else class="glass rounded-xl p-8 space-y-4" aria-live="polite" @submit.prevent="submit">
      <div class="text-center mb-2">
        <h3 class="font-display text-lg text-lavender-100 mb-1">Stay in the loop</h3>
        <p class="font-body text-sm text-lavender-400">
          New work, process insights, and creative experiments. No spam.
        </p>
      </div>

      <!-- Honeypot (hidden from humans) -->
      <div class="absolute opacity-0 h-0 w-0 overflow-hidden" aria-hidden="true" tabindex="-1">
        <label for="nl-website">Website</label>
        <input id="nl-website" v-model="form.website" type="text" name="website" autocomplete="off" tabindex="-1">
      </div>

      <!-- Name (optional) -->
      <div>
        <label for="nl-name" class="block font-body text-xs uppercase tracking-[0.15em] text-lavender-300 mb-1.5">
          Name <span class="text-lavender-500 normal-case tracking-normal">(optional)</span>
        </label>
        <input
          id="nl-name"
          v-model="form.name"
          type="text"
          autocomplete="name"
          maxlength="100"
          placeholder="Your name"
          class="w-full bg-dark-800/60 border border-dark-600 rounded-lg px-4 py-2.5 font-body text-sm text-lavender-100 placeholder-lavender-500/40 focus:outline-none focus:border-accent-red/50 focus:ring-1 focus:ring-accent-red/20 transition-all duration-300"
        >
      </div>

      <!-- Email -->
      <div>
        <label for="nl-email" class="block font-body text-xs uppercase tracking-[0.15em] text-lavender-300 mb-1.5">
          Email
        </label>
        <input
          id="nl-email"
          v-model="form.email"
          type="email"
          required
          autocomplete="email"
          maxlength="200"
          placeholder="you@example.com"
          :aria-invalid="status === 'error' && !!errorMessage"
          :aria-describedby="status === 'error' ? 'nl-error' : undefined"
          class="w-full bg-dark-800/60 border border-dark-600 rounded-lg px-4 py-2.5 font-body text-sm text-lavender-100 placeholder-lavender-500/40 focus:outline-none focus:border-accent-red/50 focus:ring-1 focus:ring-accent-red/20 transition-all duration-300"
          :class="{ 'border-red-500/50': status === 'error' }"
        >
      </div>

      <!-- Error message -->
      <div v-if="status === 'error' && errorMessage" id="nl-error" role="alert" class="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2.5">
        <p class="font-body text-sm text-red-400">{{ errorMessage }}</p>
      </div>

      <!-- Submit -->
      <button
        type="submit"
        :disabled="status === 'submitting'"
        class="btn-press w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-accent-red/15 border border-accent-red/50 rounded-full font-body text-sm font-medium uppercase tracking-wider text-accent-red hover:bg-accent-red hover:text-dark-900 transition-all duration-400 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span v-if="status === 'submitting'">Subscribing...</span>
        <span v-else>Subscribe</span>
        <svg
          v-if="status !== 'submitting'"
          width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor"
          stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"
        >
          <line x1="1" y1="7" x2="13" y2="7" />
          <polyline points="8 2 13 7 8 12" />
        </svg>
      </button>

      <p class="font-body text-[11px] text-lavender-500 text-center">
        Unsubscribe anytime. Your email stays private.
      </p>
    </form>
  </div>
</template>
