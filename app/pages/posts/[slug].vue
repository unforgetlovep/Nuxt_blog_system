<script setup lang="ts">
import MarkdownIt from 'markdown-it'
import type { BlogArticle } from '~~/shared/types/article'

const route = useRoute()
const slug = computed(() => decodeURIComponent(String(route.params.slug ?? '')))
const { data } = await useFetch<{ article: BlogArticle }>(
  () => `/api/posts/${encodeURIComponent(slug.value)}`,
  {
    watch: [slug],
  },
)
const article = computed(() => data.value?.article ?? null)
const markdown = new MarkdownIt({
  breaks: true,
  linkify: true,
})

const renderedContent = computed(() => markdown.render(article.value?.content ?? ''))
</script>

<template>
  <div v-if="article" class="mx-auto max-w-5xl space-y-8 m-20">
    <section class="space-y-6">
      <NuxtLink
        to="/"
        class="inline-flex items-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-950"
      >
        返回首页
      </NuxtLink>

      <article class="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_24px_80px_-52px_rgba(15,23,42,0.35)]">
        <img :src="article.cover" :alt="article.title" class="h-72 w-full object-cover md:h-[26rem]">

        <div class="p-8 md:p-10">
          <div class="flex flex-wrap items-center gap-3 text-xs">
            <span class="rounded-full bg-slate-100 px-3 py-1 text-slate-600">{{ article.category }}</span>
            <span class="rounded-full bg-sky-50 px-3 py-1 text-sky-700">{{ article.readTime }}</span>
            <span class="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700">{{ article.status }}</span>
            <span class="text-slate-400">{{ article.views }} 次浏览</span>
          </div>

          <h1 class="mt-6 text-4xl font-semibold leading-tight text-slate-950 md:text-5xl">
            {{ article.title }}
          </h1>
          <p class="mt-5 max-w-3xl text-base leading-8 text-slate-600">
            {{ article.summary }}
          </p>

          <div class="mt-8 flex flex-col gap-6 border-t border-slate-200 pt-6 md:flex-row md:items-end md:justify-between">
            <div class="grid gap-4 sm:grid-cols-3">
              <div>
                <p class="text-xs uppercase tracking-[0.24em] text-slate-400">Author</p>
                <p class="mt-2 text-sm font-medium text-slate-900">{{ article.author }}</p>
              </div>
              <div>
                <p class="text-xs uppercase tracking-[0.24em] text-slate-400">Published</p>
                <p class="mt-2 text-sm font-medium text-slate-900">{{ article.createdAt }}</p>
              </div>
              <div>
                <p class="text-xs uppercase tracking-[0.24em] text-slate-400">Updated</p>
                <p class="mt-2 text-sm font-medium text-slate-900">{{ article.updatedAt }}</p>
              </div>
            </div>

            <div class="flex flex-wrap gap-2">
              <span
                v-for="tag in article.tags"
                :key="tag"
                class="rounded-full border border-slate-200 bg-stone-50 px-3 py-1 text-xs text-slate-600"
              >
                # {{ tag }}
              </span>
            </div>
          </div>
        </div>
      </article>
    </section>

    <section class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_260px]">
      <article class="rounded-[2rem] border border-slate-200 bg-white px-8 py-8 shadow-sm md:px-10 md:py-10">
        <div
          class="prose max-w-none prose-headings:text-slate-950 prose-p:text-slate-700 prose-p:leading-8 prose-li:text-slate-700 prose-li:leading-8 prose-strong:text-slate-950 prose-a:text-sky-700"
          v-html="renderedContent"
        />
      </article>

      <aside class="space-y-5">
        <article class="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
          <p class="text-sm font-medium text-slate-500">阅读信息</p>
          <div class="mt-5 space-y-4 text-sm">
            <div class="rounded-[1.25rem] bg-stone-50 px-4 py-4">
              <p class="text-slate-500">分类</p>
              <p class="mt-2 font-medium text-slate-950">{{ article.category }}</p>
            </div>
            <div class="rounded-[1.25rem] bg-stone-50 px-4 py-4">
              <p class="text-slate-500">阅读时长</p>
              <p class="mt-2 font-medium text-slate-950">{{ article.readTime }}</p>
            </div>
            <div class="rounded-[1.25rem] bg-stone-50 px-4 py-4">
              <p class="text-slate-500">内容状态</p>
              <p class="mt-2 font-medium text-slate-950">{{ article.status }}</p>
            </div>
          </div>
        </article>

        <article class="rounded-[1.75rem] border border-slate-200 bg-slate-950 p-6 text-white shadow-sm">
          <p class="text-sm font-medium text-slate-400">继续处理内容</p>
          <p class="mt-3 text-base leading-7 text-slate-200">
            如果这篇文章还需要继续调整标题、摘要或正文内容，可以直接回到后台编辑页修改。
          </p>
          <NuxtLink
            :to="`/admin/articles/${article.slug}`"
            class="mt-5 inline-flex rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
          >
            在后台编辑
          </NuxtLink>
        </article>
      </aside>
    </section>
  </div>

  <div v-else class="m-20 rounded-[2rem] border border-slate-200 bg-white p-10 text-center text-slate-500 shadow-sm">
    当前文章不存在或尚未加载完成。
  </div>
</template>
