export function useAdminAuth() {
  const isAuthenticated = ref(false)
  const loading = ref(true)

  async function checkAuth() {
    loading.value = true
    try {
      await $fetch('/api/auth/me')
      isAuthenticated.value = true
    } catch {
      isAuthenticated.value = false
    } finally {
      loading.value = false
    }
  }

  async function login(password: string) {
    const res = await $fetch('/api/auth/login', {
      method: 'POST',
      body: { password },
    })
    isAuthenticated.value = true
    return res
  }

  async function logout() {
    await $fetch('/api/auth/logout', { method: 'POST' })
    isAuthenticated.value = false
    navigateTo('/admin/login')
  }

  return { isAuthenticated, loading, checkAuth, login, logout }
}
