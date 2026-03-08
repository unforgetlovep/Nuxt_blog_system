import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: './lib/database/schema.ts',
  out: './drizzle',
  dialect: 'sqlite',
  dbCredentials: {
    url: './.data/blog.sqlite',
  },
})
