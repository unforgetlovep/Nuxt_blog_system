import { createArticle, getArticles } from '~~/lib/database/articles'
import type { BlogArticle } from '~~/shared/types/article'

export default defineEventHandler(async (event) => {
  if (event.method === 'POST') {
    const body = await readBody<Omit<BlogArticle, 'id'>>(event)

    return {
      article: await createArticle(body),
    }
  }

  const query = getQuery(event)

  return getArticles({
    category: String(query.category ?? '全部'),
    status: String(query.status ?? '全部'),
    search: String(query.search ?? ''),
    sort: String(query.sort ?? 'updatedAt') as 'updatedAt' | 'createdAt' | 'views',
  })
})
