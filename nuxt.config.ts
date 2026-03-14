// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: [
    '@pinia/nuxt',
    'pinia-plugin-persistedstate/nuxt',
    '@nuxtjs/tailwindcss',
  ],
  // Nuxt 4 默认 srcDir 为 app/，需手动将根目录的 stores/ 和 plugins/ 加入自动导入扫描范围
  imports: {
    dirs: ['stores'],
  },
})
