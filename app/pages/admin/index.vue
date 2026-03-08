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
  },
  {
    label: '草稿数量',
    value: String(data.value?.stats.draft ?? 0),
    change: `${data.value?.stats.review ?? 0} 篇待审核`,
  },
  {
    label: '累计访问',
    value: `${(((data.value?.list ?? []).reduce((sum, article) => sum + article.views, 0)) / 1000).toFixed(1)}k`,
    change: `${(data.value?.list ?? []).filter((article) => article.featured).length} 篇精选文章`,
  },
  {
    label: '分类数量',
    value: String(Math.max(0, (data.value?.categories?.length ?? 1) - 1)),
    change: '文章数据来自 SQLite 数据库',
  },
])

const publishingPipeline = [
  {
    title: '技术专栏更新',
    detail: '3 篇文章待排期，建议本周内完成封面与摘要。',
    status: '进行中',
  },
  {
    title: '首页推荐内容调整',
    detail: '需要补充 2 篇高质量文章用于首页精选位。',
    status: '待处理',
  },
  {
    title: '文章标签体系整理',
    detail: '当前标签数量偏多，建议后续接入分类与标签管理。',
    status: '规划中',
  },
]

const recentActivities = computed(() =>
  (data.value?.list ?? [])
    .slice(0, 4)
    .map((article) => `《${article.title}》最近更新于 ${article.updatedAt}`),
)

const topArticles = computed(() =>
  [...(data.value?.list ?? [])]
    .sort((left, right) => right.views - left.views)
    .slice(0, 3),
)
</script>

<template>
  <div class="space-y-8 m-20">
    <section class="rounded-[2rem] border border-slate-200 bg-white px-8 py-8 shadow-sm">
      <div class="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p class="text-sm uppercase tracking-[0.3em] text-sky-700">Dashboard</p>
          <h2 class="mt-3 text-3xl font-semibold text-slate-950">内容总览</h2>
          <p class="mt-4 max-w-2xl text-sm leading-7 text-slate-600">
            在这里快速查看文章数量、发布状态、阅读表现与近期更新，帮助你掌握当前内容库的整体情况。
          </p>
        </div>

        <div class="flex flex-wrap gap-3">
          <NuxtLink
            to="/admin/articles"
            class="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:text-slate-950"
          >
            查看文章列表
          </NuxtLink>
          <NuxtLink
            to="/admin/articles/create"
            class="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            新建文章
          </NuxtLink>
        </div>
      </div>
    </section>

    <section class="grid gap-5 xl:grid-cols-4 md:grid-cols-2">
      <article
        v-for="card in overviewCards"
        :key="card.label"
        class="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm"
      >
        <p class="text-sm text-slate-500">{{ card.label }}</p>
        <p class="mt-4 text-3xl font-semibold text-slate-950">{{ card.value }}</p>
        <p class="mt-3 text-sm text-sky-700">{{ card.change }}</p>
      </article>
    </section>

    <section class="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
      <article class="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div class="flex items-center justify-between gap-4">
          <div>
            <p class="text-sm text-slate-500">内容流转</p>
            <h3 class="mt-2 text-xl font-semibold text-slate-950">内容规划重点</h3>
          </div>
          <span class="rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-500">编辑建议</span>
        </div>

        <div class="mt-6 space-y-4">
          <article
            v-for="item in publishingPipeline"
            :key="item.title"
            class="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5"
          >
            <div class="flex items-center justify-between gap-3">
              <h4 class="text-base font-semibold text-slate-900">{{ item.title }}</h4>
              <span class="rounded-full bg-cyan-500/10 px-3 py-1 text-xs text-cyan-700">{{ item.status }}</span>
            </div>
            <p class="mt-3 text-sm leading-7 text-slate-500">{{ item.detail }}</p>
          </article>
        </div>
      </article>

      <article class="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <p class="text-sm text-slate-500">热门文章</p>
        <h3 class="mt-2 text-xl font-semibold text-slate-950">当前阅读表现较好的内容</h3>

        <div class="mt-6 space-y-4">
          <article
            v-for="article in topArticles"
            :key="article.slug"
            class="rounded-[1.25rem] border border-slate-200 bg-slate-50 px-4 py-4"
          >
            <p class="text-sm font-medium leading-7 text-slate-900">{{ article.title }}</p>
            <div class="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500">
              <span>{{ article.category }}</span>
              <span>{{ article.updatedAt }}</span>
              <span>{{ article.views }} 浏览</span>
            </div>
          </article>
        </div>
      </article>
    </section>

    <section class="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
      <div class="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p class="text-sm text-slate-500">最近动态</p>
          <h3 class="mt-2 text-xl font-semibold text-slate-950">内容更新记录</h3>
        </div>
        <NuxtLink to="/admin/articles" class="text-sm font-medium text-sky-700 transition hover:text-sky-800">
          进入文章管理
        </NuxtLink>
      </div>

      <div class="mt-6 grid gap-4 md:grid-cols-2">
        <div
          v-for="activity in recentActivities"
          :key="activity"
          class="rounded-[1.25rem] border border-slate-200 bg-stone-50 px-4 py-4 text-sm leading-7 text-slate-600"
        >
          {{ activity }}
        </div>
      </div>
    </section>
  </div>
</template>