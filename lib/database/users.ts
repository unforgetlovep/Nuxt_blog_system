import { eq } from 'drizzle-orm'
import type { InferInsertModel, InferSelectModel } from 'drizzle-orm'
import { createError } from 'h3'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { db, initializeDatabase } from './client'
import { users } from './schema'

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw createError({ statusCode: 500, statusMessage: 'JWT_SECRET 未配置' })
  }
  return secret
}

type UserRow = InferSelectModel<typeof users>
type NewUserRow = InferInsertModel<typeof users>

export const toUserDTO = (row: UserRow) => ({
  id: row.id,
  username: row.username,
  role: row.role,
  avatar: row.avatar,
  createdAt: row.createdAt,
})

export const registerUser = async (data: Pick<NewUserRow, 'username' | 'password' | 'role'>) => {
  await initializeDatabase()

  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.username, data.username))
    .limit(1)

  if (existingUser.length > 0) {
    throw createError({
      statusCode: 400,
      statusMessage: '用户名已占用',
    })
  }

  const hashedPassword = await bcrypt.hash(data.password, 10)

  const payload: NewUserRow = {
    username: data.username,
    password: hashedPassword,
    role: data.role || 'user',
    createdAt: new Date().toISOString(),
  }

  await db.insert(users).values(payload)

  const [createdUser] = await db
    .select()
    .from(users)
    .where(eq(users.username, data.username))
    .limit(1)

  return toUserDTO(createdUser)
}

export const loginUser = async (data: Pick<NewUserRow, 'username' | 'password'>) => {
  await initializeDatabase()

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.username, data.username))
    .limit(1)

  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: '用户名或密码错误',
    })
  }

  const isPasswordValid = await bcrypt.compare(data.password, user.password)

  if (!isPasswordValid) {
    throw createError({
      statusCode: 401,
      statusMessage: '用户名或密码错误',
    })
  }

  const token = jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    getJwtSecret(),
    { expiresIn: '7d' }
  )

  return {
    user: toUserDTO(user),
    token,
  }
}

export const verifyToken = (token: string) => {
  try {
    return jwt.verify(token, getJwtSecret()) as { id: number; username: string; role: string }
  } catch (e) {
    return null
  }
}
