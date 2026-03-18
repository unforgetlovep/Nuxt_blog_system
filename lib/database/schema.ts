import { boolean, int, mysqlTable, text, varchar } from 'drizzle-orm/mysql-core'

export const users = mysqlTable('users', {
  id: int('id').primaryKey().autoincrement(),
  username: varchar('username', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  role: varchar('role', { length: 50 }).notNull().default('user'), // 'admin' or 'user'
  avatar: varchar('avatar', { length: 255 }),
  createdAt: varchar('created_at', { length: 255 }).notNull(),
})

export const articles = mysqlTable('articles', {
  id: int('id').primaryKey().autoincrement(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  title: varchar('title', { length: 255 }).notNull(),
  summary: text('summary').notNull(),
  category: varchar('category', { length: 255 }).notNull(),
  status: varchar('status', { length: 50 }).notNull(),
  author: varchar('author', { length: 255 }).notNull(), // legacy author name
  authorId: int('author_id').references(() => users.id),
  updatedAt: varchar('updated_at', { length: 255 }).notNull(),
  createdAt: varchar('created_at', { length: 255 }).notNull(),
  readTime: varchar('read_time', { length: 255 }).notNull(),
  views: int('views').notNull().default(0),
  tags: text('tags').notNull(),
  cover: varchar('cover', { length: 255 }).notNull(),
  featured: boolean('featured').notNull().default(false),
  content: text('content').notNull(), // 可以使用 text 保存较长内容
})