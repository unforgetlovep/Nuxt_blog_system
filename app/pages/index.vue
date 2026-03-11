<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Autoplay as SwiperAutoplay, Pagination as SwiperPagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/pagination'
import 'swiper/css/autoplay'
import type { BlogArticle } from '~~/shared/types/article'

interface ArticlesResponse {
  stats: {
    total: number
    published: number
    draft: number
    review: number
  }
  categories: string[]
  list: BlogArticle[]
}

const activeCategory = ref('全部')

const { data } = await useFetch<ArticlesResponse>('/api/posts', {
  query: computed(() => ({
    status: '已发布',
    sort: 'updatedAt',
    category: activeCategory.value === '全部' ? undefined : activeCategory.value
  })),
})

const articleList = computed(() => data.value?.list ?? [])

// Fix: Extract categories once and keep them stable to prevent leftNav from changing/re-rendering
const initialCategories = data.value?.categories || ['全部']

// Infinite Scroll
const pageSize = 10
const page = ref(1)

watch(activeCategory, () => {
  page.value = 1
})
const displayedArticles = computed(() => {
  return articleList.value.slice(0, page.value * pageSize)
})
const hasMore = computed(() => displayedArticles.value.length < articleList.value.length)

const handleScroll = () => {
  const bottomOfWindow = document.documentElement.scrollTop + window.innerHeight >= document.documentElement.offsetHeight - 100
  if (bottomOfWindow && hasMore.value) {
    page.value++
  }
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})

const iconMap: Record<string, string> = {
  '全部': 'home',
  '生活方式': 'heart',
  '效率工具': 'trending-up',
  '数码评测': 'message-circle'
}

const leftNav = computed(() => {
  return initialCategories.map(name => ({
    icon: iconMap[name] || 'grid',
    name
  }))
})

const { data: popularData } = await useFetch<ArticlesResponse>('/api/posts', {
  query: {
    status: '已发布',
    sort: 'views', // Get top viewed
  },
})

const popularArticles = computed(() => {
  return (popularData.value?.list ?? []).slice(0, 5)
})

// To match image 2 layout: left navigation and right widgets
</script>

<style scoped>
:deep(.swiper-pagination-bullet) {
  background: white;
  opacity: 0.5;
}
:deep(.swiper-pagination-bullet-active) {
  background: white;
  opacity: 1;
}
</style>

<template>
  <div class="grid grid-cols-1 lg:grid-cols-[180px_1fr] xl:grid-cols-[180px_1fr_280px] gap-8 xl:gap-16 items-start mt-6">
    
    <!-- Left Sidebar -->
    <aside class="hidden lg:flex flex-col sticky top-24 h-[calc(100vh-6rem)] justify-between pb-8">
      <!-- Navigation -->
      <nav class="space-y-1">
        <a 
          v-for="item in leftNav" 
          :key="item.name"
          href="#"
          @click.prevent="activeCategory = item.name"
          :class="[
            'flex items-center gap-3 px-4 py-3 rounded-xl text-[15px] font-medium transition-colors',
            activeCategory === item.name ? 'bg-gray-100 text-gray-900 font-bold' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
          ]"
        >
          <svg v-if="item.icon === 'home'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
          <svg v-else-if="item.icon === 'grid'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
          <svg v-else-if="item.icon === 'message-circle'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
          <svg v-else-if="item.icon === 'trending-up'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
          <svg v-else-if="item.icon === 'heart'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
          {{ item.name }}
        </a>
      </nav>

      <!-- Footer Info -->
      <div class="text-[11px] text-gray-400 space-y-1.5 px-4 mt-auto">
        <p>&copy; 2026</p>
        <p>深圳技术大学学生设计</p>
        <p>SZTU</p>
      </div>
    </aside>

    <!-- Center Feed -->
    <div class="space-y-6 min-h-[calc(100vh-6rem)] mt-6 min-w-0">
      <!-- Popular Articles Swiper -->
      <div v-if="popularArticles.length > 0" class="mb-8 rounded-xl overflow-hidden shadow-sm relative group cursor-pointer">
        <Swiper
          :modules="[SwiperAutoplay, SwiperPagination]"
          :slides-per-view="1"
          :loop="true"
          :autoplay="{ delay: 5000, disableOnInteraction: false }"
          :pagination="{ clickable: true }"
          class="w-full aspect-[2/1] sm:aspect-[21/9]"
        >
          <SwiperSlide v-for="article in popularArticles" :key="article.slug">
            <NuxtLink :to="`/posts/${article.slug}`" class="block w-full h-full relative group/slide">
              <img :src="article.cover" :alt="article.title" class="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover/slide:scale-105" />
              <!-- Gradient Overlay -->
              <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
              <!-- Content -->
              <div class="absolute bottom-0 left-0 right-0 p-6 sm:p-8 text-white z-10">
                <span class="inline-block px-2.5 py-1 bg-[#D71A1B] text-xs font-bold rounded mb-3">HOT</span>
                <h2 class="text-xl sm:text-2xl font-bold leading-snug mb-2 line-clamp-2 group-hover/slide:text-[#D71A1B] transition-colors">{{ article.title }}</h2>
                <div class="flex items-center gap-3 text-sm text-gray-300">
                  <span>{{ article.author }}</span>
                  <span>·</span>
                  <span>{{ article.views }} 阅读</span>
                </div>
              </div>
            </NuxtLink>
          </SwiperSlide>
        </Swiper>
      </div>

      <div class="space-y-6">
        <article
          v-for="article in displayedArticles"
          :key="article.slug"
          class="group flex flex-col-reverse sm:flex-row gap-5 sm:gap-8 justify-between items-start border-b border-gray-100 pb-6 last:border-0"
        >
          <div class="flex-1 flex flex-col pt-1 w-full">
            <NuxtLink :to="`/posts/${article.slug}`">
              <h3 class="text-[18px] sm:text-[20px] font-medium leading-snug text-gray-900 group-hover:text-[#D71A1B] transition-colors mb-3 line-clamp-2">
                {{ article.title }}
              </h3>
            </NuxtLink>
            
            <div class="mt-auto flex items-center gap-2 text-xs">
              <!-- Avatar -->
              <div v-if="article.author !== '少数派编辑部'" class="w-5 h-5 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center shrink-0">
                <img v-if="false" src="" alt="avatar" class="w-full h-full object-cover" />
                <span class="text-[10px] text-gray-500 font-bold">{{ article.author?.charAt(0) || 'M' }}</span>
              </div>
              <div v-else class="flex h-5 w-5 items-center justify-center rounded-full bg-black text-white text-[10px] font-bold shrink-0">
                π
              </div>

              <!-- Author Name -->
              <span class="font-medium text-gray-500">{{ article.author || 'Microhoo' }}</span>
              
              <!-- Time -->
              <span class="text-gray-400">{{ article.updatedAt }}</span>
              
              <!-- Tag -->
              <span v-if="article.category === '少数派' || article.author === '少数派编辑部'" class="text-[#D71A1B] ml-1 flex items-center gap-1">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"></path></svg>
                派早报
              </span>
            </div>
          </div>
          
          <!-- Cover -->
          <NuxtLink 
            :to="`/posts/${article.slug}`" 
            class="w-full sm:w-[220px] shrink-0 aspect-[16/10] sm:aspect-[4/3] rounded-md overflow-hidden bg-gray-100 relative"
          >
            <img :src="article.cover" :alt="article.title" class="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
          </NuxtLink>
        </article>
      </div>

      <!-- Loading / No more data -->
      <div class="py-8 text-center text-[13px] text-gray-400">
        <span v-if="hasMore" class="flex items-center justify-center gap-2">
          <svg class="w-4 h-4 animate-spin text-gray-400" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          加载中...
        </span>
        <span v-else>别滑了，已经到底了</span>
      </div>
    </div>

    <!-- Right Sidebar -->
    <aside class="hidden xl:block space-y-10 sticky top-24">
      <!-- "派友在看" -->
      <div>
        <h3 class="text-[15px] font-bold text-gray-900 mb-5">派友在看</h3>
        <ul class="space-y-5">
          <li v-for="i in 3" :key="i" class="group cursor-pointer">
            <h4 class="text-[13px] font-medium text-gray-800 leading-relaxed group-hover:text-[#D71A1B] transition-colors line-clamp-2">
              {{ ['商业、刻板偏见：Arrows N 与富士通的退场', '年度征文 | 2026 年启示：一个拥抱开源模型 AI 外包数的思考', 'AI 不会「吹」掉你，但懒怠可能会去掉你骨了经'][i-1] }}
            </h4>
            <p class="text-[11px] text-gray-400 mt-1.5">{{ ['Matrix精选', '派友观点', '脑洞带货'][i-1] }}</p>
          </li>
        </ul>
      </div>

      <!-- Banners -->
      <div class="space-y-3">
        <div class="rounded-lg overflow-hidden bg-gray-100 cursor-pointer hover:opacity-90 transition-opacity aspect-[2/1] relative">
          <img src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=400&auto=format&fit=crop" alt="Banner 1" class="absolute inset-0 w-full h-full object-cover" />
          <div class="absolute inset-0 bg-black/40 flex items-center justify-center p-4">
            <span class="text-white font-bold text-sm">社区速递</span>
          </div>
        </div>
        <div class="rounded-lg overflow-hidden bg-blue-600 cursor-pointer hover:opacity-90 transition-opacity flex items-center justify-center h-20 text-white font-bold relative">
          <svg class="absolute -left-4 -bottom-4 w-20 h-20 text-blue-500 opacity-50" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
          <span class="relative z-10">会员社区</span>
        </div>
      </div>

      <!-- Footer Icons -->
      <div>
        <div class="flex items-center gap-5 text-gray-400 mb-4">
          <button class="hover:text-gray-900 transition-colors">
            <svg class="w-[18px] h-[18px]" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
          </button>
          <button class="hover:text-gray-900 transition-colors">
            <svg class="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
          </button>
          <button class="hover:text-gray-900 transition-colors">
            <svg class="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"></path></svg>
          </button>
          <button class="hover:text-gray-900 transition-colors">
            <svg class="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 5c7.18 0 13 5.82 13 13M6 11a7 7 0 017 7m-6 0v.01"></path></svg>
          </button>
        </div>
        <div class="flex items-center gap-3 text-[11px] text-gray-400">
          <a href="#" class="hover:text-gray-600 transition">关于我们</a>
          <a href="#" class="hover:text-gray-600 transition">用户协议</a>
          <a href="#" class="hover:text-gray-600 transition">常见问题</a>
        </div>
      </div>
    </aside>
  </div>
</template>
