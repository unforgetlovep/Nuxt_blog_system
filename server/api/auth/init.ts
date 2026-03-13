import { db, initializeDatabase } from '~~/lib/database/client'
import { users } from '~~/lib/database/schema'
import { registerUser } from '~~/lib/database/users'
import { sql } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  await initializeDatabase()

  const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(users)

  if (count > 0) {
    throw createError({
      statusCode: 400,
      statusMessage: '系统已经初始化过了，无法再次执行。',
    })
  }

  // Create default admin user
  const adminUser = await registerUser({
    username: 'admin',
    password: 'password123',
    role: 'admin',
  })

  return {
    success: true,
    message: '管理员账号初始化成功',
    user: adminUser,
    credentials: {
      username: 'admin',
      password: 'password123'
    }
  }
})
