<script setup lang="ts">
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const MESSAGE_MAX = 1000

const { form, errors, status, serverError, submit, reset } = useContactForm()
const formEl = ref<HTMLElement | null>(null)

const messageLength = computed(() => form.message.length)
const messageLengthPercent = computed(() => Math.min(100, (messageLength.value / MESSAGE_MAX) * 100))
let ctx: gsap.Context | null = null

onMounted(() => {
  if (!formEl.value) return

  ctx = gsap.context(() => {
    const fields = formEl.value!.querySelectorAll('.form-field')
    gsap.set(fields, { opacity: 0, y: 30 })

    ScrollTrigger.create({
      trigger: formEl.value!,
      start: 'top 85%',
      once: true,
      onEnter: () => {
        gsap.to(fields, {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.08,
          ease: 'power3.out',
        })
      },
    })
  }, formEl.value)
})

onUnmounted(() => {
  ctx?.revert()
})
</script>

<template>
  <div ref="formEl" class="max-w-2xl">
    <!-- Success state -->
    <div v-if="status === 'success'" class="glass rounded-xl p-8 md:p-10 text-center">
      <div class="w-14 h-14 rounded-full bg-accent-red/10 border border-accent-red/30 flex items-center justify-center mx-auto mb-6">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ed544d" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>
      <h3 class="font-display text-xl text-lavender-100 mb-3">Message Sent</h3>
      <p class="font-body text-sm text-lavender-300 mb-6">Thanks for reaching out. I'll get back to you soon.</p>
      <button
        class="font-body text-sm text-accent-red hover:text-accent-red-hover transition-colors duration-200 underline underline-offset-4"
        @click="reset"
      >
        Send another message
      </button>
    </div>

    <!-- Form -->
    <form v-else class="space-y-5" aria-live="polite" @submit.prevent="submit">
      <!-- Honeypot (hidden from humans) -->
      <div class="absolute opacity-0 h-0 w-0 overflow-hidden" aria-hidden="true" tabindex="-1">
        <label for="website">Website</label>
        <input id="website" v-model="form.website" type="text" name="website" autocomplete="off" tabindex="-1">
      </div>

      <!-- Name -->
      <div class="form-field">
        <label for="contact-name" class="block font-body text-xs uppercase tracking-[0.15em] text-lavender-400/60 mb-2">
          Name
        </label>
        <input
          id="contact-name"
          v-model="form.name"
          type="text"
          required
          placeholder="Your name"
          :aria-invalid="!!errors.name"
          :aria-describedby="errors.name ? 'contact-name-error' : undefined"
          class="w-full bg-dark-800/60 border border-dark-600 rounded-lg px-4 py-3 font-body text-sm text-lavender-100 placeholder-lavender-500/40 focus:outline-none focus:border-accent-red/50 focus:ring-1 focus:ring-accent-red/20 transition-all duration-300"
          :class="{ 'border-red-500/50': errors.name }"
        >
        <p v-if="errors.name" id="contact-name-error" class="font-body text-xs text-red-400 mt-1.5">{{ errors.name }}</p>
      </div>

      <!-- Email -->
      <div class="form-field">
        <label for="contact-email" class="block font-body text-xs uppercase tracking-[0.15em] text-lavender-400/60 mb-2">
          Email
        </label>
        <input
          id="contact-email"
          v-model="form.email"
          type="email"
          required
          placeholder="you@example.com"
          :aria-invalid="!!errors.email"
          :aria-describedby="errors.email ? 'contact-email-error' : undefined"
          class="w-full bg-dark-800/60 border border-dark-600 rounded-lg px-4 py-3 font-body text-sm text-lavender-100 placeholder-lavender-500/40 focus:outline-none focus:border-accent-red/50 focus:ring-1 focus:ring-accent-red/20 transition-all duration-300"
          :class="{ 'border-red-500/50': errors.email }"
        >
        <p v-if="errors.email" id="contact-email-error" class="font-body text-xs text-red-400 mt-1.5">{{ errors.email }}</p>
      </div>

      <!-- Message -->
      <div class="form-field">
        <label for="contact-message" class="block font-body text-xs uppercase tracking-[0.15em] text-lavender-400/60 mb-2">
          Message
        </label>
        <textarea
          id="contact-message"
          v-model="form.message"
          required
          rows="5"
          maxlength="1000"
          placeholder="Tell me about your project, collaboration idea, or just say hello..."
          :aria-invalid="!!errors.message"
          :aria-describedby="errors.message ? 'contact-message-error' : undefined"
          class="w-full bg-dark-800/60 border border-dark-600 rounded-lg px-4 py-3 font-body text-sm text-lavender-100 placeholder-lavender-500/40 focus:outline-none focus:border-accent-red/50 focus:ring-1 focus:ring-accent-red/20 transition-all duration-300 resize-none"
          :class="{ 'border-red-500/50': errors.message }"
        />
        <div class="h-px mt-0.5 rounded-full overflow-hidden bg-dark-700">
          <div
            class="h-full transition-all duration-300 ease-out rounded-full"
            :class="[
              messageLength > MESSAGE_MAX ? 'bg-red-400' :
              messageLength > MESSAGE_MAX * 0.9 ? 'bg-amber-400/60' :
              'bg-accent-red/30'
            ]"
            :style="{ width: `${messageLengthPercent}%` }"
          />
        </div>
        <div class="flex items-center justify-between mt-1.5">
          <p v-if="errors.message" id="contact-message-error" class="font-body text-xs text-red-400">{{ errors.message }}</p>
          <span v-else class="flex-1" />
          <span
            class="font-body text-[10px] tabular-nums transition-colors duration-300"
            :class="[
              messageLength > MESSAGE_MAX ? 'text-red-400' :
              messageLength > MESSAGE_MAX * 0.9 ? 'text-amber-400/60' :
              'text-lavender-400/30'
            ]"
          >
            {{ messageLength }} / {{ MESSAGE_MAX }}
          </span>
        </div>
      </div>

      <!-- Error message -->
      <div v-if="status === 'error'" class="form-field">
        <div role="alert" class="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
          <p class="font-body text-sm text-red-400">{{ serverError }}</p>
        </div>
      </div>

      <!-- Submit -->
      <div class="form-field pt-2">
        <button
          type="submit"
          :disabled="status === 'submitting'"
          class="btn-press group relative inline-flex items-center gap-3 px-8 py-3.5 bg-accent-red/10 border border-accent-red/40 rounded-full font-body text-sm uppercase tracking-wider text-accent-red hover:bg-accent-red hover:text-dark-900 transition-all duration-400 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span v-if="status === 'submitting'">Sending...</span>
          <span v-else>Send Message</span>
          <svg
            width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor"
            stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"
            class="group-hover:translate-x-1 transition-transform duration-300"
          >
            <line x1="1" y1="7" x2="13" y2="7" />
            <polyline points="8 2 13 7 8 12" />
          </svg>
        </button>
      </div>
    </form>
  </div>
</template>
