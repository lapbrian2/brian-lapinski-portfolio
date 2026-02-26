export function useContactForm() {
  const form = reactive({
    name: '',
    email: '',
    message: '',
    website: '', // Honeypot
  })

  const errors = reactive({
    name: '',
    email: '',
    message: '',
  })

  const status = ref<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const serverError = ref('')

  function validate(): boolean {
    errors.name = form.name.trim().length < 2 ? 'Name is required' : ''
    errors.email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) ? '' : 'Valid email required'
    errors.message = form.message.trim().length < 10 ? 'Message must be at least 10 characters' : ''
    return !errors.name && !errors.email && !errors.message
  }

  async function submit() {
    if (!validate()) return
    status.value = 'submitting'
    serverError.value = ''

    try {
      await $fetch('/api/contact', {
        method: 'POST',
        body: {
          name: form.name,
          email: form.email,
          message: form.message,
          website: form.website, // Honeypot
        },
      })
      status.value = 'success'
      form.name = ''
      form.email = ''
      form.message = ''
      form.website = ''
    } catch (err: any) {
      status.value = 'error'
      serverError.value = err?.data?.statusMessage || 'Something went wrong. Please try again.'
    }
  }

  function reset() {
    status.value = 'idle'
    serverError.value = ''
  }

  return { form, errors, status, serverError, validate, submit, reset }
}
