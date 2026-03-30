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
  // Optional: allow admin registration only when ADMIN_SECRET_CODE is configured
  const adminSecretCode = process.env.ADMIN_SECRET_CODE
  const role =
    adminSecretCode && body.secretCode && String(body.secretCode) === adminSecretCode ? 'admin' : 'user'

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
