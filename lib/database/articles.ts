import { and, eq, or, sql } from 'drizzle-orm'
import type { InferInsertModel, InferSelectModel } from 'drizzle-orm'
import { createError } from 'h3'
import type { BlogArticle } from '~~/shared/types/article'
import { db, initializeDatabase } from './client'
import { articles } from './schema'

type ArticleRow = InferSelectModel<typeof articles>
type NewArticleRow = InferInsertModel<typeof articles>

interface ArticleQuery {
  category?: string
  status?: string
  search?: string
  sort?: 'updatedAt' | 'createdAt' | 'views'
}

interface AuthorArticleQuery {
  status?: string
  search?: string
  sort?: 'updatedAt' | 'createdAt' | 'views'
}

const parseTags = (value: string) => {
  try {
    return JSON.parse(value) as string[]
  } catch {
    return []
  }
}

const toBlogArticle = (row: ArticleRow): BlogArticle => ({
  id: row.id,
  slug: row.slug,
  title: row.title,
  summary: row.summary,
  category: row.category,
  status: row.status as BlogArticle['status'],
  author: row.author,
  authorId: row.authorId ?? undefined,
  updatedAt: row.updatedAt,
  createdAt: row.createdAt,
  readTime: row.readTime,
  views: row.views,
  tags: parseTags(row.tags),
  cover: row.cover,
  featured: Boolean(row.featured),
  content: row.content,
})

const toDatabaseArticle = (article: Omit<BlogArticle, 'id'>): NewArticleRow => ({
  slug: article.slug,
  title: article.title,
  summary: article.summary,
  category: article.category,
  status: article.status,
  author: article.author,
  authorId: article.authorId,
  updatedAt: article.updatedAt,
  createdAt: article.createdAt,
  readTime: article.readTime,
  views: article.views,
  tags: JSON.stringify(article.tags),
  cover: article.cover,
  featured: article.featured,
  content: article.content,
})

const createUniqueSlug = async (slug: string, currentSlug?: string) => {
  await initializeDatabase()

  let candidateSlug = slug
  let suffix = 1

  while (true) {
    const [existingArticle] = await db
      .select()
      .from(articles)
      .where(eq(articles.slug, candidateSlug))
      .limit(1)

    if (!existingArticle || existingArticle.slug === currentSlug) {
      return candidateSlug
    }

    suffix += 1
    candidateSlug = `${slug}-${suffix}`
  }
}

export const getArticles = async (query: ArticleQuery & { page?: number; pageSize?: number } = {}) => {
  await initializeDatabase()

  const {
    category = '全部',
    status = '全部',
    search = '',
    sort = 'updatedAt',
    page,
    pageSize,
  } = query

  const trimmedSearch = search.trim()

  const whereConditions: any[] = []

  if (category !== '全部') {
    whereConditions.push(eq(articles.category, category))
  }

  if (status !== '全部') {
    whereConditions.push(eq(articles.status, status))
  }

  // Fuzzy search across title/summary/author/category/tags(text JSON).
  // Note: tags are stored as JSON text; using LIKE is a best-effort match.
  if (trimmedSearch) {
    const normalized = trimmedSearch.toLowerCase()
    const pattern = `%${normalized}%`

    whereConditions.push(
      or(
        sql`LOWER(${articles.title}) LIKE ${pattern}`,
        sql`LOWER(${articles.summary}) LIKE ${pattern}`,
        sql`LOWER(${articles.author}) LIKE ${pattern}`,
        sql`LOWER(${articles.category}) LIKE ${pattern}`,
        sql`LOWER(${articles.tags}) LIKE ${pattern}`,
      ),
    )
  }

  const whereCondition = whereConditions.length > 0 ? and(...whereConditions) : undefined

  // Pagination total should reflect the same filters as list.
  let filteredTotalQuery = db.select({ count: sql<number>`count(*)` }).from(articles)
  if (whereCondition) {
    filteredTotalQuery = filteredTotalQuery.where(whereCondition)
  }
  const [{ count: filteredTotal }] = await filteredTotalQuery

  // Stats are based on all articles (not filtered by current list filters).
  const [{ count: allTotal }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(articles)

  const [{ count: published }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(articles)
    .where(eq(articles.status, '已发布'))

  const [{ count: draft }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(articles)
    .where(eq(articles.status, '草稿'))

  const [{ count: review }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(articles)
    .where(eq(articles.status, '待审核'))

  const categories = await db
    .select({ category: articles.category })
    .from(articles)
    .groupBy(articles.category)

  const orderExpr =
    sort === 'views'
      ? sql`${articles.views} DESC`
      : sort === 'createdAt'
        ? sql`${articles.createdAt} DESC`
        : sql`${articles.updatedAt} DESC`

  let listQuery = db.select().from(articles).orderBy(orderExpr)
  if (whereCondition) {
    listQuery = listQuery.where(whereCondition)
  }

  if (page && pageSize) {
    const startIndex = (page - 1) * pageSize
    listQuery.limit(pageSize).offset(startIndex)
  }

  const listRows = await listQuery
  const list = listRows.map(toBlogArticle)

  return {
    stats: {
      total: allTotal,
      published,
      draft,
      review,
    },
    categories: ['全部', ...categories.map((row) => row.category)],
    list,
    pagination: {
      total: filteredTotal,
      page,
      pageSize,
      totalPages: Math.ceil(filteredTotal / (pageSize || 1)),
    },
  }
}

export const getArticlesByAuthorId = async (authorId: number, query: AuthorArticleQuery = {}) => {
  await initializeDatabase()

  const {
    status = '全部',
    search = '',
    sort = 'updatedAt',
  } = query

  // First down-push by authorId in SQL to avoid loading all rows.
  let list = (await db
    .select()
    .from(articles)
    .where(eq(articles.authorId, authorId))).map(toBlogArticle)

  if (status !== '全部') {
    list = list.filter((article) => article.status === status)
  }

  if (search.trim()) {
    const normalizedSearch = search.trim().toLowerCase()

    list = list.filter((article) => {
      const content = [
        article.title,
        article.summary,
        article.author,
        article.category,
        article.tags.join(' '),
      ]
        .join(' ')
        .toLowerCase()

      return content.includes(normalizedSearch)
    })
  }

  if (sort === 'views') {
    list.sort((left, right) => right.views - left.views)
  } else if (sort === 'createdAt') {
    list.sort((left, right) => right.createdAt.localeCompare(left.createdAt))
  } else {
    list.sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
  }

  return { list }
}

export const getArticleBySlug = async (slug: string) => {
  await initializeDatabase()

  const [article] = await db
    .select()
    .from(articles)
    .where(eq(articles.slug, slug))
    .limit(1)

  if (!article) {
    return null
  }

  return toBlogArticle(article)
}

export const createArticle = async (article: Omit<BlogArticle, 'id'>) => {
  await initializeDatabase()

  const uniqueSlug = await createUniqueSlug(article.slug)
  const payload = toDatabaseArticle({
    ...article,
    slug: uniqueSlug,
  })

  await db.insert(articles).values(payload)

  const [createdArticle] = await db
    .select()
    .from(articles)
    .where(eq(articles.slug, uniqueSlug))
    .limit(1)

  if (!createdArticle) {
    throw createError({
      statusCode: 500,
      statusMessage: '文章创建失败',
    })
  }

  return toBlogArticle(createdArticle)
}

export const updateArticle = async (slug: string, article: Omit<BlogArticle, 'id'>) => {
  await initializeDatabase()

  const [currentArticle] = await db
    .select()
    .from(articles)
    .where(eq(articles.slug, slug))
    .limit(1)

  if (!currentArticle) {
    throw createError({
      statusCode: 404,
      statusMessage: '文章不存在',
    })
  }

  const uniqueSlug = await createUniqueSlug(article.slug, slug)

  await db
    .update(articles)
    .set(toDatabaseArticle({
      ...article,
      slug: uniqueSlug,
    }))
    .where(eq(articles.slug, slug))

  const [updatedArticle] = await db
    .select()
    .from(articles)
    .where(eq(articles.slug, uniqueSlug))
    .limit(1)

  if (!updatedArticle) {
    throw createError({
      statusCode: 500,
      statusMessage: '文章更新失败',
    })
  }

  return toBlogArticle(updatedArticle)
}

export const deleteArticleBySlug = async (slug: string) => {
  await initializeDatabase()

  await db.delete(articles).where(eq(articles.slug, slug))
}
