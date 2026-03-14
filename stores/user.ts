import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { User } from '~~/shared/types/user'

export const useUserStore = defineStore('user', () => {
  const user = ref<User | null>(null)
  const isAuthenticated = ref(false)

  const setUser = (userData: User | null) => {
    user.value = userData
    isAuthenticated.value = !!userData
  }

  const fetchUser = async (customFetch?: typeof $fetch) => {
    try {
      const fetchFn = customFetch || $fetch
      const data: any = await fetchFn('/api/auth/me')
      if (data?.user) {
        user.value = data.user
        isAuthenticated.value = true
      } else {
        user.value = null
        isAuthenticated.value = false
      }
    } catch {
      user.value = null
      isAuthenticated.value = false
    }
  }

  const logout = async () => {
    try {
      await $fetch('/api/auth/logout', { method: 'POST' })
      user.value = null
      isAuthenticated.value = false
      navigateTo('/')
    } catch (e) {
      console.error('Logout failed', e)
    }
  }

  return { user, isAuthenticated, setUser, fetchUser, logout }
}, {
  persist: {
    // 使用 Cookie 存储，SSR 和 CSR 均可读取，解决刷新丢失登录态问题
    // maxAge 与 JWT 有效期保持一致（7天）
    storage: piniaPluginPersistedstate.cookies({
      maxAge: 60 * 60 * 24 * 7,
      sameSite: 'lax',
    }),
    pick: ['user', 'isAuthenticated'],
  },
})
