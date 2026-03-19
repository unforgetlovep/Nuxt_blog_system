import { createOSSClient, buildOSSUrl, generateObjectKey } from '../utils/oss'

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
]

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

export default defineEventHandler(async (event) => {
  // 仅允许登录用户上传
  const user = event.context.user
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: '请先登录后再上传图片' })
  }

  const parts = await readMultipartFormData(event)

  if (!parts || parts.length === 0) {
    throw createError({ statusCode: 400, statusMessage: '未找到上传文件，请通过 multipart/form-data 上传，字段名为 file' })
  }

  const filePart = parts.find(p => p.name === 'file')

  if (!filePart || !filePart.data || filePart.data.length === 0) {
    throw createError({ statusCode: 400, statusMessage: '文件数据为空' })
  }

  if (filePart.data.length > MAX_FILE_SIZE) {
    throw createError({ statusCode: 413, statusMessage: `文件过大，单张图片最大允许 ${MAX_FILE_SIZE / 1024 / 1024}MB` })
  }

  const mimeType = filePart.type || 'image/jpeg'
  if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
    throw createError({ statusCode: 415, statusMessage: '不支持的文件类型，仅允许上传 JPG、PNG、GIF、WebP、SVG 格式图片' })
  }

  const config = useRuntimeConfig()
  const uploadDir = (config.ossUploadDir as string) || 'blog/images'
  const originalName = filePart.filename || `image.${mimeType.split('/')[1]}`
  const objectKey = generateObjectKey(originalName, uploadDir)

  const oss = createOSSClient()

  await oss.put(objectKey, filePart.data, {
    headers: {
      'Content-Type': mimeType,
      'Cache-Control': 'public, max-age=31536000',
    },
  })

  const url = buildOSSUrl(objectKey)

  return {
    url,
    key: objectKey,
    size: filePart.data.length,
    mimeType,
  }
})
