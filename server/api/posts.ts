import { createArticle, getArticles } from '~~/lib/database/articles'
import type { BlogArticle } from '~~/shared/types/article'

export default defineEventHandler(async (event) => {
  const user = event.context.user

  if (event.method === 'POST') {
    if (!user) {
      throw createError({ statusCode: 401, statusMessage: '未登录' })
    }

    const body = await readBody<Omit<BlogArticle, 'id'>>(event)
    
    // Normal users default to '待审核' or '草稿'
    const status = user.role === 'admin' ? body.status : (body.status === '已发布' ? '待审核' : '草稿')

    return {
      article: await createArticle({
        ...body,
        status,
        author: user.username,
        // @ts-ignore
        authorId: user.id
      }),
    }
  }

  const query = getQuery(event)

  return getArticles({
    category: query.category ? String(query.category) : '全部',
    status: query.status ? String(query.status) : '全部',
    search: query.search ? String(query.search) : '',
    sort: String(query.sort ?? 'updatedAt') as 'updatedAt' | 'createdAt' | 'views',
    page: query.page ? Number(query.page) : undefined,
    pageSize: query.pageSize ? Number(query.pageSize) : undefined,
  })
})
