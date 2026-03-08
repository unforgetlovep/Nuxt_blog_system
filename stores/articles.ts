import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'
import { mockArticles } from '~~/shared/data/articles'
import type { BlogArticle, ArticleStatus } from '~~/shared/types/article'

interface ArticleQuery {
  category?: string
  status?: ArticleStatus | '全部'
  search?: string
  sort?: 'updatedAt' | 'createdAt' | 'views'
}

const STORAGE_KEY = 'blog-system:articles'

const cloneArticles = (articles: BlogArticle[]) =>
  articles.map((article) => ({
    ...article,
    tags: [...article.tags],
  }))

const defaultArticles = cloneArticles(mockArticles)

export const useArticlesStore = defineStore('articles', () => {
  const articles = ref<BlogArticle[]>(defaultArticles)
  const hasHydrated = ref(false)

  const hydrate = () => {
    if (!import.meta.client || hasHydrated.value) {
      return
    }

    const rawArticles = localStorage.getItem(STORAGE_KEY)

    if (rawArticles) {
      try {
        articles.value = cloneArticles(JSON.parse(rawArticles) as BlogArticle[])
      } catch {
        localStorage.removeItem(STORAGE_KEY)
        articles.value = cloneArticles(mockArticles)
      }
    }

    hasHydrated.value = true
  }

  const persist = () => {
    if (!import.meta.client) {
      return
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(articles.value))
  }

  const categories = computed(() => [
    '全部',
    ...new Set(articles.value.map((article) => article.category)),
  ])

  const stats = computed(() => ({
    total: articles.value.length,
    published: articles.value.filter((article) => article.status === '已发布').length,
    draft: articles.value.filter((article) => article.status === '草稿').length,
    review: articles.value.filter((article) => article.status === '待审核').length,
    featured: articles.value.filter((article) => article.featured).length,
    totalViews: articles.value.reduce((sum, article) => sum + article.views, 0),
  }))

  const publishedArticles = computed(() =>
    articles.value.filter((article) => article.status === '已发布'),
  )

  const featuredArticles = computed(() =>
    publishedArticles.value.filter((article) => article.featured),
  )

  const getArticleBySlug = (slug: string) =>
    articles.value.find((article) => article.slug === slug) ?? null

  const getFilteredArticles = (query: ArticleQuery = {}) => {
    const {
      category = '全部',
      status = '全部',
      search = '',
      sort = 'updatedAt',
    } = query

    let filteredArticles = [...articles.value]

    if (category !== '全部') {
      filteredArticles = filteredArticles.filter((article) => article.category === category)
    }

    if (status !== '全部') {
      filteredArticles = filteredArticles.filter((article) => article.status === status)
    }

    if (search.trim()) {
      const normalizedSearch = search.trim().toLowerCase()

      filteredArticles = filteredArticles.filter((article) => {
        const searchContent = [
          article.title,
          article.summary,
          article.author,
          article.category,
          article.tags.join(' '),
        ]
          .join(' ')
          .toLowerCase()

        return searchContent.includes(normalizedSearch)
      })
    }

    if (sort === 'views') {
      filteredArticles.sort((left, right) => right.views - left.views)
    } else if (sort === 'createdAt') {
      filteredArticles.sort((left, right) => right.createdAt.localeCompare(left.createdAt))
    } else {
      filteredArticles.sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
    }

    return filteredArticles
  }

  const saveArticle = (article: BlogArticle, originalSlug?: string | null) => {
    const normalizedArticle: BlogArticle = {
      ...article,
      tags: [...article.tags],
    }

    const targetSlug = originalSlug || normalizedArticle.slug
    const targetIndex = articles.value.findIndex((item) => item.slug === targetSlug)

    if (targetIndex >= 0) {
      articles.value[targetIndex] = {
        ...normalizedArticle,
        id: articles.value[targetIndex].id,
      }
    } else {
      const nextId = Math.max(0, ...articles.value.map((item) => item.id)) + 1

      articles.value.unshift({
        ...normalizedArticle,
        id: nextId,
      })
    }

    persist()

    return normalizedArticle
  }

  const deleteArticle = (slug: string) => {
    articles.value = articles.value.filter((article) => article.slug !== slug)
    persist()
  }

  if (import.meta.client) {
    hydrate()

    watch(
      articles,
      () => {
        persist()
      },
      { deep: true },
    )
  }

  return {
    articles,
    categories,
    stats,
    publishedArticles,
    featuredArticles,
    hydrate,
    getArticleBySlug,
    getFilteredArticles,
    saveArticle,
    deleteArticle,
  }
})
