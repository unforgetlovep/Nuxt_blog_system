<script setup lang="ts">
import { MdEditor } from 'md-editor-v3'
import 'md-editor-v3/lib/style.css'
import type { BlogArticle, ArticleStatus } from '~~/shared/types/article'
import { useUserStore } from '~~/stores/user'

const route = useRoute()
const userStore = useUserStore()

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

const isAdmin = computed(() => userStore.user?.role === 'admin')

const categoryOptions = ['效率工具', '生活方式', '数码评测', '经验分享', '商业观点']
const tagOptions = ['苹果', '效率', '硬件', 'NAS', '软件', '咖啡', '知识管理']
const statusOptions: ArticleStatus[] = ['草稿', '待审核', '已发布']
const defaultCover = 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80'

// 新建模式默认空白，编辑模式由 article prop 填充
const createInitialArticle = (): BlogArticle => ({
  id: 0,
  slug: '',
  title: '',
  summary: '',
  content: '',
  status: '待审核',
  updatedAt: new Date().toISOString().slice(0, 16),
  createdAt: new Date().toISOString().slice(0, 10),
  category: categoryOptions[0],
  author: userStore.user?.username || '',
  tags: [],
  views: 0,
  readTime: '1 分钟',
  cover: '',
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
const customTagInput = ref('')

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

  // 新建模式下作者固定取当前登录用户
  if (props.mode === 'create') {
    nextArticle.author = userStore.user?.username || nextArticle.author
    nextArticle.createdAt = new Date().toISOString().slice(0, 10)
  }

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
  normalizedArticle.readTime = estimatedReadTime.value
  normalizedArticle.cover = form.cover.trim() || defaultCover
  // 发布/更新时间自动取当前时间
  normalizedArticle.updatedAt = now.slice(0, 10)
  // 新建时作者和创建时间固定取当前用户和当前日期
  normalizedArticle.author = props.mode === 'create'
    ? (userStore.user?.username || 'Admin')
    : (form.author.trim() || 'Admin')
  normalizedArticle.createdAt = props.mode === 'create'
    ? now.slice(0, 10)
    : (form.createdAt || now.slice(0, 10))

  const savedArticleResponse = props.mode === 'create'
    ? await $fetch<{ article: BlogArticle }>('/api/posts', {
        method: 'POST',
        body: Object.fromEntries(
          Object.entries(normalizedArticle).filter(([key]) => key !== 'id')
        ),
      })
    : await $fetch<{ article: BlogArticle }>(`/api/posts/${props.article?.slug}`, {
        method: 'PUT',
        body: Object.fromEntries(
          Object.entries(normalizedArticle).filter(([key]) => key !== 'id')
        ),
      })

  const savedArticle = savedArticleResponse.article

  Object.assign(form, cloneArticle(savedArticle))
  removeSavedDraft()

  lastSavedAt.value = now
  lastSavedSnapshot.value = serializeArticle(savedArticle)
  submitMessage.value = props.mode === 'create'
    ? '文章已保存。'
    : '文章更新成功。'

  const basePath = isAdmin.value && route.path.startsWith('/admin')
    ? '/admin/articles'
    : '/posts/write'

  if (props.mode === 'create') {
    if (basePath === '/posts/write') {
      await navigateTo(`${basePath}?slug=${savedArticle.slug}`)
    } else {
      await navigateTo(`${basePath}/${savedArticle.slug}`)
    }
    return
  }

  if (props.article?.slug && props.article.slug !== savedArticle.slug) {
    if (basePath === '/posts/write') {
      await navigateTo(`${basePath}?slug=${savedArticle.slug}`)
    } else {
      await navigateTo(`${basePath}/${savedArticle.slug}`)
    }
    return
  }

  if (basePath === '/posts/write') {
    await router.replace(`${basePath}?slug=${savedArticle.slug}`)
  } else {
    await router.replace(`${basePath}/${savedArticle.slug}`)
  }
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

const addCustomTag = () => {
  const tag = customTagInput.value.trim()
  if (!tag || form.tags.includes(tag)) {
    customTagInput.value = ''
    return
  }
  form.tags = [...form.tags, tag]
  customTagInput.value = ''
}

const removeTag = (tag: string) => {
  // 仅允许移除不在预设列表中的自定义标签
  if (!tagOptions.includes(tag)) {
    form.tags = form.tags.filter((item) => item !== tag)
  }
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
            <label class="block text-sm font-medium text-gray-700 mb-1">
              标识 (Slug)
              <span class="ml-1 text-xs font-normal text-gray-400">自动生成，可手动修改</span>
            </label>
            <input
              v-model="form.slug"
              type="text"
              placeholder="auto-generated-from-title"
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
            placeholder="简要描述文章内容，将显示在文章列表中（建议 50-120 字）"
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
            <!-- 文章状态：仅管理员可见 -->
            <div v-if="isAdmin">
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
              <label class="block text-sm font-medium text-gray-700 mb-1">封面图地址</label>
              <input
                v-model="form.cover"
                type="url"
                placeholder="https://... （留空将使用默认封面）"
                class="w-full rounded border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
              <div class="mt-2 rounded border border-gray-200 overflow-hidden bg-gray-50 aspect-video">
                <img
                  :src="form.cover || defaultCover"
                  :alt="form.title || '封面预览'"
                  class="h-full w-full object-cover"
                >
              </div>
            </div>

            <!-- 精选文章：仅管理员可见 -->
            <div v-if="isAdmin" class="flex items-center justify-between mt-2">
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
              <!-- 预设标签 -->
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

              <!-- 已添加的自定义标签 -->
              <div v-if="form.tags.some(t => !tagOptions.includes(t))" class="flex flex-wrap gap-2 mt-2">
                <span
                  v-for="tag in form.tags.filter(t => !tagOptions.includes(t))"
                  :key="tag"
                  class="inline-flex items-center gap-1 rounded px-2.5 py-1 text-xs font-medium bg-purple-50 border border-purple-200 text-purple-700"
                >
                  {{ tag }}
                  <button type="button" class="hover:text-purple-900 leading-none" @click="removeTag(tag)">×</button>
                </span>
              </div>

              <!-- 自定义标签输入 -->
              <div class="mt-3 flex gap-2">
                <input
                  v-model="customTagInput"
                  type="text"
                  placeholder="自定义标签…"
                  maxlength="20"
                  class="flex-1 min-w-0 rounded border border-gray-300 px-2.5 py-1.5 text-xs text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  @keydown.enter.prevent="addCustomTag"
                >
                <button
                  type="button"
                  class="rounded border border-gray-300 px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 transition whitespace-nowrap"
                  @click="addCustomTag"
                >
                  添加
                </button>
              </div>
            </div>

            <!-- 作者与时间（只读展示） -->
            <div class="grid gap-3 pt-2 border-t border-gray-100">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">作者</label>
                <div class="w-full rounded border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-500">
                  {{ form.author || userStore.user?.username || '—' }}
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  {{ mode === 'create' ? '创建时间' : '创建时间' }}
                </label>
                <div class="w-full rounded border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-500">
                  {{ mode === 'create' ? new Date().toLocaleDateString('zh-CN') : form.createdAt }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
