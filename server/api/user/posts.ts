import { getArticlesByAuthorId } from '~~/lib/database/articles'

export default defineEventHandler(async (event) => {
  const user = event.context.user

  if (!user) {
    throw createError({ statusCode: 401, statusMessage: '未登录' })
  }

  const result = await getArticlesByAuthorId(user.id, {
    sort: 'updatedAt',
  })

  return { list: result.list }
})
