<script setup lang="ts">
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import TextAlign from '@tiptap/extension-text-align'

interface Props {
  modelValue: string
  placeholder?: string
  uploadImage?: (file: File) => Promise<string>
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '开始撰写文章正文…',
  uploadImage: undefined,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const imageFileRef = ref<HTMLInputElement | null>(null)
const isImageUploading = ref(false)

const editor = useEditor({
  content: props.modelValue,
  extensions: [
    StarterKit,
    Underline,
    Image.configure({ inline: false }),
    Placeholder.configure({ placeholder: props.placeholder }),
    Link.configure({
      openOnClick: false,
      HTMLAttributes: { rel: 'noopener noreferrer', target: '_blank' },
    }),
    TextAlign.configure({ types: ['heading', 'paragraph'] }),
  ],
  onUpdate({ editor: e }) {
    emit('update:modelValue', e.getHTML())
  },
})

watch(
  () => props.modelValue,
  (value) => {
    if (!editor.value) return
    if (editor.value.getHTML() !== value) {
      editor.value.commands.setContent(value || '');
    }
  },
)

onBeforeUnmount(() => editor.value?.destroy())

const setLink = () => {
  const previous = editor.value?.getAttributes('link').href as string ?? ''
  const url = window.prompt('请输入链接地址：', previous)
  if (url === null) return
  if (url === '') {
    editor.value?.chain().focus().extendMarkRange('link').unsetLink().run()
    return
  }
  editor.value?.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
}

const triggerImageUpload = () => imageFileRef.value?.click()

const handleImageFileChange = async (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file || !props.uploadImage) return
  isImageUploading.value = true
  try {
    const url = await props.uploadImage(file)
    editor.value?.chain().focus().setImage({ src: url }).run()
  }
  catch (err) {
    console.error('[TiptapEditor] 图片上传失败：', err)
  }
  finally {
    isImageUploading.value = false
    input.value = ''
  }
}
</script>

<template>
  <div class="tiptap-editor">
    <!-- Toolbar -->
    <div v-if="editor" class="tiptap-editor__toolbar">
      <!-- 撤销 / 重做 -->
      <button
        type="button"
        title="撤销"
        class="tiptap-btn"
        :disabled="!editor.can().undo()"
        @click="editor.chain().focus().undo().run()"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 7v6h6" /><path d="M3 13C5.27 8.16 10.27 5 16 5c5 0 9 3.58 9 8s-4 8-9 8c-2.7 0-5.12-1.1-6.9-2.88" />
        </svg>
      </button>
      <button
        type="button"
        title="重做"
        class="tiptap-btn"
        :disabled="!editor.can().redo()"
        @click="editor.chain().focus().redo().run()"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 7v6h-6" /><path d="M21 13c-2.27-4.84-7.27-8-13-8C3 5 -1 8.58-1 13s4 8 9 8c2.7 0 5.12-1.1 6.9-2.88" />
        </svg>
      </button>

      <div class="tiptap-divider" />

      <!-- 文字格式 -->
      <button
        type="button"
        title="加粗"
        :class="['tiptap-btn', { 'is-active': editor.isActive('bold') }]"
        @click="editor.chain().focus().toggleBold().run()"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" /><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
        </svg>
      </button>
      <button
        type="button"
        title="斜体"
        :class="['tiptap-btn', { 'is-active': editor.isActive('italic') }]"
        @click="editor.chain().focus().toggleItalic().run()"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <line x1="19" y1="4" x2="10" y2="4" /><line x1="14" y1="20" x2="5" y2="20" /><line x1="15" y1="4" x2="9" y2="20" />
        </svg>
      </button>
      <button
        type="button"
        title="下划线"
        :class="['tiptap-btn', { 'is-active': editor.isActive('underline') }]"
        @click="editor.chain().focus().toggleUnderline().run()"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3" /><line x1="4" y1="21" x2="20" y2="21" />
        </svg>
      </button>
      <button
        type="button"
        title="删除线"
        :class="['tiptap-btn', { 'is-active': editor.isActive('strike') }]"
        @click="editor.chain().focus().toggleStrike().run()"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <line x1="4" y1="12" x2="20" y2="12" /><path d="M17.5 5.5C17 4 15.5 3 13.5 3c-2.5 0-4.5 1.5-4.5 4 0 .9.3 1.7.8 2.3" /><path d="M6.5 17.5C7 19.5 9 21 11.5 21c3 0 5-1.5 5-4 0-.9-.3-1.7-.8-2.3" />
        </svg>
      </button>
      <button
        type="button"
        title="行内代码"
        :class="['tiptap-btn', { 'is-active': editor.isActive('code') }]"
        @click="editor.chain().focus().toggleCode().run()"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
        </svg>
      </button>

      <div class="tiptap-divider" />

      <!-- 标题 -->
      <button
        type="button"
        title="标题 H1"
        :class="['tiptap-btn tiptap-btn--text', { 'is-active': editor.isActive('heading', { level: 1 }) }]"
        @click="editor.chain().focus().toggleHeading({ level: 1 }).run()"
      >
        H1
      </button>
      <button
        type="button"
        title="标题 H2"
        :class="['tiptap-btn tiptap-btn--text', { 'is-active': editor.isActive('heading', { level: 2 }) }]"
        @click="editor.chain().focus().toggleHeading({ level: 2 }).run()"
      >
        H2
      </button>
      <button
        type="button"
        title="标题 H3"
        :class="['tiptap-btn tiptap-btn--text', { 'is-active': editor.isActive('heading', { level: 3 }) }]"
        @click="editor.chain().focus().toggleHeading({ level: 3 }).run()"
      >
        H3
      </button>

      <div class="tiptap-divider" />

      <!-- 列表 -->
      <button
        type="button"
        title="无序列表"
        :class="['tiptap-btn', { 'is-active': editor.isActive('bulletList') }]"
        @click="editor.chain().focus().toggleBulletList().run()"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="9" y1="6" x2="20" y2="6" /><line x1="9" y1="12" x2="20" y2="12" /><line x1="9" y1="18" x2="20" y2="18" />
          <circle cx="4" cy="6" r="1.5" fill="currentColor" stroke="none" /><circle cx="4" cy="12" r="1.5" fill="currentColor" stroke="none" /><circle cx="4" cy="18" r="1.5" fill="currentColor" stroke="none" />
        </svg>
      </button>
      <button
        type="button"
        title="有序列表"
        :class="['tiptap-btn', { 'is-active': editor.isActive('orderedList') }]"
        @click="editor.chain().focus().toggleOrderedList().run()"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="10" y1="6" x2="21" y2="6" /><line x1="10" y1="12" x2="21" y2="12" /><line x1="10" y1="18" x2="21" y2="18" />
          <path d="M4 6h1v4" stroke="currentColor" stroke-width="1.5" /><path d="M4 10h2" stroke="currentColor" stroke-width="1.5" />
          <path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1" stroke="currentColor" stroke-width="1.5" />
        </svg>
      </button>

      <div class="tiptap-divider" />

      <!-- 块元素 -->
      <button
        type="button"
        title="引用块"
        :class="['tiptap-btn', { 'is-active': editor.isActive('blockquote') }]"
        @click="editor.chain().focus().toggleBlockquote().run()"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
          <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z" />
          <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z" />
        </svg>
      </button>
      <button
        type="button"
        title="代码块"
        :class="['tiptap-btn', { 'is-active': editor.isActive('codeBlock') }]"
        @click="editor.chain().focus().toggleCodeBlock().run()"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /><line x1="12" y1="2" x2="12" y2="22" />
        </svg>
      </button>
      <button
        type="button"
        title="分割线"
        class="tiptap-btn"
        @click="editor.chain().focus().setHorizontalRule().run()"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
          <line x1="2" y1="12" x2="22" y2="12" />
        </svg>
      </button>

      <div class="tiptap-divider" />

      <!-- 对齐 -->
      <button
        type="button"
        title="左对齐"
        :class="['tiptap-btn', { 'is-active': editor.isActive({ textAlign: 'left' }) }]"
        @click="editor.chain().focus().setTextAlign('left').run()"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="15" y2="12" /><line x1="3" y1="18" x2="18" y2="18" />
        </svg>
      </button>
      <button
        type="button"
        title="居中对齐"
        :class="['tiptap-btn', { 'is-active': editor.isActive({ textAlign: 'center' }) }]"
        @click="editor.chain().focus().setTextAlign('center').run()"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <line x1="3" y1="6" x2="21" y2="6" /><line x1="6" y1="12" x2="18" y2="12" /><line x1="4" y1="18" x2="20" y2="18" />
        </svg>
      </button>
      <button
        type="button"
        title="右对齐"
        :class="['tiptap-btn', { 'is-active': editor.isActive({ textAlign: 'right' }) }]"
        @click="editor.chain().focus().setTextAlign('right').run()"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <line x1="3" y1="6" x2="21" y2="6" /><line x1="9" y1="12" x2="21" y2="12" /><line x1="6" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      <div class="tiptap-divider" />

      <!-- 链接 / 图片 -->
      <button
        type="button"
        title="插入 / 编辑链接"
        :class="['tiptap-btn', { 'is-active': editor.isActive('link') }]"
        @click="setLink"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </svg>
      </button>
      <button
        v-if="uploadImage"
        type="button"
        title="上传图片"
        class="tiptap-btn"
        :disabled="isImageUploading"
        @click="triggerImageUpload"
      >
        <svg
          v-if="!isImageUploading"
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21 15 16 10 5 21" />
        </svg>
        <svg
          v-else
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          class="animate-spin"
        >
          <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
      </button>
      <input
        ref="imageFileRef"
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml"
        class="hidden"
        @change="handleImageFileChange"
      >
    </div>

    <!-- Editor Content Area -->
    <EditorContent :editor="editor" class="tiptap-editor__content" />
  </div>
</template>

<style>
/* ── 编辑器容器 ── */
.tiptap-editor {
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  overflow: hidden;
  background: #fff;
}

/* ── 工具栏 ── */
.tiptap-editor__toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 2px;
  padding: 6px 8px;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
}

.tiptap-divider {
  width: 1px;
  height: 20px;
  margin: 0 4px;
  background: #d1d5db;
  flex-shrink: 0;
}

/* ── 工具栏按钮 ── */
.tiptap-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 4px;
  background: transparent;
  color: #4b5563;
  cursor: pointer;
  transition: background-color 0.15s, color 0.15s;
}

.tiptap-btn--text {
  width: auto;
  padding: 0 6px;
  font-size: 0.75rem;
  font-weight: 700;
  font-family: inherit;
}

.tiptap-btn:hover:not(:disabled) {
  background: #e5e7eb;
  color: #111827;
}

.tiptap-btn.is-active {
  background: #dbeafe;
  color: #1d4ed8;
}

.tiptap-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

/* ── 编辑区域 ── */
.tiptap-editor__content .tiptap {
  min-height: 500px;
  padding: 1rem 1.25rem;
  outline: none;
  font-size: 0.9375rem;
  line-height: 1.75;
  color: #1f2937;
}

.tiptap-editor__content .tiptap p.is-editor-empty:first-child::before {
  content: attr(data-placeholder);
  float: left;
  color: #9ca3af;
  pointer-events: none;
  height: 0;
}

/* ── 正文排版 ── */
.tiptap-editor__content .tiptap h1 {
  margin: 1.5rem 0 0.75rem;
  font-size: 1.75rem;
  font-weight: 700;
  line-height: 1.3;
  color: #111827;
}

.tiptap-editor__content .tiptap h2 {
  margin: 1.25rem 0 0.625rem;
  font-size: 1.375rem;
  font-weight: 700;
  line-height: 1.35;
  color: #111827;
}

.tiptap-editor__content .tiptap h3 {
  margin: 1rem 0 0.5rem;
  font-size: 1.125rem;
  font-weight: 600;
  line-height: 1.4;
  color: #111827;
}

.tiptap-editor__content .tiptap p {
  margin: 0.5rem 0;
}

.tiptap-editor__content .tiptap ul,
.tiptap-editor__content .tiptap ol {
  padding-left: 1.5rem;
  margin: 0.625rem 0;
}

.tiptap-editor__content .tiptap ul {
  list-style-type: disc;
}

.tiptap-editor__content .tiptap ol {
  list-style-type: decimal;
}

.tiptap-editor__content .tiptap li {
  margin: 0.25rem 0;
}

.tiptap-editor__content .tiptap blockquote {
  margin: 1rem 0;
  padding: 0.5rem 1rem;
  border-left: 4px solid #dc2626;
  background: #f9fafb;
  color: #374151;
  font-style: italic;
}

.tiptap-editor__content .tiptap code {
  padding: 0.15em 0.35em;
  border-radius: 4px;
  background: #f3f4f6;
  color: #dc2626;
  font-size: 0.875em;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
}

.tiptap-editor__content .tiptap pre {
  margin: 1rem 0;
  padding: 1rem 1.25rem;
  border-radius: 6px;
  background: #1e293b;
  overflow-x: auto;
}

.tiptap-editor__content .tiptap pre code {
  padding: 0;
  background: transparent;
  color: #e2e8f0;
  font-size: 0.875rem;
  line-height: 1.7;
}

.tiptap-editor__content .tiptap hr {
  margin: 1.5rem 0;
  border: none;
  border-top: 2px solid #e5e7eb;
}

.tiptap-editor__content .tiptap a {
  color: #2563eb;
  text-decoration: underline;
  text-underline-offset: 2px;
}

.tiptap-editor__content .tiptap a:hover {
  color: #1d4ed8;
}

.tiptap-editor__content .tiptap img {
  max-width: 100%;
  height: auto;
  border-radius: 6px;
  margin: 0.75rem 0;
}

/* 选中图片高亮 */
.tiptap-editor__content .tiptap img.ProseMirror-selectednode {
  outline: 3px solid #3b82f6;
}
</style>
