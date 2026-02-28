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
    try {
      const res = await $fetch('/api/auth/login', {
        method: 'POST',
        body: { password },
      })
      isAuthenticated.value = true
      return res
    } catch (err) {
      isAuthenticated.value = false
      throw err
    }
  }

  async function logout() {
    try {
      await $fetch('/api/auth/logout', { method: 'POST' })
    } catch {
      // Continue with local logout even if server call fails
    }
    isAuthenticated.value = false
    navigateTo('/admin/login')
  }

  return { isAuthenticated, loading, checkAuth, login, logout }
}
