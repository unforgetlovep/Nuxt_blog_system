import { createError } from 'h3'
import type { BlogArticle } from '~~/shared/types/article'
import { deleteArticleBySlug, getArticleBySlug, incrementArticleViews, updateArticle } from '~~/lib/database/articles'

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

  // Update views with simple cookie dedup (best-effort).
  // This makes home "HOT" and sort-by-views meaningful without complex infra.
  if (article.status === '已发布') {
    const viewedCookie = getCookie(event, 'viewed_post_slugs')
    let viewedSlugs: string[] = []

    if (viewedCookie) {
      try {
        const parsed = JSON.parse(String(viewedCookie))
        if (Array.isArray(parsed)) {
          viewedSlugs = parsed.map(String).slice(0, 50)
        }
      } catch {
        viewedSlugs = String(viewedCookie)
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
          .slice(0, 50)
      }
    }

    const hasViewed = viewedSlugs.includes(slug)
    if (!hasViewed) {
      viewedSlugs = [...viewedSlugs, slug].slice(-50)
      await incrementArticleViews(slug, 1)
    }

    setCookie(event, 'viewed_post_slugs', JSON.stringify(viewedSlugs), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60,
      path: '/',
    })
  }

  // Return updated views if we incremented.
  const latest = await getArticleBySlug(slug)

  return {
    article: latest ?? article,
  }
})
