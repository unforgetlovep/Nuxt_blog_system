<script setup lang="ts">
import { useUserStore } from '~~/stores/user'

const route = useRoute()
const userStore = useUserStore()

const isLoginModalOpen = ref(false)
</script>

<template>
  <div class="min-h-screen bg-white text-gray-900 font-sans">
    <!-- Header -->
    <header class="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-100 transition-all duration-300">
      <div class="mx-auto flex w-full max-w-7xl items-center justify-between h-14 px-4 sm:px-6 lg:px-8">
        <!-- Left: Logo & Nav -->
        <div class="flex items-center gap-10">
          <NuxtLink to="/" class="flex items-center gap-2 group">
            <div class="flex h-7 w-7 items-center justify-center rounded-full bg-[#D71A1B] text-sm font-bold text-white transition-transform group-hover:scale-105">
              π
            </div>
            <div>
              <p class="text-[17px] font-bold text-gray-900 tracking-wide">少数派</p>
            </div>
          </NuxtLink>

          <div class="hidden md:flex items-center gap-6 text-[14px] font-medium text-gray-600">
            <NuxtLink to="/" class="hover:text-gray-900 transition-colors flex items-center gap-1">
              <svg class="w-[15px] h-[15px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
              首页
            </NuxtLink>
            <a href="#" class="hover:text-gray-900 transition-colors flex items-center gap-1">
              <svg class="w-[15px] h-[15px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
              PRIME
            </a>
            <a href="#" class="hover:text-gray-900 transition-colors flex items-center gap-1">
              <svg class="w-[15px] h-[15px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5"></path></svg>
              Matrix
            </a>
          </div>
        </div>

        <!-- Right: Actions -->
        <div class="flex items-center gap-5 text-gray-400">
          <button class="hover:text-gray-900 transition-colors">
            <svg class="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          </button>
          
          <ClientOnly>
            <template v-if="userStore.isAuthenticated">
              <NuxtLink to="/posts/write" class="flex items-center gap-1.5 rounded-full bg-[#D71A1B] px-3 py-1.5 text-xs font-bold text-white transition hover:bg-red-700">
                <svg class="w-[14px] h-[14px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
                写文章
              </NuxtLink>

              <div class="relative group">
                <NuxtLink to="/user/profile" class="flex h-7 w-7 items-center justify-center rounded-full bg-gray-200 text-gray-700 font-bold text-xs hover:ring-2 hover:ring-gray-300 transition-all cursor-pointer">
                  {{ userStore.user?.username.charAt(0).toUpperCase() }}
                </NuxtLink>
                <!-- Dropdown -->
                <div class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div class="px-4 py-3 border-b border-gray-100">
                    <p class="text-sm font-bold text-gray-900">{{ userStore.user?.username }}</p>
                    <p class="text-xs text-gray-500 mt-0.5 truncate">{{ userStore.user?.role === 'admin' ? '管理员' : '普通用户' }}</p>
                  </div>
                  <div class="p-1">
                    <NuxtLink to="/user/profile" class="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md">个人主页</NuxtLink>
                    <NuxtLink v-if="userStore.user?.role === 'admin'" to="/admin" class="block px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-md">管理后台</NuxtLink>
                    <button @click="userStore.logout" class="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md">退出登录</button>
                  </div>
                </div>
              </div>
            </template>
            <template v-else>
              <button @click="isLoginModalOpen = true" class="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">登录 / 注册</button>
            </template>
          </ClientOnly>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <slot />
    </main>

    <!-- Footer (Hidden on home page where sidebars have their own footers) -->
    <footer v-if="route.path !== '/'" class="bg-white border-t border-gray-100 mt-12">
      <div class="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 border-b border-gray-100 pb-8">
          <div class="col-span-1 md:col-span-2">
            <div class="flex items-center gap-2 mb-4">
              <div class="flex h-6 w-6 items-center justify-center rounded-full bg-[#D71A1B] text-xs font-bold text-white">
                π
              </div>
              <p class="text-base font-bold text-gray-900">少数派</p>
            </div>
            <p class="text-sm text-gray-500 leading-relaxed max-w-xs">
              高效工作，品质生活。<br>
              致力于分享数字时代的优质工具、系统方法与美好生活体验。
            </p>
          </div>
          <div>
            <h3 class="text-sm font-bold text-gray-900 mb-4">关于我们</h3>
            <ul class="space-y-3 text-sm text-gray-500">
              <li><a href="#" class="hover:text-[#D71A1B] transition-colors">关于少数派</a></li>
              <li><a href="#" class="hover:text-[#D71A1B] transition-colors">用户协议</a></li>
              <li><a href="#" class="hover:text-[#D71A1B] transition-colors">隐私政策</a></li>
            </ul>
          </div>
          <div>
            <h3 class="text-sm font-bold text-gray-900 mb-4">联系合作</h3>
            <ul class="space-y-3 text-sm text-gray-500">
              <li><a href="#" class="hover:text-[#D71A1B] transition-colors">联系客服</a></li>
              <li><a href="#" class="hover:text-[#D71A1B] transition-colors">商务合作</a></li>
              <li><a href="#" class="hover:text-[#D71A1B] transition-colors">发送邮件</a></li>
            </ul>
          </div>
        </div>
        
        <div class="flex flex-col md:flex-row items-center justify-between text-xs text-gray-400">
          <p>&copy; 2013-2026 深圳少数派网络科技有限公司 少数派</p>
          <div class="mt-2 md:mt-0 flex items-center gap-4">
            <span>Powered by Nuxt & Tailwind CSS</span>
            <NuxtLink v-if="userStore.user?.role === 'admin'" to="/admin" class="hover:text-gray-600 transition">管理系统</NuxtLink>
          </div>
        </div>
      </div>
    </footer>

    <!-- Global Auth Modal -->
    <AuthModal v-model="isLoginModalOpen" />
  </div>
</template>
