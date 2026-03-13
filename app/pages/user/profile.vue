<script setup lang="ts">
import { useUserStore } from '~~/stores/user'
import type { BlogArticle } from '~~/shared/types/article'

definePageMeta({
  middleware: [
    function (to, from) {
      const userStore = useUserStore()
      if (!userStore.isAuthenticated) {
        return navigateTo('/')
      }
    }
  ]
})

const userStore = useUserStore()

interface ArticlesResponse {
  list: BlogArticle[]
}

const { data, pending } = await useFetch<ArticlesResponse>('/api/user/posts', {
  lazy: true
})

const articles = computed(() => data.value?.list ?? [])

const getStatusClass = (status: string) => {
  switch (status) {
    case '已发布': return 'bg-green-100 text-green-700'
    case '草稿': return 'bg-gray-100 text-gray-700'
    case '待审核': return 'bg-yellow-100 text-yellow-700'
    default: return 'bg-gray-100 text-gray-700'
  }
}
</script>

<template>
  <div class="max-w-4xl mx-auto py-8">
    <!-- User Profile Header -->
    <div class="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm mb-8 flex flex-col md:flex-row items-center gap-6">
      <div class="h-24 w-24 rounded-full bg-gray-100 flex items-center justify-center text-4xl font-bold text-gray-400">
        {{ userStore.user?.username.charAt(0).toUpperCase() }}
      </div>
      <div class="text-center md:text-left flex-1">
        <h1 class="text-2xl font-bold text-gray-900 mb-2">{{ userStore.user?.username }}</h1>
        <div class="flex items-center justify-center md:justify-start gap-4 text-sm text-gray-500">
          <span class="px-2.5 py-1 rounded bg-gray-100 font-medium">{{ userStore.user?.role === 'admin' ? '社区管理员' : '创作者' }}</span>
          <span>加入于 {{ new Date(userStore.user?.createdAt || '').toLocaleDateString('zh-CN') }}</span>
        </div>
      </div>
      <div class="mt-4 md:mt-0">
        <NuxtLink to="/posts/write" class="flex items-center gap-2 rounded-full bg-[#D71A1B] px-6 py-2.5 text-sm font-bold text-white transition hover:bg-red-700 shadow-sm">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
          发布新文章
        </NuxtLink>
      </div>
    </div>

    <!-- My Articles -->
    <div>
      <h2 class="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
        我的创作
        <span class="text-sm font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{{ articles.length }} 篇</span>
      </h2>

      <div v-if="pending" class="py-12 text-center text-gray-500">
        <svg class="w-6 h-6 animate-spin mx-auto mb-3 text-gray-400" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        加载中...
      </div>

      <div v-else-if="articles.length === 0" class="py-16 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
        <div class="h-16 w-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
          <svg class="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"></path></svg>
        </div>
        <p class="text-gray-500 mb-4">你还没有发布过文章</p>
        <NuxtLink to="/posts/write" class="text-[#D71A1B] font-bold hover:underline">立即开始创作 &rarr;</NuxtLink>
      </div>

      <div v-else class="space-y-4">
        <div v-for="article in articles" :key="article.slug" class="group bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col sm:flex-row gap-5 items-start">
          <div class="flex-1 min-w-0 w-full">
            <div class="flex items-center gap-3 mb-2">
              <span :class="['px-2 py-0.5 rounded text-[11px] font-bold', getStatusClass(article.status)]">
                {{ article.status }}
              </span>
              <span class="text-xs text-gray-400">{{ article.updatedAt }}</span>
            </div>
            <NuxtLink :to="article.status === '已发布' ? `/posts/${article.slug}` : `/posts/write?slug=${article.slug}`">
              <h3 class="text-lg font-bold text-gray-900 group-hover:text-[#D71A1B] transition-colors truncate mb-1">{{ article.title }}</h3>
            </NuxtLink>
            <p class="text-sm text-gray-500 line-clamp-2">{{ article.summary }}</p>
          </div>
          
          <div class="flex items-center gap-3 mt-4 sm:mt-0 w-full sm:w-auto shrink-0 justify-end border-t sm:border-t-0 border-gray-100 pt-4 sm:pt-0">
            <span class="text-xs text-gray-400 flex items-center gap-1 mr-2">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
              {{ article.views }}
            </span>
            <NuxtLink :to="`/posts/write?slug=${article.slug}`" class="px-4 py-1.5 rounded-full border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
              编辑
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>