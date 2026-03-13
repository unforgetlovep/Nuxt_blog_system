<script setup lang="ts">
import type { BlogArticle } from '~~/shared/types/article'

definePageMeta({
  layout: 'admin',
})

const activeCategory = ref('全部')
const searchKeyword = ref('')
const sortValue = ref('updatedAt')
const page = ref(1)
const pageSize = ref(10)

const query = computed(() => ({
  category: activeCategory.value === '全部' ? undefined : activeCategory.value,
  search: searchKeyword.value,
  sort: sortValue.value,
  page: page.value,
  pageSize: pageSize.value,
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
  pagination?: {
    total: number
    page: number
    pageSize: number
    totalPages: number
  }
}

const { data, pending } = await useFetch<ArticlesResponse>('/api/posts', {
  query,
})

watch([activeCategory, searchKeyword, sortValue], () => {
  page.value = 1
})

const filterTabs = computed(() => data.value?.categories ?? ['全部'])
const articleList = computed(() => data.value?.list ?? [])
const pagination = computed(() => data.value?.pagination)

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
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 class="text-xl font-semibold text-gray-900">文章管理</h2>
        <p class="mt-1 text-sm text-gray-500">
          管理系统中的所有文章，支持多维度筛选和检索。
        </p>
      </div>
      <div class="mt-4 sm:mt-0">
        <NuxtLink
          to="/admin/articles/create"
          class="inline-flex items-center justify-center rounded px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition shadow-sm"
        >
          <svg class="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          新建文章
        </NuxtLink>
      </div>
    </div>

    <!-- Filters & List Card -->
    <div class="bg-white rounded border border-gray-200 shadow-sm overflow-hidden flex flex-col">
      <!-- Toolbar -->
      <div class="p-4 border-b border-gray-200 bg-gray-50 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <!-- Category Tabs -->
        <div class="flex flex-wrap gap-2">
          <button
            v-for="tab in filterTabs"
            :key="tab"
            type="button"
            @click="activeCategory = tab"
            :class="[
              'rounded px-3 py-1.5 text-sm font-medium transition border',
              tab === activeCategory
                ? 'bg-white border-gray-300 text-blue-600 shadow-sm'
                : 'bg-transparent border-transparent text-gray-600 hover:bg-gray-200',
            ]"
          >
            {{ tab }}
          </button>
        </div>

        <!-- Search & Sort -->
        <div class="flex flex-col sm:flex-row gap-3">
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
               <svg class="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
               </svg>
            </div>
            <input
              v-model="searchKeyword"
              type="text"
              placeholder="搜索文章..."
              class="w-full sm:w-64 rounded border border-gray-300 bg-white pl-9 pr-3 py-1.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
          </div>
          <select
            v-model="sortValue"
            class="rounded border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="updatedAt">最近更新</option>
            <option value="createdAt">发布时间</option>
            <option value="views">访问量</option>
          </select>
        </div>
      </div>

      <!-- Table -->
      <div class="overflow-x-auto min-h-[400px]">
        <table class="w-full text-left text-sm whitespace-nowrap">
          <thead class="bg-gray-50 text-gray-500 border-b border-gray-200 font-medium">
            <tr>
              <th class="px-6 py-3">文章标题</th>
              <th class="px-6 py-3">分类</th>
              <th class="px-6 py-3">状态</th>
              <th class="px-6 py-3">作者</th>
              <th class="px-6 py-3">更新时间</th>
              <th class="px-6 py-3 text-right">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-if="pending">
              <td colspan="6" class="px-6 py-10 text-center text-gray-500">正在加载文章数据...</td>
            </tr>
            <tr v-else-if="articleList.length === 0">
              <td colspan="6" class="px-6 py-10 text-center text-gray-500">没有匹配的文章，请尝试调整筛选条件。</td>
            </tr>
            <tr v-for="article in articleList" :key="article.slug" class="hover:bg-gray-50 transition">
              <td class="px-6 py-4">
                <div class="flex flex-col max-w-[300px] lg:max-w-[400px]">
                  <span class="font-medium text-gray-900 truncate" :title="article.title">{{ article.title }}</span>
                  <span class="text-xs text-gray-500 mt-1 truncate">{{ article.summary }}</span>
                </div>
              </td>
              <td class="px-6 py-4">
                <span class="text-gray-600">{{ article.category }}</span>
              </td>
              <td class="px-6 py-4">
                <span :class="['px-2.5 py-1 rounded text-xs font-medium', getStatusClass(article.status)]">
                  {{ article.status }}
                </span>
              </td>
              <td class="px-6 py-4 text-gray-600">{{ article.author }}</td>
              <td class="px-6 py-4 text-gray-500 text-xs">{{ article.updatedAt }}</td>
              <td class="px-6 py-4 text-right">
                <div class="flex items-center justify-end gap-2">
                  <NuxtLink
                    :to="`/admin/articles/${article.slug}`"
                    class="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    编辑
                  </NuxtLink>
                  <span class="text-gray-300">|</span>
                  <NuxtLink
                    :to="`/posts/${article.slug}`"
                    class="text-gray-600 hover:text-gray-900 font-medium"
                    target="_blank"
                  >
                    预览
                  </NuxtLink>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <!-- Pagination Placeholder -->
      <div class="p-4 border-t border-gray-200 bg-white flex justify-between items-center text-sm text-gray-500">
        <span>共 {{ pagination?.total ?? articleList.length }} 条记录</span>
        <div class="flex gap-1">
          <button 
            @click="page > 1 && page--" 
            :disabled="page <= 1"
            class="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
          >
            上一页
          </button>
          <button 
            @click="pagination && page < pagination.totalPages && page++" 
            :disabled="!pagination || page >= pagination.totalPages"
            class="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
          >
            下一页
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
