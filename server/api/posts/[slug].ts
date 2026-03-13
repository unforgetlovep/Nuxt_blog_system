import { createError } from 'h3'
import type { BlogArticle } from '~~/shared/types/article'
import { deleteArticleBySlug, getArticleBySlug, updateArticle } from '~~/lib/database/articles'

export default defineEventHandler(async (event) => {
  const rawSlug = getRouterParam(event, 'slug')
  const slug = rawSlug ? decodeURIComponent(rawSlug) : ''
  const user = event.context.user

  if (!slug) {
    throw createError({
      statusCode: 400,
      
      statusMessage: '文章标识不能为空',
    })
  }

  if (event.method === 'PUT') {
    if (!user) {
      throw createError({ statusCode: 401, statusMessage: '未登录' })
    }

    const existingArticle = await getArticleBySlug(slug)
    if (!existingArticle) {
      throw createError({ statusCode: 404, statusMessage: '文章不存在' })
    }

    // Only admin or the author can edit
    if (user.role !== 'admin' && existingArticle.authorId !== user.id) {
      throw createError({ statusCode: 403, statusMessage: '无权修改此文章' })
    }

    const body = await readBody<Omit<BlogArticle, 'id'>>(event)
    
    // Normal users cannot directly publish
    const status = user.role === 'admin' ? body.status : (body.status === '已发布' ? '待审核' : '草稿')

    return {
      article: await updateArticle(slug, {
        ...body,
        status
      }),
    }
  }

  if (event.method === 'DELETE') {
    if (!user) {
      throw createError({ statusCode: 401, statusMessage: '未登录' })
    }

    const existingArticle = await getArticleBySlug(slug)
    if (!existingArticle) {
      throw createError({ statusCode: 404, statusMessage: '文章不存在' })
    }

    // Only admin or the author can delete
    if (user.role !== 'admin' && existingArticle.authorId !== user.id) {
      throw createError({ statusCode: 403, statusMessage: '无权删除此文章' })
    }

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
