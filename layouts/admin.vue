<script setup lang="ts">
import { useRoute } from 'vue-router'
const route = useRoute()

const navigationItems = [
  {
    label: '仪表盘',
    description: '总览数据',
    to: '/admin',
  },
  {
    label: '文章管理',
    description: '列表与筛选',
    to: '/admin/articles',
  },
  {
    label: '新建文章',
    description: '内容编辑',
    to: '/admin/articles/create',
  },
]

const isActiveLink = (to: string) => {
  if (to === '/admin') {
    return route.path === to
  }

  return route.path.startsWith(to)
}

const getActiveNavigationItem = () =>
  navigationItems.find((item) => isActiveLink(item.to)) ?? navigationItems[0]
</script>

<template>
  <div class="min-h-screen bg-stone-100 text-slate-900">
    <div class="mx-auto grid min-h-screen max-w-[1600px] lg:grid-cols-[280px_minmax(0,1fr)]">
      <aside class="border-b border-slate-800 bg-slate-950 px-6 py-8 text-slate-200 lg:border-b-0 lg:border-r lg:px-7">
        <NuxtLink to="/" class="flex items-center gap-3">
          <div class="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-sm font-semibold text-slate-950">
            栈文
          </div>
          <div>
            <p class="text-sm text-slate-400">Content Studio</p>
            <p class="text-base font-semibold text-white">内容后台</p>
          </div>
        </NuxtLink>

        <div class="mt-8 rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
          <p class="text-xs uppercase tracking-[0.3em] text-slate-500">Workspace</p>
          <p class="mt-3 text-lg font-semibold text-white">内容管理中心</p>
          <p class="mt-2 text-sm leading-6 text-slate-400">
            统一管理文章、分类信息与内容状态，让前台展示与后台维护保持同步。
          </p>
          <NuxtLink
            to="/"
            class="mt-5 inline-flex rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-white/20 hover:bg-white/5 hover:text-white"
          >
            查看前台站点
          </NuxtLink>
        </div>

        <nav class="mt-8 space-y-3">
          <NuxtLink
            v-for="item in navigationItems"
            :key="item.to"
            :to="item.to"
            :class="[
              'block rounded-2xl border px-4 py-3 transition',
              isActiveLink(item.to)
                ? 'border-cyan-400/40 bg-cyan-500/15 text-white'
                : 'border-transparent bg-white/5 text-slate-300 hover:border-white/10 hover:bg-white/10 hover:text-white',
            ]"
          >
            <p class="font-medium">{{ item.label }}</p>
            <p class="mt-1 text-sm text-slate-400">{{ item.description }}</p>
          </NuxtLink>
        </nav>

        <div class="mt-8 rounded-[1.75rem] border border-white/10 bg-slate-900 p-5">
          <p class="text-sm font-medium text-white">当前模块</p>
          <p class="mt-2 text-lg font-semibold text-cyan-300">{{ getActiveNavigationItem().label }}</p>
          <p class="mt-2 text-sm leading-6 text-slate-400">{{ getActiveNavigationItem().description }}</p>
        </div>
      </aside>

      <div class="min-w-0">
        <header class="border-b border-slate-200 bg-stone-100/85 px-6 py-5 backdrop-blur md:px-8">
          <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p class="text-sm text-slate-500">Blog Management System</p>
              <h1 class="text-2xl font-semibold text-slate-950">{{ getActiveNavigationItem().label }}</h1>
              <p class="mt-1 text-sm text-slate-500">{{ getActiveNavigationItem().description }}</p>
            </div>

            <div class="flex items-center gap-3">
              <div class="hidden rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-500 sm:block">
                数据来源：SQLite + Server API
              </div>
              <div class="flex h-11 w-11 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white shadow-sm">
                CMS
              </div>
            </div>
          </div>
        </header>

        <main class="p-5 md:p-8">
          <slot />
        </main>
      </div>
    </div>
  </div>
</template>
