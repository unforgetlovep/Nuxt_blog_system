export type ArticleStatus = '已发布' | '草稿' | '待审核'

export interface BlogArticle {
  id: number
  slug: string
  title: string
  summary: string
  category: string
  status: ArticleStatus
  author: string
  updatedAt: string
  createdAt: string
  readTime: string
  views: number
  tags: string[]
  cover: string
  featured: boolean
  content: string
}
