export interface BlogComment {
  id: number
  articleSlug: string
  authorId?: number
  author: string
  content: string
  createdAt: string
}

