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
  runtimeConfig: {
    // 阿里云 OSS 配置（服务端私密，不暴露给客户端）
    ossRegion: process.env.OSS_REGION || '',
    ossAccessKeyId: process.env.OSS_ACCESS_KEY_ID || '',
    ossAccessKeySecret: process.env.OSS_ACCESS_KEY_SECRET || '',
    ossBucket: process.env.OSS_BUCKET || '',
    // 自定义域名（可选，绑定 CDN 域名时填写，不含协议前缀）
    ossCustomDomain: process.env.OSS_CUSTOM_DOMAIN || '',
    // 上传文件存放目录前缀
    ossUploadDir: process.env.OSS_UPLOAD_DIR || 'blog/images',
  },
  nitro: {
    // 确保 ali-oss 作为外部依赖正确解析
    externals: {
      external: ['ali-oss'],
    },
  },
})
