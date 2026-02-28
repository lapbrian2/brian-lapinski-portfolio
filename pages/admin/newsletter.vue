<template>
  <div>
    <h1 class="text-2xl font-display font-bold text-white mb-8">Send Newsletter</h1>

    <!-- Compose Form -->
    <div class="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-8">
      <div class="space-y-5">
        <!-- Subject -->
        <div>
          <label for="nl-subject" class="block text-sm font-medium text-gray-300 mb-1.5">Subject</label>
          <input
            id="nl-subject"
            v-model="form.subject"
            type="text"
            maxlength="200"
            placeholder="New Artwork: The Threshold"
            class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-accent-red/50 focus:ring-1 focus:ring-accent-red/20 transition-all"
          />
        </div>

        <!-- Body -->
        <div>
          <label for="nl-body" class="block text-sm font-medium text-gray-300 mb-1.5">
            Email Body
            <span class="text-gray-500 font-normal">(HTML)</span>
          </label>
          <textarea
            id="nl-body"
            v-model="form.html"
            rows="12"
            placeholder="<h1>New Work</h1><p>I've published a new piece...</p>"
            class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-accent-red/50 focus:ring-1 focus:ring-accent-red/20 transition-all font-mono"
          />
          <p class="text-xs text-gray-500 mt-1.5">
            Write HTML directly. An unsubscribe footer is automatically appended.
          </p>
        </div>

        <!-- Preview Toggle -->
        <div>
          <button
            class="text-sm text-gray-400 hover:text-gray-200 transition-colors underline underline-offset-4"
            @click="showPreview = !showPreview"
          >
            {{ showPreview ? 'Hide Preview' : 'Show Preview' }}
          </button>
        </div>

        <!-- Preview -->
        <div v-if="showPreview && form.html" class="border border-gray-700 rounded-lg overflow-hidden">
          <div class="bg-gray-800 px-4 py-2 border-b border-gray-700">
            <span class="text-xs text-gray-400 uppercase tracking-wider">Preview</span>
          </div>
          <div class="p-6 bg-[#0a0a0f]">
            <div class="max-w-[560px] mx-auto" v-html="form.html" />
          </div>
        </div>

        <!-- Send Button -->
        <div class="flex items-center justify-between pt-2">
          <p class="text-sm text-gray-400">
            Will send to <strong class="text-white">{{ subscriberCount }}</strong> active subscriber{{ subscriberCount === 1 ? '' : 's' }}
          </p>
          <button
            :disabled="sending || !form.subject.trim() || !form.html.trim()"
            class="px-6 py-2.5 bg-accent-red hover:bg-accent-red-hover text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            @click="sendNewsletter"
          >
            <span v-if="sending" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            {{ sending ? 'Sending...' : 'Send Newsletter' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Result -->
    <div v-if="result" class="bg-gray-900 border border-gray-800 rounded-xl p-6">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-full flex items-center justify-center" :class="result.failed ? 'bg-yellow-500/10' : 'bg-green-500/10'">
          <svg v-if="!result.failed" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#4ade80" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="4 10 8 14 16 6" />
          </svg>
          <svg v-else width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#eab308" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="10" cy="10" r="8" />
            <line x1="10" y1="6" x2="10" y2="10" />
            <line x1="10" y1="13" x2="10" y2="14" />
          </svg>
        </div>
        <div>
          <p class="text-sm font-medium text-white">
            {{ result.sent }} email{{ result.sent === 1 ? '' : 's' }} sent successfully
          </p>
          <p v-if="result.failed" class="text-xs text-yellow-400">
            {{ result.failed }} failed to send
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })

const form = reactive({
  subject: '',
  html: '',
})

const sending = ref(false)
const showPreview = ref(false)
const subscriberCount = ref(0)
const result = ref<{ sent: number; failed: number } | null>(null)

// Load subscriber count
onMounted(async () => {
  try {
    const res = await $fetch<{ data: { active: number } }>('/api/admin/subscribers')
    subscriberCount.value = res.data.active
  } catch {
    // Silently fail
  }
})

async function sendNewsletter() {
  if (!form.subject.trim() || !form.html.trim()) return

  const confirmed = window.confirm(
    `Send this newsletter to ${subscriberCount.value} subscriber${subscriberCount.value === 1 ? '' : 's'}?\n\nSubject: ${form.subject}`,
  )
  if (!confirmed) return

  sending.value = true
  result.value = null

  try {
    const res = await $fetch<{ success: boolean; sent: number; failed: number }>(
      '/api/admin/newsletter/send',
      { method: 'POST', body: { subject: form.subject, html: form.html } },
    )
    result.value = { sent: res.sent, failed: res.failed }
  } catch {
    result.value = { sent: 0, failed: subscriberCount.value }
  } finally {
    sending.value = false
  }
}
</script>
