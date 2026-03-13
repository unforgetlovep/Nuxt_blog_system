import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { BlogArticle, ArticleStatus } from '~~/shared/types/article'

export const useArticlesStore = defineStore('articles', () => {
  // Currently, the articles store is empty as we migrated to API and database.
  // We can keep this store for future UI state management, such as user preferences.
  
  return {
  }
})
