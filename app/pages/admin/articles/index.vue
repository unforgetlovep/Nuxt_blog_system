<script setup lang="ts">
import type { BlogArticle } from '~~/shared/types/article'

definePageMeta({
  layout: 'admin',
})

const activeCategory = ref('全部')
const searchKeyword = ref('')
const sortValue = ref('updatedAt')

const query = computed(() => ({
  category: activeCategory.value,
  search: searchKeyword.value,
  sort: sortValue.value,
}))

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

const { data, pending } = await useFetch<ArticlesResponse>('/api/posts', {
  query,
})

const articleStats = computed(() => [
  {
    label: '全部文章',
    value: String(data.value?.stats.total ?? 0),
    description: '当前内容库中的全部文章数量',
  },
  {
    label: '已发布',
    value: String(data.value?.stats.published ?? 0),
    description: '已经在前台展示的内容',
  },
  {
    label: '草稿 / 待审核',
    value: String((data.value?.stats.draft ?? 0) + (data.value?.stats.review ?? 0)),
    description: '仍在编辑或等待发布确认',
  },
])

const filterTabs = computed(() => data.value?.categories ?? ['全部'])
const articleList = computed(() => data.value?.list ?? [])
</script>

<template>
  <div class="space-y-8 m-20">
    <section class="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
      <div>
        <p class="text-sm uppercase tracking-[0.3em] text-sky-700">Articles</p>
        <h2 class="mt-2 text-3xl font-semibold text-slate-950">文章管理</h2>
        <p class="mt-3 max-w-2xl text-sm leading-7 text-slate-500">
          在这里可以按分类和关键词快速定位文章，查看状态、预览前台页面，并继续进入编辑流程。
        </p>
      </div>

      <NuxtLink
        to="/admin/articles/create"
        class="inline-flex w-fit items-center rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
      >
        创建新文章
      </NuxtLink>
    </section>

    <section class="grid gap-5 md:grid-cols-3">
      <article
        v-for="stat in articleStats"
        :key="stat.label"
        class="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm"
      >
        <p class="text-sm text-slate-500">{{ stat.label }}</p>
        <p class="mt-4 text-3xl font-semibold text-slate-950">{{ stat.value }}</p>
        <p class="mt-3 text-sm leading-7 text-slate-500">{{ stat.description }}</p>
      </article>
    </section>

    <section class="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
      <div class="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div class="flex flex-wrap gap-3">
          <button
            v-for="tab in filterTabs"
            :key="tab"
            type="button"
            @click="activeCategory = tab"
            :class="[
              'rounded-full px-4 py-2 text-sm transition',
              tab === activeCategory
                ? 'bg-slate-950 text-white'
                : 'bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700',
            ]"
          >
            {{ tab }}
          </button>
        </div>

        <div class="grid gap-3 md:grid-cols-[240px_160px]">
          <input
            v-model="searchKeyword"
            type="text"
            placeholder="搜索标题 / 标签"
            class="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-cyan-400"
          >
          <select
            v-model="sortValue"
            class="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500 outline-none transition focus:border-cyan-400"
          >
            <option value="updatedAt">最近更新</option>
            <option value="createdAt">发布时间</option>
            <option value="views">访问量</option>
          </select>
        </div>
      </div>

      <div class="mt-6 overflow-hidden rounded-[1.5rem] border border-slate-200">
        <div class="hidden grid-cols-[minmax(0,1.4fr)_140px_120px_120px_140px] gap-4 bg-stone-50 px-6 py-4 text-sm font-medium text-slate-500 md:grid">
          <p>文章信息</p>
          <p>分类</p>
          <p>状态</p>
          <p>作者</p>
          <p>更新时间</p>
        </div>

        <div class="divide-y divide-slate-200">
          <div
            v-if="pending"
            class="bg-white px-6 py-10 text-center text-sm text-slate-500"
          >
            正在加载文章数据...
          </div>

          <article
            v-for="article in articleList"
            :key="article.slug"
            class="grid gap-4 bg-white px-6 py-5 transition hover:bg-stone-50 md:grid-cols-[minmax(0,1.4fr)_140px_120px_120px_140px] md:items-center"
          >
            <div class="min-w-0">
              <div class="flex flex-wrap items-center gap-3">
                <h3 class="text-base font-semibold text-slate-950">{{ article.title }}</h3>
                <NuxtLink
                  :to="`/admin/articles/${article.slug}`"
                  class="rounded-full bg-sky-50 px-3 py-1 text-xs text-sky-700 transition hover:bg-sky-100"
                >
                  编辑
                </NuxtLink>
                <NuxtLink
                  :to="`/posts/${article.slug}`"
                  class="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600 transition hover:bg-slate-200"
                >
                  预览
                </NuxtLink>
              </div>
              <p class="mt-2 text-sm leading-7 text-slate-500">{{ article.summary }}</p>
            </div>
            <p class="text-sm text-slate-600">{{ article.category }}</p>
            <p>
              <span class="rounded-full bg-stone-100 px-3 py-1 text-xs text-slate-600">{{ article.status }}</span>
            </p>
            <p class="text-sm text-slate-600">{{ article.author }}</p>
            <p class="text-sm text-slate-600">{{ article.updatedAt }}</p>
          </article>

          <div
            v-if="!pending && articleList.length === 0"
            class="bg-white px-6 py-10 text-center text-sm text-slate-500"
          >
            没有匹配的文章，可以尝试调整分类或搜索条件。
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
