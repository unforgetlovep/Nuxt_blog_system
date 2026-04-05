import mysql from 'mysql2/promise'
import { sql } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/mysql2'
import { mockArticles } from '~~/shared/data/articles'
import { articles, comments, users } from './schema'

const databaseUrl = process.env.DATABASE_URL || 'mysql://root:password@127.0.0.1:3306/blog_system'

const poolConnection = mysql.createPool(databaseUrl)

export const db = drizzle(poolConnection, {
  schema: {
    articles,
    comments,
    users,
  },
  mode: 'default'
})

let isInitialized = false

export const initializeDatabase = async () => {
  if (isInitialized) {
    return
  }

  await poolConnection.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(50) NOT NULL DEFAULT 'user',
      avatar VARCHAR(255),
      created_at VARCHAR(255) NOT NULL
    )
  `)

  await poolConnection.query(`
    CREATE TABLE IF NOT EXISTS articles (
      id INT AUTO_INCREMENT PRIMARY KEY,
      slug VARCHAR(255) NOT NULL UNIQUE,
      title VARCHAR(255) NOT NULL,
      summary TEXT NOT NULL,
      category VARCHAR(255) NOT NULL,
      status VARCHAR(50) NOT NULL,
      author VARCHAR(255) NOT NULL,
      author_id INT,
      updated_at VARCHAR(255) NOT NULL,
      created_at VARCHAR(255) NOT NULL,
      read_time VARCHAR(255) NOT NULL,
      views INT NOT NULL DEFAULT 0,
      tags TEXT NOT NULL,
      cover VARCHAR(255) NOT NULL,
      featured BOOLEAN NOT NULL DEFAULT 0,
      content LONGTEXT NOT NULL,
      FOREIGN KEY (author_id) REFERENCES users(id)
    )
  `)

  await poolConnection.query(`
    CREATE TABLE IF NOT EXISTS comments (
      id INT AUTO_INCREMENT PRIMARY KEY,
      article_slug VARCHAR(255) NOT NULL,
      author_id INT,
      author VARCHAR(255) NOT NULL,
      content TEXT NOT NULL,
      created_at VARCHAR(255) NOT NULL,
      FOREIGN KEY (author_id) REFERENCES users(id)
    )
  `)

  // Add author_id column to existing articles table if it doesn't exist
  try {
    const [rows]: any = await poolConnection.query("SHOW COLUMNS FROM articles LIKE 'author_id'")
    if (rows.length === 0) {
      await poolConnection.query("ALTER TABLE articles ADD COLUMN author_id INT, ADD FOREIGN KEY (author_id) REFERENCES users(id)")
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