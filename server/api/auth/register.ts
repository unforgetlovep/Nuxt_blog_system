import { registerUser } from '~~/lib/database/users'

export default defineEventHandler(async (event) => {
  if (event.method !== 'POST') {
    throw createError({ statusCode: 405, statusMessage: 'Method Not Allowed' })
  }

  const body = await readBody(event)

  if (!body.username || !body.password) {
    throw createError({ statusCode: 400, statusMessage: '用户名和密码不能为空' })
  }

  // To secure the system, only allow normal user registration by default
  // Can add a secret code check here to allow admin registration
  const role = body.secretCode === 'admin123' ? 'admin' : 'user'

  const user = await registerUser({
    username: body.username,
    password: body.password,
    role,
  })

  return {
    success: true,
    user,
  }
})
