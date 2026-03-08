<script setup lang="ts">
import type { BlogArticle } from '~~/shared/types/article'

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
    status: '已发布',
    sort: 'updatedAt',
  },
})

const editorialHighlights = [
  {
    title: '内容优先的版面组织',
    description: '以标题、摘要和阅读路径为核心，减少装饰性元素对信息获取的干扰。',
  },
  {
    title: '更贴近中文阅读习惯',
    description: '控制信息密度与留白比例，让长文和专题内容都能保持舒适节奏。',
  },
  {
    title: '前后台统一的数据来源',
    description: '首页、文章详情和后台列表共享同一套文章接口，阅读与管理保持同步。',
  },
]

const articleList = computed(() => data.value?.list ?? [])
const featuredArticles = computed(() => articleList.value.filter((article) => article.featured).slice(0, 2))
const recentArticles = computed(() => articleList.value.slice(0, 6))
const categories = computed(() => (data.value?.categories ?? []).filter((item) => item !== '全部').slice(0, 4))

const heroMetrics = computed(() => [
  {
    label: '已发布文章',
    value: String(data.value?.stats.published ?? 0),
  },
  {
    label: '精选内容',
    value: String(featuredArticles.value.length),
  },
  {
    label: '内容分类',
    value: String(categories.value.length),
  },
])

const categoryCards = computed(() =>
  categories.value.map((category) => ({
    name: category,
    count: articleList.value.filter((article) => article.category === category).length,
    article: articleList.value.find((item) => item.category === category) ?? null,
  })),
)
</script>

<template>
  <div class="space-y-12 m-20">
    <section class="grid gap-8 rounded-[2rem] border border-slate-200 bg-white p-8 shadow-[0_24px_80px_-48px_rgba(15,23,42,0.35)] lg:grid-cols-[minmax(0,1fr)_320px] lg:p-10">
      <div>
        <p class="text-sm font-medium uppercase tracking-[0.28em] text-sky-700">Featured Reading</p>
        <h2 class="mt-4 max-w-3xl text-4xl font-semibold leading-tight text-slate-950 lg:text-5xl">
          把前端实践、内容策略与产品思考，整理成更值得反复阅读的文章。
        </h2>
        <p class="mt-5 max-w-2xl text-base leading-8 text-slate-600">
          这里聚合了前端开发、内容表达与博客系统实践中的关键经验，既保留细节，也强调可复用的方法，适合持续阅读与归档整理。
        </p>

        <div class="mt-8 flex flex-wrap gap-4">
          <a
            href="#latest-posts"
            class="rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            浏览最新文章
          </a>
          <NuxtLink
            to="/admin/articles"
            class="rounded-full border border-slate-200 bg-slate-50 px-6 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-white hover:text-slate-950"
          >
            进入内容后台
          </NuxtLink>
        </div>

        <div class="mt-10 grid gap-4 sm:grid-cols-3">
          <article
            v-for="metric in heroMetrics"
            :key="metric.label"
            class="rounded-[1.5rem] border border-slate-200 bg-stone-50 px-5 py-5"
          >
            <p class="text-sm text-slate-500">{{ metric.label }}</p>
            <p class="mt-3 text-3xl font-semibold text-slate-950">{{ metric.value }}</p>
          </article>
        </div>
      </div>

      <aside class="rounded-[1.75rem] border border-slate-200 bg-stone-50 p-6">
        <p class="text-sm font-medium text-slate-500">本期导读</p>
        <div class="mt-5 space-y-4">
          <article
            v-for="item in editorialHighlights"
            :key="item.title"
            class="rounded-[1.25rem] border border-white bg-white px-4 py-4 shadow-sm"
          >
            <p class="text-base font-semibold text-slate-950">{{ item.title }}</p>
            <p class="mt-2 text-sm leading-7 text-slate-600">{{ item.description }}</p>
          </article>
        </div>
      </aside>
    </section>

    <section class="space-y-5">
      <div class="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p class="text-sm font-medium uppercase tracking-[0.24em] text-slate-500">Editors' Picks</p>
          <h3 class="mt-3 text-3xl font-semibold text-slate-950">精选内容</h3>
          <p class="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
            从已发布文章中挑选更适合深度阅读的主题，兼顾技术细节、表达结构与内容完成度。
          </p>
        </div>
        <NuxtLink to="/admin/articles/create" class="text-sm font-medium text-sky-700 transition hover:text-sky-800">
          新建一篇内容
        </NuxtLink>
      </div>

      <div class="grid gap-5 lg:grid-cols-2">
        <NuxtLink
          v-for="article in featuredArticles"
          :key="article.slug"
          :to="`/posts/${article.slug}`"
          class="group overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
        >
          <img :src="article.cover" :alt="article.title" class="h-56 w-full object-cover transition duration-300 group-hover:scale-[1.02]">
          <div class="p-6">
            <div class="flex flex-wrap items-center gap-3 text-xs">
              <span class="rounded-full bg-slate-100 px-3 py-1 text-slate-600">{{ article.category }}</span>
              <span class="rounded-full bg-sky-50 px-3 py-1 text-sky-700">{{ article.readTime }}</span>
              <span class="text-slate-400">{{ article.updatedAt }}</span>
            </div>
            <h4 class="mt-4 text-2xl font-semibold leading-9 text-slate-950">{{ article.title }}</h4>
            <p class="mt-3 text-sm leading-7 text-slate-600">{{ article.summary }}</p>
            <p class="mt-5 text-sm font-medium text-slate-950">继续阅读</p>
          </div>
        </NuxtLink>
      </div>
    </section>

    <section id="latest-posts" class="space-y-5">
      <div class="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p class="text-sm font-medium uppercase tracking-[0.24em] text-slate-500">Latest Posts</p>
          <h3 class="mt-3 text-3xl font-semibold text-slate-950">最近更新</h3>
          <p class="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
            最新发布的内容会优先出现在这里，方便快速浏览近期话题与更新节奏。
          </p>
        </div>
        <NuxtLink to="/admin/articles" class="text-sm font-medium text-sky-700 transition hover:text-sky-800">
          查看全部文章
        </NuxtLink>
      </div>

      <div class="grid gap-5 lg:grid-cols-3">
        <article
          v-for="article in recentArticles"
          :key="article.slug"
          class="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md"
        >
          <div class="flex flex-wrap items-center gap-3 text-xs">
            <span class="rounded-full bg-slate-100 px-3 py-1 text-slate-600">{{ article.category }}</span>
            <span class="text-slate-400">{{ article.updatedAt }}</span>
          </div>
          <h4 class="mt-4 text-xl font-semibold leading-8 text-slate-950">{{ article.title }}</h4>
          <p class="mt-3 text-sm leading-7 text-slate-600">{{ article.summary }}</p>
          <div class="mt-5 flex items-center justify-between">
            <span class="text-sm text-slate-400">{{ article.readTime }}</span>
            <NuxtLink
              :to="`/posts/${article.slug}`"
              class="text-sm font-medium text-slate-950 transition hover:text-sky-700"
            >
              阅读全文
            </NuxtLink>
          </div>
        </article>
      </div>
    </section>

    <section class="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(300px,0.85fr)]">
      <article class="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
        <p class="text-sm font-medium uppercase tracking-[0.24em] text-slate-500">Topics</p>
        <h3 class="mt-3 text-2xl font-semibold text-slate-950">分类速览</h3>
        <div class="mt-6 grid gap-4 sm:grid-cols-2">
          <NuxtLink
            v-for="item in categoryCards"
            :key="item.name"
            :to="item.article ? `/posts/${item.article.slug}` : '/'"
            class="rounded-[1.25rem] border border-slate-200 bg-stone-50 px-5 py-5 transition hover:border-slate-300 hover:bg-white"
          >
            <div class="flex items-center justify-between gap-4">
              <p class="text-base font-semibold text-slate-950">{{ item.name }}</p>
              <span class="rounded-full bg-white px-3 py-1 text-xs text-slate-500">{{ item.count }} 篇</span>
            </div>
            <p class="mt-3 text-sm leading-7 text-slate-600">
              {{ item.article?.title ?? '更多内容整理中，后续会持续补充。' }}
            </p>
          </NuxtLink>
        </div>
      </article>

      <article class="rounded-[1.75rem] border border-slate-200 bg-slate-950 p-6 text-white shadow-sm">
        <p class="text-sm font-medium uppercase tracking-[0.24em] text-slate-400">Reading Note</p>
        <h3 class="mt-3 text-2xl font-semibold">关于这个内容站</h3>
        <p class="mt-4 text-sm leading-7 text-slate-300">
          前台负责把内容展示得更清楚，后台则负责维护文章、标签、封面和发布状态。阅读体验和内容管理使用同一套文章数据，避免展示与维护脱节。
        </p>
        <div class="mt-6 space-y-3">
          <div class="rounded-[1.25rem] border border-white/10 bg-white/5 px-4 py-4 text-sm leading-7 text-slate-300">
            文章详情页支持 Markdown 渲染，适合沉淀教程、复盘和专题写作。
          </div>
          <div class="rounded-[1.25rem] border border-white/10 bg-white/5 px-4 py-4 text-sm leading-7 text-slate-300">
            后台提供文章创建、编辑、筛选和预览能力，适合内容生产和演示使用。
          </div>
        </div>
      </article>
    </section>
  </div>
</template>