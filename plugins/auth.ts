// pinia-plugin-persistedstate 会在 SSR/CSR 两端自动从 Cookie 恢复状态
// 此插件只负责校验 Token 有效性，确保过期 Token 不会导致"假登录"
export default defineNuxtPlugin(async () => {
  const userStore = useUserStore()

  if (import.meta.server) {
    // SSR 端：持久化插件已从 Cookie 恢复状态
    // 额外检查 auth_token 是否存在，若无则主动清除持久化的用户状态
    const event = useRequestEvent()
    if (event) {
      const token = getCookie(event, 'auth_token')
      if (!token && userStore.isAuthenticated) {
        userStore.user = null
        userStore.isAuthenticated = false
      }
    }
  } else {
    // CSR 端：若已有登录态则在后台静默校验 Token，确保 Token 未过期
    if (userStore.isAuthenticated) {
      userStore.fetchUser()
    }
  }
})
