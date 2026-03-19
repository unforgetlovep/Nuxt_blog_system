<script setup lang="ts">
import { useUserStore } from '~~/stores/user'
import type { BlogArticle } from '~~/shared/types/article'

definePageMeta({
  middleware: [
    function (to, from) {
      const userStore = useUserStore()
      if (!userStore.isAuthenticated) {
        return navigateTo('/')
      }
    }
  ]
})

const route = useRoute()
const isEditMode = computed(() => !!route.query.slug)
const slug = computed(() => String(route.query.slug || ''))

const { data: articleData } = await useFetch<{ article: BlogArticle }>(
  () => `/api/posts/${encodeURIComponent(slug.value)}`,
  {
    immediate: isEditMode.value,
  }
)

const article = computed(() => articleData.value?.article ?? null)
</script>

<template>
  <div class="max-w-5xl mx-auto py-8">
    <div class="mb-6 flex items-center justify-between">
      <h1 class="text-2xl font-bold text-gray-900">
        {{ isEditMode ? '编辑文章' : '写文章' }}
      </h1>
      <NuxtLink to="/user/profile" class="text-sm font-medium text-gray-500 hover:text-gray-900 transition">
        &larr; 返回个人中心
      </NuxtLink>
    </div>
    
    <div v-if="isEditMode && !article" class="bg-gray-50 rounded-xl p-10 text-center text-gray-500">
      文章新建成功
    </div>
    <AdminArticleEditorForm v-else :mode="isEditMode ? 'edit' : 'create'" :article="article" />
  </div>
</template>
