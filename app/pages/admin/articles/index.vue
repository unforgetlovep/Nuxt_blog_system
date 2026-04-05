<script setup lang="ts">
import type { BlogArticle } from '~~/shared/types/article'

definePageMeta({
  layout: 'admin',
})

const activeCategory = ref('全部')
const searchKeyword = ref('')
const debouncedSearchKeyword = ref('')
const sortValue = ref('updatedAt')
const page = ref(1)
const pageSize = ref(10)

let searchDebounceTimer: ReturnType<typeof setTimeout> | undefined

const query = computed(() => ({
  category: activeCategory.value === '全部' ? undefined : activeCategory.value,
  search: debouncedSearchKeyword.value,
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

const { data, pending, refresh } = await useFetch<ArticlesResponse>('/api/posts', {
  query,
})

watch([activeCategory, sortValue], () => {
  page.value = 1
})

watch(searchKeyword, (next) => {
  if (searchDebounceTimer) {
    clearTimeout(searchDebounceTimer)
  }

  searchDebounceTimer = setTimeout(() => {
    debouncedSearchKeyword.value = next
    page.value = 1
  }, 350)
})

const clearSearch = () => {
  if (searchDebounceTimer) {
    clearTimeout(searchDebounceTimer)
    searchDebounceTimer = undefined
  }

  searchKeyword.value = ''
  debouncedSearchKeyword.value = ''
  page.value = 1
}

const highlightedTitleParts = (text: string) => {
  const keyword = debouncedSearchKeyword.value.trim()
  if (!keyword) {
    return [{ text, isMatch: false }]
  }

  const keywordLower = keyword.toLowerCase()
  const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const re = new RegExp(`(${escaped})`, 'ig')
  const parts = text.split(re)

  return parts.map((part) => ({
    text: part,
    isMatch: part !== '' && part.toLowerCase() === keywordLower,
  }))
}

const filterTabs = computed(() => data.value?.categories ?? ['全部'])
const articleList = computed(() => data.value?.list ?? [])
const pagination = computed(() => data.value?.pagination)
const statusOptions: BlogArticle['status'][] = ['草稿', '待审核', '已发布']
const selectedSlugs = ref<string[]>([])
const bulkStatus = ref<BlogArticle['status']>('待审核')
const updatingStatusMap = ref<Record<string, boolean>>({})
const deletingMap = ref<Record<string, boolean>>({})
const isBulkUpdating = ref(false)
const operationMessage = ref('')
const operationError = ref('')

const isAllSelected = computed(() => {
  return articleList.value.length > 0 && selectedSlugs.value.length === articleList.value.length
})

const selectedArticles = computed(() =>
  articleList.value.filter((article) => selectedSlugs.value.includes(article.slug)),
)

watch(articleList, () => {
  const availableSlugs = new Set(articleList.value.map((article) => article.slug))
  selectedSlugs.value = selectedSlugs.value.filter((slug) => availableSlugs.has(slug))
})

const clearOperationMessage = () => {
  operationMessage.value = ''
  operationError.value = ''
}

const setRowUpdating = (slug: string, isUpdating: boolean) => {
  updatingStatusMap.value = {
    ...updatingStatusMap.value,
    [slug]: isUpdating,
  }
}

const setRowDeleting = (slug: string, isDeleting: boolean) => {
  deletingMap.value = {
    ...deletingMap.value,
    [slug]: isDeleting,
  }
}

const toggleSelectAll = (checked: boolean) => {
  selectedSlugs.value = checked ? articleList.value.map((article) => article.slug) : []
}

const handleStatusChange = async (article: BlogArticle, nextStatus: BlogArticle['status']) => {
  if (article.status === nextStatus) return

  const previousStatus = article.status
  article.status = nextStatus
  setRowUpdating(article.slug, true)
  clearOperationMessage()

  try {
    const { id, ...payload } = article
    const now = new Date().toISOString().slice(0, 10)

    await $fetch(`/api/posts/${encodeURIComponent(article.slug)}`, {
      method: 'PUT',
      body: {
        ...payload,
        status: nextStatus,
        updatedAt: now,
      },
    })

    article.updatedAt = now
    operationMessage.value = `《${article.title}》状态已更新为「${nextStatus}」`
  } catch (error: any) {
    article.status = previousStatus
    operationError.value = error?.data?.statusMessage || error?.message || '状态更新失败，请稍后重试'
  } finally {
    setRowUpdating(article.slug, false)
  }
}

const handleBulkStatusUpdate = async () => {
  if (selectedArticles.value.length === 0) {
    operationError.value = '请先选择要批量更新的文章'
    operationMessage.value = ''
    return
  }

  isBulkUpdating.value = true
  clearOperationMessage()

  let successCount = 0
  let failCount = 0

  for (const article of selectedArticles.value) {
    if (article.status === bulkStatus.value) continue

    const previousStatus = article.status
    article.status = bulkStatus.value
    setRowUpdating(article.slug, true)

    try {
      const { id, ...payload } = article
      const now = new Date().toISOString().slice(0, 10)
      await $fetch(`/api/posts/${encodeURIComponent(article.slug)}`, {
        method: 'PUT',
        body: {
          ...payload,
          status: bulkStatus.value,
          updatedAt: now,
        },
      })
      article.updatedAt = now
      successCount += 1
    } catch {
      article.status = previousStatus
      failCount += 1
    } finally {
      setRowUpdating(article.slug, false)
    }
  }

  if (successCount > 0) {
    operationMessage.value = `批量更新完成：成功 ${successCount} 篇${failCount > 0 ? `，失败 ${failCount} 篇` : ''}`
  }

  if (failCount > 0 && successCount === 0) {
    operationError.value = '批量更新失败，请稍后重试'
  } else if (failCount > 0) {
    operationError.value = `部分文章更新失败（${failCount} 篇）`
  }

  isBulkUpdating.value = false
}

const handleDeleteArticle = async (article: BlogArticle) => {
  const confirmed = window.confirm(`确认删除《${article.title}》吗？此操作不可撤销。`)
  if (!confirmed) return

  clearOperationMessage()
  setRowDeleting(article.slug, true)

  try {
    await $fetch(`/api/posts/${encodeURIComponent(article.slug)}`, {
      method: 'DELETE',
    })
    selectedSlugs.value = selectedSlugs.value.filter((slug) => slug !== article.slug)
    await refresh()
    operationMessage.value = `《${article.title}》已删除`
  } catch (error: any) {
    operationError.value = error?.data?.statusMessage || error?.message || '删除失败，请稍后重试'
  } finally {
    setRowDeleting(article.slug, false)
  }
}

const handleBulkDelete = async () => {
  if (selectedArticles.value.length === 0) {
    operationError.value = '请先选择要删除的文章'
    operationMessage.value = ''
    return
  }

  const confirmed = window.confirm(`确认批量删除已选的 ${selectedArticles.value.length} 篇文章吗？此操作不可撤销。`)
  if (!confirmed) return

  isBulkUpdating.value = true
  clearOperationMessage()

  let successCount = 0
  let failCount = 0

  for (const article of selectedArticles.value) {
    setRowDeleting(article.slug, true)
    try {
      await $fetch(`/api/posts/${encodeURIComponent(article.slug)}`, {
        method: 'DELETE',
      })
      successCount += 1
    } catch {
      failCount += 1
    } finally {
      setRowDeleting(article.slug, false)
    }
  }

  if (successCount > 0) {
    operationMessage.value = `批量删除完成：成功 ${successCount} 篇${failCount > 0 ? `，失败 ${failCount} 篇` : ''}`
  }

  if (failCount > 0 && successCount === 0) {
    operationError.value = '批量删除失败，请稍后重试'
  } else if (failCount > 0) {
    operationError.value = `部分文章删除失败（${failCount} 篇）`
  }

  selectedSlugs.value = []
  await refresh()
  isBulkUpdating.value = false
}

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
    <div v-if="operationMessage || operationError" class="space-y-2">
      <p v-if="operationMessage" class="rounded border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
        {{ operationMessage }}
      </p>
      <p v-if="operationError" class="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
        {{ operationError }}
      </p>
    </div>

    <!-- Filters & List Card -->
    <div class="bg-white rounded border border-gray-200 shadow-sm overflow-hidden flex flex-col">
      <!-- Toolbar -->
      <div class="p-4 border-b border-gray-200 bg-gray-50 flex flex-col gap-4">
        <!-- Category Tabs -->
        <div class="flex flex-wrap items-center gap-2 lg:justify-between">
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
          <div class="flex items-center gap-2">
            <span class="text-xs text-gray-500">已选 {{ selectedSlugs.length }} 篇</span>
            <select
              v-model="bulkStatus"
              :disabled="isBulkUpdating || selectedSlugs.length === 0"
              class="rounded border border-gray-300 bg-white px-2.5 py-1.5 text-xs text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
            >
              <option v-for="status in statusOptions" :key="status" :value="status">{{ status }}</option>
            </select>
            <button
              type="button"
              :disabled="isBulkUpdating || selectedSlugs.length === 0"
              class="rounded border border-blue-300 bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              @click="handleBulkStatusUpdate"
            >
              {{ isBulkUpdating ? '批量更新中...' : '批量改状态' }}
            </button>
            <button
              type="button"
              :disabled="isBulkUpdating || selectedSlugs.length === 0"
              class="rounded border border-red-300 bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              @click="handleBulkDelete"
            >
              {{ isBulkUpdating ? '批量处理中...' : '批量删除' }}
            </button>
          </div>
        </div>

        <!-- Search & Sort -->
        <div class="flex flex-col sm:flex-row gap-3">
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
               <svg class="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
               </svg>
            </div>
                <button
                  v-if="searchKeyword"
                  type="button"
                  class="absolute inset-y-0 right-0 pr-3 flex items-center text-xs font-medium text-gray-400 hover:text-gray-600"
                  @click="clearSearch"
                >
                  清除
                </button>
            <input
              v-model="searchKeyword"
              type="text"
              placeholder="搜索文章..."
                  class="w-full sm:w-64 rounded border border-gray-300 bg-white pl-9 pr-10 py-1.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
              <th class="px-4 py-3 w-10">
                <input
                  type="checkbox"
                  :checked="isAllSelected"
                  @change="toggleSelectAll(($event.target as HTMLInputElement).checked)"
                >
              </th>
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
              <td colspan="7" class="px-6 py-10 text-center text-gray-500">正在加载文章数据...</td>
            </tr>
            <tr v-else-if="articleList.length === 0">
              <td colspan="7" class="px-6 py-10 text-center text-gray-500">没有匹配的文章，请尝试调整筛选条件。</td>
            </tr>
            <tr v-for="article in articleList" :key="article.slug" class="hover:bg-gray-50 transition">
              <td class="px-4 py-4">
                <input
                  v-model="selectedSlugs"
                  type="checkbox"
                  :value="article.slug"
                >
              </td>
              <td class="px-6 py-4">
                <div class="flex flex-col max-w-[300px] lg:max-w-[400px]">
                  <span class="font-medium text-gray-900 truncate" :title="article.title">
                    <template v-for="(part, idx) in highlightedTitleParts(article.title)" :key="idx">
                      <mark
                        v-if="part.isMatch"
                        class="bg-yellow-200 text-red-700 px-0.5 rounded"
                      >{{ part.text }}</mark>
                      <template v-else>{{ part.text }}</template>
                    </template>
                  </span>
                  <span class="text-xs text-gray-500 mt-1 truncate">{{ article.summary }}</span>
                </div>
              </td>
              <td class="px-6 py-4">
                <span class="text-gray-600">{{ article.category }}</span>
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center gap-2">
                  <select
                    :value="article.status"
                    :disabled="!!updatingStatusMap[article.slug] || isBulkUpdating"
                    :class="[
                      'rounded border px-2 py-1 text-xs font-medium focus:outline-none focus:ring-1',
                      getStatusClass(article.status),
                      updatingStatusMap[article.slug] ? 'cursor-not-allowed opacity-70' : 'cursor-pointer',
                    ]"
                    @change="handleStatusChange(article, ($event.target as HTMLSelectElement).value as BlogArticle['status'])"
                  >
                    <option v-for="status in statusOptions" :key="status" :value="status">
                      {{ status }}
                    </option>
                  </select>
                  <span v-if="updatingStatusMap[article.slug]" class="text-xs text-gray-400">更新中...</span>
                </div>
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
                  <span class="text-gray-300">|</span>
                  <button
                    type="button"
                    :disabled="!!deletingMap[article.slug]"
                    class="font-medium text-red-600 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                    @click="handleDeleteArticle(article)"
                  >
                    {{ deletingMap[article.slug] ? '删除中...' : '删除' }}
                  </button>
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
