import { verifyToken, toUserDTO } from '~~/lib/database/users'
import { db, initializeDatabase } from '~~/lib/database/client'
import { users } from '~~/lib/database/schema'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const token = getCookie(event, 'auth_token')
  if (process.env.NODE_ENV !== 'production') {
    console.log('[me.ts] token from cookie:', token ? 'EXISTS' : 'MISSING')
  }

  if (!token) {
    throw createError({ statusCode: 401, statusMessage: '未登录' })
  }

  const decoded = verifyToken(token)

  if (!decoded) {
    deleteCookie(event, 'auth_token', { path: '/' })
    throw createError({ statusCode: 401, statusMessage: 'Token 无效或已过期' })
  }

  await initializeDatabase()

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, decoded.id))
    .limit(1)

  if (!user) {
    throw createError({ statusCode: 401, statusMessage: '用户不存在' })
  }

  return {
    user: toUserDTO(user)
  }
})
