<script setup lang="ts">
import MarkdownIt from 'markdown-it'
import type { BlogArticle } from '~~/shared/types/article'

const route = useRoute()
const slug = computed(() => decodeURIComponent(String(route.params.slug ?? '')))
const { data } = await useFetch<{ article: BlogArticle }>(
  () => `/api/posts/${encodeURIComponent(slug.value)}`,
  {
    watch: [slug],
  },
)
const article = computed(() => data.value?.article ?? null)
const markdown = new MarkdownIt({
  breaks: true,
  linkify: true,
})

const renderedContent = computed(() => markdown.render(article.value?.content ?? ''))

useSeoMeta({
  title: () => article.value?.title ? `${article.value.title} - Blog System` : '文章详情',
  description: () => article.value?.summary || '文章详情',
  ogTitle: () => article.value?.title,
  ogDescription: () => article.value?.summary,
  ogImage: () => article.value?.cover,
})
</script>

<template>
  <div v-if="article" class="mx-auto max-w-4xl space-y-10">
    <section class="space-y-6">
      <nav class="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <NuxtLink to="/" class="hover:text-[#D71A1B] transition-colors">首页</NuxtLink>
        <span class="text-gray-300">/</span>
        <span class="text-gray-900 font-bold">{{ article.category }}</span>
      </nav>

      <!-- Article Header -->
      <div class="space-y-6 pt-2">
        <h1 class="text-3xl sm:text-4xl lg:text-[40px] font-bold leading-[1.4] text-gray-900 tracking-tight">
          {{ article.title }}
        </h1>
        <p class="text-base sm:text-[17px] leading-relaxed text-gray-500 border-l-4 border-gray-200 pl-4">
          {{ article.summary }}
        </p>

        <div class="flex flex-wrap items-center gap-4 text-[13px] text-gray-500 pt-4 border-t border-gray-100">
          <div class="flex items-center gap-2">
            <div class="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold text-xs">
              {{ (article.author || '佚名').charAt(0) }}
            </div>
            <span class="font-bold text-gray-900">{{ article.author || '佚名' }}</span>
          </div>
          <span class="text-gray-300">•</span>
          <span>{{ article.createdAt }}</span>
          <span class="text-gray-300">•</span>
          <span>阅读约 {{ article.readTime }}</span>
          <span class="text-gray-300">•</span>
          <span class="flex items-center gap-1">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
            {{ article.views }}
          </span>
        </div>
      </div>
      
      <!-- Cover Image -->
      <div v-if="article.cover" class="rounded-md overflow-hidden bg-gray-100 aspect-[21/9]">
        <img :src="article.cover" :alt="article.title" class="h-full w-full object-cover">
      </div>
    </section>

    <!-- Content & Sidebar -->
    <section class="grid gap-10 lg:grid-cols-[minmax(0,1fr)_240px]">
      <article class="min-w-0">
        <!-- Content -->
        <div
          class="prose prose-slate max-w-none prose-headings:font-bold prose-headings:text-gray-900 prose-p:text-gray-700 prose-p:leading-relaxed prose-li:text-gray-700 prose-li:leading-relaxed prose-strong:text-gray-900 prose-a:text-red-600 prose-a:no-underline hover:prose-a:underline prose-img:rounded-lg prose-blockquote:border-red-600 prose-blockquote:bg-gray-50 prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:not-italic"
          v-html="renderedContent"
        />

        <!-- Tags -->
        <div class="mt-10 pt-6 border-t border-gray-100 flex flex-wrap gap-2">
          <span
            v-for="tag in article.tags"
            :key="tag"
            class="rounded bg-gray-100 px-3 py-1 text-xs text-gray-600 hover:bg-gray-200 transition cursor-pointer"
          >
            {{ tag }}
          </span>
        </div>
      </article>

      <aside class="space-y-6 hidden lg:block">
        <div class="sticky top-24 space-y-6">
          <!-- Author Info Card -->
          <div class="rounded-md border border-gray-100 bg-white p-5 text-center shadow-sm">
            <div class="w-16 h-16 rounded-full bg-gray-100 mx-auto mb-3 flex items-center justify-center text-xl font-bold text-gray-400">
              {{ (article.author || '佚名').charAt(0) }}
            </div>
            <p class="text-base font-bold text-gray-900">{{ article.author || '佚名' }}</p>
            <p class="text-xs text-gray-500 mt-1 mb-4">生活派特约作者</p>
            <button class="w-full rounded-full border border-[#D71A1B] text-[#D71A1B] px-4 py-1.5 text-sm font-bold hover:bg-[#D71A1B] hover:text-white transition-colors">
              关注作者
            </button>
          </div>

          <div class="rounded-md border border-gray-100 bg-gray-50 p-5">
            <p class="text-[13px] font-bold text-gray-400 uppercase tracking-wider mb-3">文章信息</p>
            <div class="space-y-3 text-[15px]">
              <div class="flex justify-between">
                <span class="text-gray-500">分类</span>
                <span class="font-bold text-gray-900">{{ article.category }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500">状态</span>
                <span class="font-bold text-gray-900">{{ article.status }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500">更新于</span>
                <span class="font-bold text-gray-900">{{ article.updatedAt }}</span>
              </div>
            </div>
          </div>

          <div class="rounded-md border border-gray-200 bg-white p-5 shadow-sm text-center">
            <p class="text-[13px] font-bold text-gray-400 uppercase tracking-wider mb-3">内容维护</p>
            <NuxtLink
              :to="`/admin/articles/${article.slug}`"
              class="block w-full rounded bg-gray-900 px-4 py-2 text-sm font-bold text-white transition hover:bg-gray-800"
            >
              在后台编辑
            </NuxtLink>
          </div>
        </div>
      </aside>
    </section>
  </div>

  <div v-else class="mx-auto max-w-4xl rounded-lg border border-gray-100 bg-gray-50 p-10 text-center text-gray-500">
    当前文章不存在或尚未加载完成。
  </div>
</template>