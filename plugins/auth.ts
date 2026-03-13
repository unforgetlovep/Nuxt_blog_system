export default defineNuxtPlugin(async (nuxtApp) => {
  const userStore = useUserStore()
  
  // Only fetch user on server-side once, or on initial client hydration
  await userStore.fetchUser()
})