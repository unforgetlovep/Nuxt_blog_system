import { eq, sql } from 'drizzle-orm'
import { createError } from 'h3'
import type { BlogComment } from '~~/shared/types/comment'
import { db, initializeDatabase } from '~~/lib/database/client'
import { comments } from '~~/lib/database/schema'

export default defineEventHandler(async (event) => {
  const rawSlug = getRouterParam(event, 'slug')
  const slug = rawSlug ? decodeURIComponent(rawSlug) : ''
  const user = event.context.user

  if (!slug) {
    throw createError({ statusCode: 400, statusMessage: '文章标识不能为空' })
  }

  if (event.method === 'POST') {
    if (!user) {
      throw createError({ statusCode: 401, statusMessage: '未登录' })
    }

    const body = await readBody<{ content?: string }>(event)
    const content = String(body.content ?? '').trim()

    if (!content) {
      throw createError({ statusCode: 400, statusMessage: '评论内容不能为空' })
    }

    if (content.length > 1000) {
      throw createError({ statusCode: 400, statusMessage: '评论内容过长（最大 1000 字）' })
    }

    await initializeDatabase()

    await db.insert(comments).values({
      articleSlug: slug,
      authorId: user.id,
      author: user.username,
      content,
      createdAt: new Date().toISOString(),
    })

    return { success: true }
  }

  if (event.method === 'GET') {
    await initializeDatabase()

    const rows = await db
      .select()
      .from(comments)
      .where(eq(comments.articleSlug, slug))
      .orderBy(sql`${comments.createdAt} DESC`)

    const list: BlogComment[] = rows.map((row) => ({
      id: row.id,
      articleSlug: row.articleSlug,
      authorId: row.authorId ?? undefined,
      author: row.author,
      content: row.content,
      createdAt: row.createdAt,
    }))

    return { list }
  }

  throw createError({ statusCode: 405, statusMessage: 'Method Not Allowed' })
})

