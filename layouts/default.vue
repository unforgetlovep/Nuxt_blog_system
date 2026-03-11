<script setup lang="ts">
const route = useRoute()
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

          <nav class="hidden md:flex items-center gap-6 text-[14px] font-medium text-gray-600">
            <a href="#" class="hover:text-gray-900 transition-colors flex items-center gap-1">
              <svg class="w-[15px] h-[15px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
              共创
            </a>
            <a href="#" class="hover:text-gray-900 transition-colors flex items-center gap-1">
              <svg class="w-[15px] h-[15px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
              PRIME
            </a>
            <a href="#" class="hover:text-gray-900 transition-colors flex items-center gap-1">
              <svg class="w-[15px] h-[15px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5"></path></svg>
              Matrix
            </a>
            <a href="#" class="hover:text-gray-900 transition-colors flex items-center gap-1">
              <svg class="w-[15px] h-[15px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
              栏目
            </a>
            <a href="#" class="hover:text-gray-900 transition-colors flex items-center gap-1">
              <svg class="w-[15px] h-[15px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
              Pi Store
            </a>
          </nav>
        </div>

        <!-- Right: Actions -->
        <div class="flex items-center gap-6 text-gray-400">
          <button class="hover:text-gray-900 transition-colors">
            <svg class="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          </button>
          <NuxtLink to="/admin/articles/create" class="hover:text-gray-900 transition-colors">
            <svg class="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
          </NuxtLink>
          <NuxtLink to="/admin" class="hover:text-gray-900 transition-colors">
            <svg class="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
          </NuxtLink>
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
            <NuxtLink to="/admin" class="hover:text-gray-600 transition">管理系统</NuxtLink>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>
