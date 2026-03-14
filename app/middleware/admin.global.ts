import { useUserStore } from "~~/stores/user"

export default defineNuxtRouteMiddleware(async (to) => {
  if (!to.path.startsWith('/admin') || to.path === '/admin/login') return

  const userStore = useUserStore()

  // 优先使用持久化 store 状态，避免每次路由跳转都发 API 请求
  if (userStore.isAuthenticated && userStore.user) {
    if (userStore.user.role !== 'admin') return navigateTo('/')
    return
  }

  // store 无状态时（首次访问或 Cookie 失效），请求接口兜底验证
  try {
    const data = await $fetch<{ user: { role: string } & Record<string, any> }>('/api/auth/me')
    if (!data?.user) return navigateTo('/admin/login')
    if (data.user.role !== 'admin') return navigateTo('/')
    userStore.setUser(data.user)
  } catch {
    return navigateTo('/admin/login')
  }
})
