import { createError } from 'h3'
import type { BlogArticle } from '~~/shared/types/article'
import { deleteArticleBySlug, getArticleBySlug, updateArticle } from '~~/lib/database/articles'

export default defineEventHandler(async (event) => {
  const rawSlug = getRouterParam(event, 'slug')
  const slug = rawSlug ? decodeURIComponent(rawSlug) : ''

  if (!slug) {
    throw createError({
      statusCode: 400,
      
      statusMessage: '文章标识不能为空',
    })
  }

  if (event.method === 'PUT') {
    const body = await readBody<Omit<BlogArticle, 'id'>>(event)

    return {
      article: await updateArticle(slug, body),
    }
  }

  if (event.method === 'DELETE') {
    await deleteArticleBySlug(slug)

    return {
      success: true,
    }
  }

  const article = await getArticleBySlug(slug)

  if (!article) {
    throw createError({
      statusCode: 404,
      statusMessage: '文章不存在',
    })
  }

  return {
    article,
  }
})
