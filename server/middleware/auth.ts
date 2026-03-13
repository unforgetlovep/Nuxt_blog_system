import { verifyToken } from '~~/lib/database/users'

export default defineEventHandler((event) => {
  const token = getCookie(event, 'auth_token')
  
  if (token) {
    const decoded = verifyToken(token)
    if (decoded) {
      event.context.user = decoded
    }
  }
})