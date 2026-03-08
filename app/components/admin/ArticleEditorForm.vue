<script setup lang="ts">
import { MdEditor } from 'md-editor-v3'
import 'md-editor-v3/lib/style.css'
import type { BlogArticle, ArticleStatus } from '~~/shared/types/article'

interface Props {
  mode: 'create' | 'edit'
  article?: BlogArticle | null
}

interface StoredDraft {
  savedAt: string
  data: BlogArticle
}

const props = withDefaults(defineProps<Props>(), {
  article: null,
})

const router = useRouter()

const categoryOptions = ['前端开发', '产品规划', '设计研究', '运营分析']
const tagOptions = ['Nuxt', 'Vue', 'TypeScript', 'TailwindCSS', '毕业设计', '内容运营']
const statusOptions: ArticleStatus[] = ['草稿', '待审核', '已发布']
const defaultCover = 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80'

const createInitialArticle = (): BlogArticle => ({
  id: 0,
  slug: 'new-article',
  title: '用内容系统整理前端实践与产品笔记',
  summary: '围绕内容策划、写作、发布与展示建立一套清晰的工作流，让文章管理与前台阅读体验保持一致。',
  content: `## 内容定位

- 记录前端开发中的关键实践
- 沉淀产品思考、设计观察与项目复盘
- 让文章从草稿到发布形成稳定流程

## 写作建议

先写清问题背景，再整理方法与结论，最后补充可复用的经验与参考资料。`,
  status: '草稿',
  updatedAt: '2026-03-08T10:00',
  createdAt: '2026-03-08',
  category: '前端开发',
  author: 'Admin',
  tags: ['Nuxt', 'Vue', 'TypeScript'],
  views: 0,
  readTime: '6 分钟',
  cover: defaultCover,
  featured: false,
})

const toDateTimeValue = (value: string) => (value.includes('T') ? value : `${value}T09:00`)

const createSlug = (title: string) => {
  const slug = title
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\u4e00-\u9fa5-]/g, '')
    .replace(/-+/g, '-')

  return slug || `article-${Date.now()}`
}

const serializeArticle = (article: BlogArticle) => JSON.stringify(article)

const cloneArticle = (article?: BlogArticle | null): BlogArticle => {
  const baseArticle = createInitialArticle()
  const sourceArticle = article ?? baseArticle

  return {
    ...baseArticle,
    ...sourceArticle,
    updatedAt: toDateTimeValue(sourceArticle.updatedAt || baseArticle.updatedAt),
    tags: [...(sourceArticle.tags || [])],
  }
}

const form = reactive<BlogArticle>(createInitialArticle())
const lastSavedSnapshot = ref(serializeArticle(createInitialArticle()))
const lastSavedAt = ref('')
const availableDraft = ref<StoredDraft | null>(null)
const isSlugCustomized = ref(false)
const submitMessage = ref('')

const draftStorageKey = computed(() =>
  `blog-system:draft:${props.mode === 'create' ? 'new-article' : props.article?.slug || form.slug}`,
)

const hasUnsavedChanges = computed(() => serializeArticle(form) !== lastSavedSnapshot.value)

const estimatedReadTime = computed(() => {
  const plainTextLength = form.content.replace(/[#>*`\-\n\r]/g, '').trim().length
  const minutes = Math.max(1, Math.ceil(plainTextLength / 320))

  return `${minutes} 分钟`
})

const formattedSavedAt = computed(() => {
  if (!lastSavedAt.value) {
    return ''
  }

  return new Intl.DateTimeFormat('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(lastSavedAt.value))
})

const applyArticleToForm = (article?: BlogArticle | null) => {
  const nextArticle = cloneArticle(article)

  Object.assign(form, nextArticle)
  isSlugCustomized.value = Boolean(article?.slug)
  lastSavedSnapshot.value = serializeArticle(nextArticle)
}

const loadSavedDraft = () => {
  if (!import.meta.client) {
    return
  }

  const rawDraft = localStorage.getItem(draftStorageKey.value)

  if (!rawDraft) {
    availableDraft.value = null
    return
  }

  try {
    availableDraft.value = JSON.parse(rawDraft) as StoredDraft
  } catch {
    localStorage.removeItem(draftStorageKey.value)
    availableDraft.value = null
  }
}

const removeSavedDraft = () => {
  if (!import.meta.client) {
    return
  }

  localStorage.removeItem(draftStorageKey.value)
  availableDraft.value = null
}

const saveDraft = () => {
  if (!import.meta.client) {
    return
  }

  form.readTime = estimatedReadTime.value
  form.updatedAt = new Date().toISOString().slice(0, 16)

  const payload: StoredDraft = {
    savedAt: new Date().toISOString(),
    data: cloneArticle(form),
  }

  localStorage.setItem(draftStorageKey.value, JSON.stringify(payload))
  availableDraft.value = payload
  lastSavedAt.value = payload.savedAt
  lastSavedSnapshot.value = serializeArticle(payload.data)
}

const saveArticle = async () => {
  if (!form.title.trim() || !form.summary.trim() || !form.content.trim()) {
    submitMessage.value = '请至少补充标题、摘要和正文内容后再保存文章。'
    return
  }

  const now = new Date().toISOString()
  const normalizedArticle = cloneArticle(form)

  normalizedArticle.slug = createSlug(form.slug || form.title)
  normalizedArticle.title = form.title.trim()
  normalizedArticle.summary = form.summary.trim()
  normalizedArticle.content = form.content.trim()
  normalizedArticle.author = form.author.trim() || 'Admin'
  normalizedArticle.readTime = estimatedReadTime.value
  normalizedArticle.cover = form.cover.trim() || defaultCover
  normalizedArticle.updatedAt = now.slice(0, 10)
  normalizedArticle.createdAt = form.createdAt || now.slice(0, 10)

  const savedArticleResponse = props.mode === 'create'
    ? await $fetch<{ article: BlogArticle }>('/api/posts', {
        method: 'POST',
        body: normalizedArticle,
      })
    : await $fetch<{ article: BlogArticle }>(`/api/posts/${props.article?.slug}`, {
        method: 'PUT',
        body: normalizedArticle,
      })

  const savedArticle = savedArticleResponse.article

  Object.assign(form, cloneArticle(savedArticle))
  removeSavedDraft()

  lastSavedAt.value = now
  lastSavedSnapshot.value = serializeArticle(savedArticle)
  submitMessage.value = props.mode === 'create'
    ? '文章已保存，现在可以在列表页和前台详情页中直接查看。'
    : '文章更新成功，后台列表与前台展示内容已同步刷新。'

  if (props.mode === 'create') {
    await navigateTo(`/admin/articles/${savedArticle.slug}`)
    return
  }

  if (props.article?.slug && props.article.slug !== savedArticle.slug) {
    await navigateTo(`/admin/articles/${savedArticle.slug}`)
    return
  }

  await router.replace(`/admin/articles/${savedArticle.slug}`)
}

const restoreDraft = () => {
  if (!availableDraft.value) {
    return
  }

  const restoredArticle = cloneArticle(availableDraft.value.data)

  Object.assign(form, restoredArticle)
  lastSavedAt.value = availableDraft.value.savedAt
  lastSavedSnapshot.value = serializeArticle(restoredArticle)
}

const resetForm = () => {
  applyArticleToForm(props.article)
}

const toggleTag = (tag: string) => {
  if (form.tags.includes(tag)) {
    form.tags = form.tags.filter((item) => item !== tag)
    return
  }

  form.tags = [...form.tags, tag]
}

watch(
  () => props.article,
  (article) => {
    applyArticleToForm(article)
    loadSavedDraft()
  },
  { immediate: true },
)

watch(
  () => draftStorageKey.value,
  () => {
    loadSavedDraft()
  },
)

watch(
  () => form.title,
  (title) => {
    if (props.mode === 'create' && !isSlugCustomized.value) {
      form.slug = createSlug(title)
    }
  },
)
</script>

<template>
  <div class="space-y-8 m-20">
    <section class="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
      <div>
        <p class="text-sm uppercase tracking-[0.3em] text-sky-700">Editor</p>
        <h2 class="mt-2 text-3xl font-semibold text-slate-950">
          {{ mode === 'create' ? '新建文章' : '编辑文章' }}
        </h2>
        <p class="mt-3 max-w-2xl text-sm leading-7 text-slate-500">
          {{ mode === 'create'
            ? '使用 Markdown 编辑器快速完成标题、摘要、正文与发布信息的整理。'
            : '继续完善当前文章内容，保存后会同步更新前台详情页与后台列表。'
          }}
        </p>
        <p v-if="submitMessage" class="mt-3 text-sm text-emerald-600">
          {{ submitMessage }}
        </p>
      </div>

      <div class="flex flex-wrap gap-3">
        <button
          type="button"
          class="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
          @click="saveDraft"
        >
          保存草稿
        </button>
        <button
          type="button"
          class="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          @click="availableDraft ? restoreDraft() : resetForm()"
        >
          {{ availableDraft ? '恢复草稿' : mode === 'create' ? '重置表单' : '恢复原文' }}
        </button>
        <button
          type="button"
          class="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          @click="saveArticle"
        >
          {{ mode === 'create' ? '创建文章' : '更新文章' }}
        </button>
      </div>
    </section>

    <section class="rounded-[1.75rem] border border-slate-200 bg-white px-5 py-4 shadow-sm">
      <div class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div class="text-sm text-slate-700">
          <p class="font-medium">
            {{ hasUnsavedChanges ? '当前有未保存的修改' : '当前内容已与最近一次保存状态同步' }}
          </p>
          <p class="mt-1 text-slate-500">
            {{ formattedSavedAt
              ? `最近一次保存时间：${formattedSavedAt}`
              : '草稿会保存到浏览器本地，不会写入服务器。'
            }}
          </p>
        </div>

        <div class="flex flex-wrap gap-3 text-sm text-slate-600">
          <span class="rounded-full bg-stone-50 px-3 py-2">预计阅读：{{ estimatedReadTime }}</span>
          <span class="rounded-full bg-stone-50 px-3 py-2">标签数：{{ form.tags.length }}</span>
        </div>
      </div>
    </section>

    <section class="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
      <article class="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div class="space-y-6">
          <div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
            <div>
              <label class="text-sm font-medium text-slate-700">文章标题</label>
              <input
                v-model="form.title"
                type="text"
                class="mt-3 w-full rounded-[1.25rem] border border-slate-200 bg-slate-50 px-4 py-4 text-base text-slate-950 outline-none transition focus:border-cyan-400"
              >
            </div>

            <div>
              <label class="text-sm font-medium text-slate-700">文章标识</label>
              <input
                v-model="form.slug"
                type="text"
                class="mt-3 w-full rounded-[1.25rem] border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-950 outline-none transition focus:border-cyan-400"
                @input="isSlugCustomized = true"
              >
            </div>
          </div>

          <div>
            <label class="text-sm font-medium text-slate-700">文章摘要</label>
            <textarea
              v-model="form.summary"
              rows="4"
              class="mt-3 w-full rounded-[1.25rem] border border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-7 text-slate-700 outline-none transition focus:border-cyan-400"
            />
          </div>

          <div>
            <label class="text-sm font-medium text-slate-700">正文内容</label>
            <div class="mt-3 overflow-hidden rounded-[1.5rem] border border-slate-200">
              <ClientOnly fallback-tag="div" fallback="Markdown 编辑器加载中...">
                <MdEditor
                  v-model="form.content"
                  class="min-h-[640px]"
                  preview-theme="github"
                  code-theme="atom"
                />
              </ClientOnly>
            </div>
          </div>
        </div>
      </article>

      <aside class="space-y-6">
        <article class="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <p class="text-base font-semibold text-slate-950">发布设置</p>
          <div class="mt-5 space-y-5">
            <div>
              <label class="text-sm font-medium text-slate-700">文章状态</label>
              <select
                v-model="form.status"
                class="mt-3 w-full rounded-[1.25rem] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-cyan-400"
              >
                <option v-for="status in statusOptions" :key="status" :value="status">
                  {{ status }}
                </option>
              </select>
            </div>

            <div>
              <label class="text-sm font-medium text-slate-700">最近更新时间</label>
              <input
                v-model="form.updatedAt"
                type="datetime-local"
                class="mt-3 w-full rounded-[1.25rem] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-cyan-400"
              >
            </div>

            <div>
              <label class="text-sm font-medium text-slate-700">封面图地址</label>
              <input
                v-model="form.cover"
                type="url"
                placeholder="https://example.com/cover.jpg"
                class="mt-3 w-full rounded-[1.25rem] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-cyan-400"
              >
              <div class="mt-3 overflow-hidden rounded-[1.25rem] border border-slate-200 bg-slate-50">
                <img
                  :src="form.cover || defaultCover"
                  :alt="form.title"
                  class="h-40 w-full object-cover"
                >
              </div>
            </div>

            <label class="flex items-center justify-between gap-4 rounded-[1.25rem] border border-slate-200 bg-slate-50 px-4 py-4">
              <div>
                <p class="text-sm font-medium text-slate-700">设为精选文章</p>
                <p class="mt-1 text-xs text-slate-500">首页推荐区会优先展示精选内容</p>
              </div>
              <input v-model="form.featured" type="checkbox" class="h-5 w-5 accent-slate-900">
            </label>
          </div>
        </article>

        <article class="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <p class="text-base font-semibold text-slate-950">分类与标签</p>

          <div class="mt-5">
            <label class="text-sm font-medium text-slate-700">分类</label>
            <div class="mt-3 flex flex-wrap gap-2">
              <button
                v-for="category in categoryOptions"
                :key="category"
                type="button"
                :class="[
                  'rounded-full px-3 py-2 text-sm transition',
                  category === form.category
                    ? 'bg-slate-950 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
                ]"
                @click="form.category = category"
              >
                {{ category }}
              </button>
            </div>
          </div>

          <div class="mt-6">
            <label class="text-sm font-medium text-slate-700">标签</label>
            <div class="mt-3 flex flex-wrap gap-2">
              <button
                v-for="tag in tagOptions"
                :key="tag"
                type="button"
                :class="[
                  'rounded-full px-3 py-2 text-sm transition',
                  form.tags.includes(tag)
                    ? 'bg-cyan-500/10 text-cyan-700 hover:bg-cyan-500/15'
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200',
                ]"
                @click="toggleTag(tag)"
              >
                {{ tag }}
              </button>
            </div>
          </div>

          <div class="mt-6 grid gap-4 sm:grid-cols-2">
            <div>
              <label class="text-sm font-medium text-slate-700">作者</label>
              <input
                v-model="form.author"
                type="text"
                class="mt-3 w-full rounded-[1.25rem] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-cyan-400"
              >
            </div>

            <div>
              <label class="text-sm font-medium text-slate-700">创建时间</label>
              <input
                v-model="form.createdAt"
                type="date"
                class="mt-3 w-full rounded-[1.25rem] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-cyan-400"
              >
            </div>
          </div>
        </article>
      </aside>
    </section>
  </div>
</template>
