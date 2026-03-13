import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  username: text('username').notNull().unique(),
  password: text('password').notNull(),
  role: text('role').notNull().default('user'), // 'admin' or 'user'
  avatar: text('avatar'),
  createdAt: text('created_at').notNull(),
})

export const articles = sqliteTable('articles', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  summary: text('summary').notNull(),
  category: text('category').notNull(),
  status: text('status').notNull(),
  author: text('author').notNull(), // legacy author name
  authorId: integer('author_id').references(() => users.id),
  updatedAt: text('updated_at').notNull(),
  createdAt: text('created_at').notNull(),
  readTime: text('read_time').notNull(),
  views: integer('views').notNull().default(0),
  tags: text('tags').notNull(),
  cover: text('cover').notNull(),
  featured: integer('featured', { mode: 'boolean' }).notNull().default(false),
  content: text('content').notNull(),
})
