<template>
  <div class="min-h-screen bg-stone-50 text-slate-900">
    <div class="fixed inset-x-0 top-0 -z-10 h-80 bg-[radial-gradient(circle_at_top,rgba(14,165,233,0.12),transparent_55%)]" />

    <header class="sticky top-0 z-30 border-b border-slate-200/80 bg-stone-50/90 backdrop-blur">
      <div class="mx-auto flex w-full max-w-6xl items-center justify-between gap-6 px-6 py-4 sm:px-8 lg:px-10">
        <NuxtLink to="/" class="flex items-center gap-3">
          <div class="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-sm font-semibold text-white shadow-sm">
            栈文
          </div>
          <div>
            <p class="text-sm font-medium text-slate-900">栈文内容站</p>
            <p class="text-xs text-slate-500">前端实践、内容设计与运营观察</p>
          </div>
        </NuxtLink>

        <nav class="flex items-center gap-2 text-sm">
          <NuxtLink
            to="/"
            class="rounded-full px-4 py-2 font-medium text-slate-600 transition hover:bg-white hover:text-slate-950"
          >
            首页
          </NuxtLink>
          <a
            href="#latest-posts"
            class="hidden rounded-full px-4 py-2 font-medium text-slate-600 transition hover:bg-white hover:text-slate-950 sm:inline-flex"
          >
            最新文章
          </a>
          <NuxtLink
            to="/admin"
            class="rounded-full border border-slate-200 bg-white px-4 py-2 font-medium text-slate-700 transition hover:border-slate-300 hover:text-slate-950"
          >
            内容后台
          </NuxtLink>
        </nav>
      </div>
    </header>

    <main class="mx-auto w-full max-w-6xl px-6 py-10 sm:px-8 lg:px-10 lg:py-12">
      <slot />
    </main>

    <footer class="border-t border-slate-200 bg-white/80">
      <div class="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-8 sm:px-8 md:flex-row md:items-center md:justify-between lg:px-10">
        <div>
          <p class="text-sm font-medium text-slate-900">栈文内容站</p>
          <p class="mt-1 text-sm leading-6 text-slate-500">
            关注前端产品、内容表达与博客系统实践，提供更舒适的阅读与整理体验。
          </p>
        </div>
        <div class="flex flex-wrap gap-3 text-sm text-slate-500">
          <NuxtLink to="/" class="transition hover:text-slate-900">首页</NuxtLink>
          <NuxtLink to="/admin/articles" class="transition hover:text-slate-900">文章管理</NuxtLink>
          <NuxtLink to="/admin/articles/create" class="transition hover:text-slate-900">写文章</NuxtLink>
        </div>
      </div>
    </footer>
  </div>
</template>