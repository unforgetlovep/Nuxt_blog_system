export default defineNuxtRouteMiddleware(async (to, from) => {
  // Only protect /admin routes, but allow /admin/login
  if (to.path.startsWith('/admin') && to.path !== '/admin/login') {
    try {
      const { data, error } = await useFetch('/api/auth/me')
      
      if (error.value || !data.value?.user) {
        return navigateTo('/admin/login')
      }
      
      if (data.value.user.role !== 'admin') {
        return navigateTo('/') // Redirect non-admins to home
      }
    } catch (e) {
      return navigateTo('/admin/login')
    }
  }
})
