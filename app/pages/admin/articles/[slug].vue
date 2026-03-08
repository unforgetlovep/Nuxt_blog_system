<script setup lang="ts">
import type { BlogArticle } from '~~/shared/types/article'

definePageMeta({
  layout: 'admin',
})

const route = useRoute()
const slug = computed(() => decodeURIComponent(String(route.params.slug ?? '')))
const { data } = await useFetch<{ article: BlogArticle }>(
  () => `/api/posts/${encodeURIComponent(slug.value)}`,
  {
    watch: [slug],
  },
)
const article = computed(() => data.value?.article ?? null)
</script>

<template>
  <AdminArticleEditorForm v-if="article" mode="edit" :article="article" />
  <div v-else class="m-20 rounded-[2rem] border border-slate-200 bg-white p-10 text-center text-slate-500 shadow-sm">
    当前文章不存在，可能已被删除或标识已变更。
  </div>
</template>
