import { mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { createClient } from '@libsql/client'
import { sql } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/libsql'
import { mockArticles } from '~~/shared/data/articles'
import { articles, users } from './schema'

const databaseFilePath = join(process.cwd(), '.data', 'blog.sqlite')
const databaseUrl = `file:${databaseFilePath.replace(/\\/g, '/')}`

mkdirSync(dirname(databaseFilePath), { recursive: true })

const client = createClient({
  url: databaseUrl,
})

export const db = drizzle(client, {
  schema: {
    articles,
    users,
  },
})

let isInitialized = false

export const initializeDatabase = async () => {
  if (isInitialized) {
    return
  }

  await client.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user',
      avatar TEXT,
      created_at TEXT NOT NULL
    )
  `)

  await client.execute(`
    CREATE TABLE IF NOT EXISTS articles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      summary TEXT NOT NULL,
      category TEXT NOT NULL,
      status TEXT NOT NULL,
      author TEXT NOT NULL,
      author_id INTEGER REFERENCES users(id),
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

  // Add author_id column to existing articles table if it doesn't exist
  try {
    const tableInfo = await client.execute("PRAGMA table_info(articles)")
    const hasAuthorId = tableInfo.rows.some(row => row.name === 'author_id')
    if (!hasAuthorId) {
      await client.execute("ALTER TABLE articles ADD COLUMN author_id INTEGER REFERENCES users(id)")
    }
  } catch (e) {
    console.error("Error modifying articles table", e)
  }

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
