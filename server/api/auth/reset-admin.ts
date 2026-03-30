import { eq, or } from 'drizzle-orm'
import bcrypt from 'bcryptjs'
import { db, initializeDatabase } from '~~/lib/database/client'
import { users } from '~~/lib/database/schema'

const ADMIN_USERNAME = 'admin'
const NEW_PASSWORD = 'Admin@2026'

export default defineEventHandler(async (event) => {
  // Production-only protection: require `ADMIN_SETUP_TOKEN` via `x-admin-setup-token`
  if (process.env.NODE_ENV === 'production') {
    const expected = process.env.ADMIN_SETUP_TOKEN
    if (!expected) {
      throw createError({ statusCode: 500, statusMessage: 'ADMIN_SETUP_TOKEN 未配置' })
    }

    const providedHeader = event.node.req.headers['x-admin-setup-token']
    const query = getQuery(event) as Record<string, unknown>
    const providedQuery = query.token ? String(query.token) : ''
    const provided = (providedHeader ? String(providedHeader) : '') || providedQuery

    if (!provided || provided !== expected) {
      throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
    }
  }

  await initializeDatabase()

  const hashedPassword = await bcrypt.hash(NEW_PASSWORD, 10)

  // 先查找 role=admin 的账号，再兜底查找 username=admin 的账号
  const [adminUser] = await db
    .select()
    .from(users)
    .where(or(eq(users.role, 'admin'), eq(users.username, ADMIN_USERNAME)))
    .limit(1)

  if (adminUser) {
    // 找到了，直接更新密码，并确保 role 为 admin
    await db
      .update(users)
      .set({ password: hashedPassword, role: 'admin' })
      .where(eq(users.id, adminUser.id))

    return {
      success: true,
      message: '管理员密码已重置',
      credentials: {
        username: adminUser.username,
        password: NEW_PASSWORD,
      },
    }
  }

  // 数据库有其他用户但没有管理员账号，直接创建
  await db.insert(users).values({
    username: ADMIN_USERNAME,
    password: hashedPassword,
    role: 'admin',
    createdAt: new Date().toISOString(),
  })

  return {
    success: true,
    message: '管理员账号已创建',
    credentials: {
      username: ADMIN_USERNAME,
      password: NEW_PASSWORD,
    },
  }
})
