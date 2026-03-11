<script setup lang="ts">
import { useRoute } from 'vue-router'
const route = useRoute()

const navigationItems = [
  {
    label: '仪表盘',
    description: '总览数据',
    to: '/admin',
    icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z'
  },
  {
    label: '文章管理',
    description: '列表与筛选',
    to: '/admin/articles',
    icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10'
  },
  {
    label: '新建文章',
    description: '内容编辑',
    to: '/admin/articles/create',
    icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z'
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
  <div class="min-h-screen bg-gray-100 text-gray-900 font-sans flex">
    <!-- Sidebar -->
    <aside class="w-64 flex-shrink-0 border-r border-gray-200 bg-white hidden lg:flex flex-col z-10">
      <div class="h-16 flex items-center px-6 border-b border-gray-200">
        <NuxtLink to="/" class="flex items-center gap-2">
          <div class="flex h-7 w-7 items-center justify-center rounded bg-blue-600 text-xs font-bold text-white">
            CMS
          </div>
          <span class="text-base font-bold text-gray-800">栈文管理系统</span>
        </NuxtLink>
      </div>

      <div class="flex-1 overflow-y-auto py-4 px-3">
        <div class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-3">
          导航模块
        </div>
        <nav class="space-y-1">
          <NuxtLink
            v-for="item in navigationItems"
            :key="item.to"
            :to="item.to"
            :class="[
              'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
              isActiveLink(item.to)
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
            ]"
          >
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="item.icon" />
            </svg>
            {{ item.label }}
          </NuxtLink>
        </nav>
      </div>
      
      <div class="p-4 border-t border-gray-200">
        <NuxtLink
          to="/"
          class="flex items-center justify-center gap-2 rounded text-sm font-medium text-gray-600 border border-gray-300 bg-white px-4 py-2 transition hover:bg-gray-50"
        >
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          返回前台站点
        </NuxtLink>
      </div>
    </aside>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col min-w-0">
      <!-- Header -->
      <header class="h-16 flex items-center justify-between border-b border-gray-200 bg-white px-6 shadow-sm z-10">
        <div class="flex items-center gap-4">
          <!-- Mobile Menu Button (Optional, not implemented but space reserved) -->
          <button class="lg:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-md">
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          <div>
            <h1 class="text-lg font-semibold text-gray-800">{{ getActiveNavigationItem().label }}</h1>
          </div>
        </div>

        <div class="flex items-center gap-4">
          <div class="hidden sm:flex items-center rounded-md border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs text-gray-500">
             <span class="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
             SQLite + Server API
          </div>
          <div class="h-8 w-8 rounded-full bg-gray-200 border border-gray-300 flex items-center justify-center overflow-hidden">
            <svg class="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        </div>
      </header>

      <!-- Main Slot Area -->
      <main class="flex-1 overflow-auto p-6 lg:p-8">
        <div class="mx-auto max-w-7xl">
          <slot />
        </div>
      </main>
    </div>
  </div>
</template>
