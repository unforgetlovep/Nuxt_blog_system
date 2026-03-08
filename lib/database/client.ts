import { mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { createClient } from '@libsql/client'
import { sql } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/libsql'
import { mockArticles } from '~~/shared/data/articles'
import { articles } from './schema'

const databaseFilePath = join(process.cwd(), '.data', 'blog.sqlite')
const databaseUrl = `file:${databaseFilePath.replace(/\\/g, '/')}`

mkdirSync(dirname(databaseFilePath), { recursive: true })

const client = createClient({
  url: databaseUrl,
})

export const db = drizzle(client, {
  schema: {
    articles,
  },
})

let isInitialized = false

export const initializeDatabase = async () => {
  if (isInitialized) {
    return
  }

  await client.execute(`
    CREATE TABLE IF NOT EXISTS articles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      summary TEXT NOT NULL,
      category TEXT NOT NULL,
      status TEXT NOT NULL,
      author TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      created_at TEXT NOT NULL,
      read_time TEXT NOT NULL,
      views INTEGER NOT NULL DEFAULT 0,
      tags TEXT NOT NULL,
      cover TEXT NOT NULL,
      featured INTEGER NOT NULL DEFAULT 0,
      content TEXT NOT NULL
    )
  `)

  const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(articles)

  if (count === 0) {
    await db.insert(articles).values(
      mockArticles.map((article) => ({
        ...article,
        tags: JSON.stringify(article.tags),
      })),
    )
  }

  isInitialized = true
}
