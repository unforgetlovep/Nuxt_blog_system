import { getArticles } from '~~/lib/database/articles'

export default defineEventHandler(async (event) => {
  const user = event.context.user

  if (!user) {
    throw createError({ statusCode: 401, statusMessage: '未登录' })
  }

  // We need to fetch articles specifically for this user
  // Using the existing getArticles and filtering, or we could add authorId filter to getArticles
  const result = await getArticles({
    sort: 'updatedAt',
  })

  // Filter only articles authored by the current user
  const userArticles = result.list.filter(article => article.authorId === user.id)

  return {
    list: userArticles,
  }
})
