import { loginUser } from '~~/lib/database/users'

export default defineEventHandler(async (event) => {
  if (event.method !== 'POST') {
    throw createError({ statusCode: 405, statusMessage: 'Method Not Allowed' })
  }

  const body = await readBody(event)

  if (!body.username || !body.password) {
    throw createError({ statusCode: 400, statusMessage: '用户名和密码不能为空' })
  }

  const result = await loginUser({
    username: body.username,
    password: body.password,
  })

  // Set HTTP-only cookie for secure auth
  setCookie(event, 'auth_token', result.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: '/',
  })

  return {
    success: true,
    user: result.user,
    token: result.token,
  }
})
