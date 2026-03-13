import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { User } from '~~/shared/types/user'

export const useUserStore = defineStore('user', () => {
  const user = ref<User | null>(null)
  const isAuthenticated = ref(false)

  const fetchUser = async () => {
    try {
      const { data } = await $fetch('/api/auth/me')
      if (data?.user) {
        user.value = data.user
        isAuthenticated.value = true
      }
    } catch (e) {
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

  return {
    user,
    isAuthenticated,
    fetchUser,
    logout
  }
})