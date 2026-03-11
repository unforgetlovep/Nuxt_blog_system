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

const categoryOptions = ['效率工具', '生活方式', '数码评测', '经验分享', '商业观点']
const tagOptions = ['苹果', '效率', '硬件', 'NAS', '软件', '咖啡', '知识管理']
const statusOptions: ArticleStatus[] = ['草稿', '待审核', '已发布']
const defaultCover = 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80'

const createInitialArticle = (): BlogArticle => ({
  id: 0,
  slug: 'new-article',
  title: '用内容系统整理前端实践与产品笔记',
  summary: '围绕内容策划、写作、发布与展示建立一套清晰的工作流，让文章管理与前台阅读体验保持一致。',
  content: `## 内容定位\n\n- 记录前端开发中的关键实践\n- 沉淀产品思考、设计观察与项目复盘\n- 让文章从草稿到发布形成稳定流程\n\n## 写作建议\n\n先写清问题背景，再整理方法与结论，最后补充可复用的经验与参考资料。`,
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
    ? '文章已保存。'
    : '文章更新成功。'

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
  <div class="space-y-6">
    <!-- Header Area -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-white p-5 rounded border border-gray-200 shadow-sm">
      <div>
        <h2 class="text-xl font-semibold text-gray-900">
          {{ mode === 'create' ? '新建文章' : '编辑文章' }}
        </h2>
        <p class="mt-1 text-sm text-gray-500">
          {{ mode === 'create'
            ? '请填写文章基础信息并编写正文内容。'
            : '编辑文章内容，保存后将同步更新。'
          }}
        </p>
        <p v-if="submitMessage" class="mt-2 text-sm font-medium text-green-600">
          {{ submitMessage }}
        </p>
      </div>

      <div class="mt-4 sm:mt-0 flex flex-wrap gap-2">
        <button
          type="button"
          class="rounded px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition"
          @click="saveDraft"
        >
          保存草稿
        </button>
        <button
          type="button"
          class="rounded px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition"
          @click="availableDraft ? restoreDraft() : resetForm()"
        >
          {{ availableDraft ? '恢复草稿' : mode === 'create' ? '重置表单' : '恢复原文' }}
        </button>
        <button
          type="button"
          class="rounded px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition shadow-sm"
          @click="saveArticle"
        >
          {{ mode === 'create' ? '创建文章' : '更新文章' }}
        </button>
      </div>
    </div>

    <!-- Status Bar -->
    <div class="bg-blue-50 text-blue-800 p-3 rounded border border-blue-100 text-sm flex flex-col sm:flex-row sm:justify-between sm:items-center">
      <div class="flex items-center gap-2">
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>
          {{ hasUnsavedChanges ? '当前有未保存的修改' : '内容已与最近一次保存同步' }}
          <span v-if="formattedSavedAt" class="ml-2 text-blue-600">({{ formattedSavedAt }})</span>
        </span>
      </div>
      <div class="mt-2 sm:mt-0 flex gap-4 text-blue-700 font-medium">
        <span>预计阅读: {{ estimatedReadTime }}</span>
        <span>标签数: {{ form.tags.length }}</span>
      </div>
    </div>

    <div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <!-- Main Content Editor -->
      <div class="bg-white rounded border border-gray-200 shadow-sm p-6 space-y-5">
        <h3 class="text-base font-semibold text-gray-900 border-b border-gray-100 pb-3">基本内容</h3>
        
        <div class="grid gap-5 sm:grid-cols-[1fr_200px]">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">文章标题 <span class="text-red-500">*</span></label>
            <input
              v-model="form.title"
              type="text"
              placeholder="请输入文章标题"
              class="w-full rounded border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">标识 (Slug)</label>
            <input
              v-model="form.slug"
              type="text"
              class="w-full rounded border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              @input="isSlugCustomized = true"
            >
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">文章摘要 <span class="text-red-500">*</span></label>
          <textarea
            v-model="form.summary"
            rows="3"
            placeholder="简要描述文章内容"
            class="w-full rounded border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">正文内容 <span class="text-red-500">*</span></label>
          <div class="border border-gray-300 rounded overflow-hidden">
            <ClientOnly fallback-tag="div" fallback="Markdown 编辑器加载中...">
              <MdEditor
                v-model="form.content"
                class="min-h-[500px]"
                preview-theme="github"
                code-theme="atom"
              />
            </ClientOnly>
          </div>
        </div>
      </div>

      <!-- Sidebar Settings -->
      <div class="space-y-6">
        <!-- Publish Settings -->
        <div class="bg-white rounded border border-gray-200 shadow-sm">
          <div class="p-4 border-b border-gray-100">
             <h3 class="text-base font-semibold text-gray-900">发布设置</h3>
          </div>
          <div class="p-4 space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">文章状态</label>
              <select
                v-model="form.status"
                class="w-full rounded border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option v-for="status in statusOptions" :key="status" :value="status">
                  {{ status }}
                </option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">最近更新时间</label>
              <input
                v-model="form.updatedAt"
                type="datetime-local"
                class="w-full rounded border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">封面图地址</label>
              <input
                v-model="form.cover"
                type="url"
                placeholder="https://..."
                class="w-full rounded border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
              <div class="mt-2 rounded border border-gray-200 overflow-hidden bg-gray-50 aspect-video">
                <img
                  v-if="form.cover || defaultCover"
                  :src="form.cover || defaultCover"
                  :alt="form.title"
                  class="h-full w-full object-cover"
                >
              </div>
            </div>

            <div class="flex items-center justify-between mt-2">
              <div>
                <label class="text-sm font-medium text-gray-700">设为精选文章</label>
                <p class="text-xs text-gray-500">首页优先展示</p>
              </div>
              <input v-model="form.featured" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500">
            </div>
          </div>
        </div>

        <!-- Meta Info -->
        <div class="bg-white rounded border border-gray-200 shadow-sm">
          <div class="p-4 border-b border-gray-100">
             <h3 class="text-base font-semibold text-gray-900">分类与标签</h3>
          </div>
          <div class="p-4 space-y-5">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">分类</label>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="category in categoryOptions"
                  :key="category"
                  type="button"
                  :class="[
                    'rounded px-2.5 py-1 text-xs font-medium transition border',
                    category === form.category
                      ? 'bg-blue-50 border-blue-200 text-blue-700'
                      : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50',
                  ]"
                  @click="form.category = category"
                >
                  {{ category }}
                </button>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">标签</label>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="tag in tagOptions"
                  :key="tag"
                  type="button"
                  :class="[
                    'rounded px-2.5 py-1 text-xs font-medium transition border',
                    form.tags.includes(tag)
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50',
                  ]"
                  @click="toggleTag(tag)"
                >
                  {{ tag }}
                </button>
              </div>
            </div>

            <div class="grid gap-3 pt-2 border-t border-gray-100">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">作者</label>
                <input
                  v-model="form.author"
                  type="text"
                  class="w-full rounded border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">创建时间</label>
                <input
                  v-model="form.createdAt"
                  type="date"
                  class="w-full rounded border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
