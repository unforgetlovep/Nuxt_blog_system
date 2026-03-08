import type { BlogArticle } from '../types/article'

export const mockArticles: BlogArticle[] = [
  {
    id: 1,
    slug: 'nuxt-blog-admin-ui-architecture',
    title: '使用 Nuxt 组织博客后台页面结构',
    summary: '梳理页面布局、路由分层与管理台骨架的实现方式，为后续接入文章 CRUD 做准备。',
    category: '前端开发',
    status: '已发布',
    author: 'Admin',
    updatedAt: '2026-03-08',
    createdAt: '2026-03-06',
    readTime: '8 分钟',
    views: 3280,
    tags: ['Nuxt', 'Vue', '后台系统'],
    cover: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80',
    featured: true,
    content: `## 为什么先做 UI 骨架

对于一个刚初始化的 Nuxt 项目来说，页面结构往往比接口实现更影响后续开发效率。先把首页、后台布局、文章列表和文章编辑页搭起来，可以让后面的状态管理、接口请求和数据库设计都有清晰的落点。

## 这套博客后台当前包含什么

- 前台首页，用于展示项目定位与推荐文章
- 后台仪表盘，用于承载统计卡片和内容流转看板
- 文章管理页，用于文章筛选、检索和跳转编辑
- 文章编辑页，用于承载标题、摘要、正文、分类和发布设置

## 下一步建议

完成 UI 后，最适合继续接入 mock API，把文章列表和详情页改造成真实的数据驱动页面，再考虑接入 Pinia 和数据库。`,
  },
  {
    id: 2,
    slug: 'graduation-project-demo-checklist',
    title: '毕业设计答辩展示稿准备清单',
    summary: '整理系统演示顺序、重点页面和功能说明，让博客管理系统更适合毕业设计展示。',
    category: '产品规划',
    status: '草稿',
    author: 'Admin',
    updatedAt: '2026-03-07',
    createdAt: '2026-03-05',
    readTime: '6 分钟',
    views: 1210,
    tags: ['毕业设计', '答辩', '演示'],
    cover: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
    featured: false,
    content: `## 演示稿的重点

毕业设计的博客系统展示，不仅要说明功能，还要体现产品规划和交互设计的完整性。

## 推荐展示顺序

1. 首页展示系统定位与视觉风格
2. 后台仪表盘展示整体管理能力
3. 文章列表展示筛选与状态管理
4. 编辑页展示内容创作能力

## 还可以补充的内容

如果后续时间允许，可以加入文章详情页、评论管理和分类管理，用来进一步完善系统闭环。`,
  },
  {
    id: 3,
    slug: 'blog-homepage-featured-layout',
    title: '博客首页推荐位设计思路',
    summary: '分析精选文章、分类入口和导航按钮的排布逻辑，让首页既能展示内容又能承担产品入口作用。',
    category: '设计研究',
    status: '待审核',
    author: 'Editor',
    updatedAt: '2026-03-05',
    createdAt: '2026-03-03',
    readTime: '7 分钟',
    views: 880,
    tags: ['首页设计', '内容展示', '视觉层级'],
    cover: 'https://images.unsplash.com/photo-1504805572947-34fad45aed93?auto=format&fit=crop&w=1200&q=80',
    featured: false,
    content: `## 首页的职责

博客首页不只是文章列表，它还承担系统介绍、内容推荐和引导进入后台的职责。

## 设计时要注意

- 核心入口必须清晰
- 推荐内容要有层级感
- 后台入口和文章入口不要互相抢占视觉焦点

## 结论

首页更适合作为系统展示页和内容聚合页，而不是单纯的信息列表。`,
  },
  {
    id: 4,
    slug: 'content-operations-monthly-retrospective-template',
    title: '内容运营月度复盘模板',
    summary: '从文章数量、访问趋势和互动数据三个维度总结博客运营效果，帮助后续迭代内容策略。',
    category: '运营分析',
    status: '已发布',
    author: 'Operator',
    updatedAt: '2026-03-04',
    createdAt: '2026-03-01',
    readTime: '5 分钟',
    views: 2640,
    tags: ['运营', '复盘', '数据分析'],
    cover: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
    featured: true,
    content: `## 为什么需要月度复盘

内容运营并不是单纯追求发文数量，更重要的是评估内容方向、用户反馈与访问转化。

## 建议观察的指标

- 发布文章数量
- 已发布与草稿比例
- 热门文章访问趋势
- 评论与互动活跃度

## 对博客系统的启发

后台仪表盘中的统计卡片和动态记录，可以直接为内容复盘提供数据支撑。`,
  },
  {
    id: 5,
    slug: 'building-reusable-article-editor',
    title: '文章编辑器表单如何设计成可复用结构',
    summary: '从新建和编辑两个场景出发，拆分标题区、正文区和侧边设置区，减少后续重复开发。',
    category: '前端开发',
    status: '已发布',
    author: 'Admin',
    updatedAt: '2026-03-02',
    createdAt: '2026-02-28',
    readTime: '9 分钟',
    views: 3012,
    tags: ['表单设计', '组件复用', '内容编辑'],
    cover: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=1200&q=80',
    featured: false,
    content: `## 复用的价值

在博客后台里，新建文章和编辑文章的页面结构高度一致。如果分别维护两套模板，后续很容易出现字段不一致和样式分叉的问题。

## 推荐拆分方式

- 头部操作区
- 主编辑表单
- 发布设置侧栏
- 分类与标签区

## 实践建议

先通过组件复用页面骨架，后续再逐步接入表单状态和富文本编辑器。`,
  },
]
