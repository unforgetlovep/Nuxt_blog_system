import OSS from 'ali-oss'

export interface OSSUploadResult {
  url: string
  key: string
}

/**
 * 创建 OSS 客户端实例
 * 每次调用都创建新实例，避免 runtimeConfig 在不同请求间错误复用
 */
export function createOSSClient(): OSS {
  const config = useRuntimeConfig()

  if (!config.ossAccessKeyId || !config.ossAccessKeySecret || !config.ossBucket || !config.ossRegion) {
    throw createError({
      statusCode: 500,
      statusMessage: '阿里云 OSS 配置不完整，请检查环境变量 OSS_REGION / OSS_ACCESS_KEY_ID / OSS_ACCESS_KEY_SECRET / OSS_BUCKET',
    })
  }

  return new OSS({
    region: config.ossRegion as string,
    accessKeyId: config.ossAccessKeyId as string,
    accessKeySecret: config.ossAccessKeySecret as string,
    bucket: config.ossBucket as string,
  })
}

/**
 * 生成上传到 OSS 后的公开访问 URL
 * 若配置了自定义域名则使用自定义域名，否则使用 OSS 默认域名
 */
export function buildOSSUrl(objectKey: string): string {
  const config = useRuntimeConfig()

  if (config.ossCustomDomain) {
    const domain = (config.ossCustomDomain as string).replace(/^https?:\/\//, '').replace(/\/$/, '')
    return `https://${domain}/${objectKey}`
  }

  const region = config.ossRegion as string
  const bucket = config.ossBucket as string
  return `https://${bucket}.${region}.aliyuncs.com/${objectKey}`
}

/**
 * 生成唯一的 OSS 对象 Key
 * 格式：{uploadDir}/{年月}/{时间戳}-{随机串}.{扩展名}
 */
export function generateObjectKey(originalFilename: string, uploadDir: string): string {
  const ext = originalFilename.includes('.')
    ? `.${originalFilename.split('.').pop()!.toLowerCase()}`
    : '.jpg'

  const now = new Date()
  const yearMonth = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`
  const random = Math.random().toString(36).slice(2, 8)

  return `${uploadDir}/${yearMonth}/${Date.now()}-${random}${ext}`
}
