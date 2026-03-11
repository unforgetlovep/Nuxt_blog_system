<script setup lang="ts">
import type { BlogArticle } from '~~/shared/types/article'

definePageMeta({
  layout: 'admin',
})

interface ArticlesResponse {
  stats: {
    total: number
    published: number
    draft: number
    review: number
  }
  categories: string[]
  list: BlogArticle[]
}

const { data } = await useFetch<ArticlesResponse>('/api/posts', {
  query: {
    sort: 'updatedAt',
  },
})

const overviewCards = computed(() => [
  {
    label: '文章总数',
    value: String(data.value?.stats.total ?? 0),
    change: `${data.value?.stats.published ?? 0} 篇已发布`,
    color: 'text-blue-600',
  },
  {
    label: '草稿数量',
    value: String(data.value?.stats.draft ?? 0),
    change: `${data.value?.stats.review ?? 0} 篇待审核`,
    color: 'text-yellow-600',
  },
  {
    label: '累计访问',
    value: `${(((data.value?.list ?? []).reduce((sum, article) => sum + article.views, 0)) / 1000).toFixed(1)}k`,
    change: `${(data.value?.list ?? []).filter((article) => article.featured).length} 篇精选文章`,
    color: 'text-green-600',
  },
  {
    label: '分类数量',
    value: String(Math.max(0, (data.value?.categories?.length ?? 1) - 1)),
    change: '来自 SQLite 数据库',
    color: 'text-purple-600',
  },
])

const publishingPipeline = [
  {
    title: '硬件评测专栏更新',
    detail: '3 篇桌面外设文章待排期，建议本周内完成封面与摘要。',
    status: '进行中',
    statusClass: 'bg-blue-100 text-blue-700',
  },
  {
    title: '首页精选内容调整',
    detail: '需要补充 2 篇高质量生活方式文章用于首页精选位。',
    status: '待处理',
    statusClass: 'bg-yellow-100 text-yellow-700',
  },
  {
    title: '效率工具标签整理',
    detail: '当前“知识管理”标签下文章偏多，建议后续细分。',
    status: '规划中',
    statusClass: 'bg-gray-100 text-gray-700',
  },
]

const recentActivities = computed(() =>
  (data.value?.list ?? [])
    .slice(0, 5)
    .map((article) => `更新了文章《${article.title}》 (${article.updatedAt})`),
)

const topArticles = computed(() =>
  [...(data.value?.list ?? [])]
    .sort((left, right) => right.views - left.views)
    .slice(0, 5),
)
</script>

<template>
  <div class="space-y-6">
    <!-- Header Actions -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-white p-5 rounded border border-gray-200 shadow-sm">
      <div>
        <h2 class="text-lg font-semibold text-gray-900">欢迎回来，Admin</h2>
        <p class="mt-1 text-sm text-gray-500">
          这是你的内容数据总览。可以在这里快速查看文章数量、发布状态与阅读表现。
        </p>
      </div>
      <div class="mt-4 sm:mt-0 flex gap-3">
        <NuxtLink
          to="/admin/articles"
          class="rounded px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition"
        >
          文章列表
        </NuxtLink>
        <NuxtLink
          to="/admin/articles/create"
          class="rounded px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition shadow-sm"
        >
          新建文章
        </NuxtLink>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      <div
        v-for="card in overviewCards"
        :key="card.label"
        class="bg-white p-5 rounded border border-gray-200 shadow-sm flex flex-col"
      >
        <p class="text-sm text-gray-500 font-medium">{{ card.label }}</p>
        <div class="mt-2 flex items-baseline gap-2">
          <p class="text-2xl font-bold text-gray-900">{{ card.value }}</p>
        </div>
        <p :class="['mt-2 text-xs font-medium', card.color]">{{ card.change }}</p>
      </div>
    </div>

    <!-- Main Grid -->
    <div class="grid gap-6 lg:grid-cols-2">
      <!-- Top Articles -->
      <div class="bg-white rounded border border-gray-200 shadow-sm flex flex-col">
        <div class="p-4 border-b border-gray-200 flex justify-between items-center">
          <h3 class="text-base font-semibold text-gray-900">热门文章 (Top 5)</h3>
        </div>
        <div class="p-0">
          <table class="w-full text-left text-sm whitespace-nowrap">
            <thead class="bg-gray-50 text-gray-600 border-b border-gray-200">
              <tr>
                <th class="px-4 py-3 font-medium">标题</th>
                <th class="px-4 py-3 font-medium">分类</th>
                <th class="px-4 py-3 font-medium text-right">浏览量</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="article in topArticles" :key="article.slug" class="hover:bg-gray-50">
                <td class="px-4 py-3 text-gray-900 truncate max-w-[200px]" :title="article.title">{{ article.title }}</td>
                <td class="px-4 py-3 text-gray-500">{{ article.category }}</td>
                <td class="px-4 py-3 text-gray-500 text-right">{{ article.views }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Pipeline & Activities -->
      <div class="space-y-6">
        <div class="bg-white rounded border border-gray-200 shadow-sm">
          <div class="p-4 border-b border-gray-200">
            <h3 class="text-base font-semibold text-gray-900">内容规划</h3>
          </div>
          <div class="p-4 space-y-4">
            <div
              v-for="item in publishingPipeline"
              :key="item.title"
              class="flex flex-col gap-1 border-b border-gray-100 pb-3 last:border-0 last:pb-0"
            >
              <div class="flex items-center justify-between">
                <h4 class="text-sm font-medium text-gray-900">{{ item.title }}</h4>
                <span :class="['px-2 py-0.5 rounded text-xs', item.statusClass]">
                  {{ item.status }}
                </span>
              </div>
              <p class="text-xs text-gray-500">{{ item.detail }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded border border-gray-200 shadow-sm">
          <div class="p-4 border-b border-gray-200">
            <h3 class="text-base font-semibold text-gray-900">最近动态</h3>
          </div>
          <div class="p-4">
            <ul class="space-y-3">
              <li
                v-for="(activity, index) in recentActivities"
                :key="index"
                class="flex items-start gap-3 text-sm text-gray-600"
              >
                <span class="mt-1.5 h-1.5 w-1.5 rounded-full bg-blue-500 flex-shrink-0"></span>
                <span>{{ activity }}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
