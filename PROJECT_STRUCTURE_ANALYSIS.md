# Nuxt_blog_system 项目目录与文件作用梳理

## 1. 项目目录与文件作用（逐文件）

### 根目录

- `.env.example`：环境变量模板，当前**仅列出 OSS 相关变量**；`DATABASE_URL`（`lib/database/client.ts`、`drizzle.config.ts`）与 `JWT_SECRET`（`lib/database/users.ts`）未在模板中说明，新环境需自行配置。文件中仍含**疑似真实 AccessKey 形态的示例值**，存在泄露与误用风险，提交前应替换为占位符并轮换已暴露密钥。
- `.gitignore`：Git 忽略规则，忽略 Nuxt 构建产物、日志、`.env` 等。
- `README.md`：项目启动说明、早期任务清单、基础技术栈说明；**任务清单勾选状态仍多为未完成，与下文「实现进度」不一致**，宜后续与代码对齐更新。
- `drizzle.config.ts`：Drizzle Kit 配置，`schema` 指向 `lib/database/schema.ts`，`out` 为 `./drizzle`，`dialect: 'mysql'`，`dbCredentials.url` 读取 `DATABASE_URL`（含本地默认连接串）。
- `drizzle/`：Drizzle Kit 生成的迁移 SQL 输出目录（由 `drizzle.config.ts` 的 `out` 指定）；若尚未执行 `drizzle-kit generate` 等命令，仓库中可能不存在该文件夹。
- `nuxt.config.ts`：Nuxt 主配置（`compatibilityDate`、`devtools`）；模块为 Pinia、`pinia-plugin-persistedstate/nuxt`、`@nuxtjs/tailwindcss`；`runtimeConfig` 注入 OSS；`imports.dirs: ['stores']` 将**根目录** `stores/` 纳入自动导入（Nuxt 4 默认 `srcDir` 为 `app/` 时需如此配置）；`nitro.externals` 将 `ali-oss` 标为 external。
- `package.json`：项目依赖与脚本定义（Nuxt、Pinia、Drizzle、Tiptap、ali-oss 等）。
- `package-lock.json`：NPM 锁文件，锁定依赖版本，保证安装一致性。
- `tsconfig.json`：TypeScript 配置入口，引用 Nuxt 生成的多端 tsconfig。

### `app/`

- `app/app.vue`：应用根组件，挂载布局和页面容器。

#### `app/layouts/`

- `app/layouts/default.vue`：前台默认布局（导航、登录态入口、全局登录弹窗、页脚）。
- `app/layouts/admin.vue`：后台布局（侧边导航、顶部栏、主内容容器）。

#### `app/middleware/`

- `app/middleware/admin.global.ts`：全局后台路由守卫，校验管理员权限并做重定向。

#### `app/components/`

- `app/components/AuthModal.vue`：登录/注册弹窗组件，调用认证 API，写入用户状态。

#### `app/components/admin/`

- `app/components/admin/ArticleEditorForm.vue`：文章编辑核心表单（创建/编辑、草稿、本地缓存、封面上传、标签与状态管理）。
- `app/components/admin/TiptapEditor.vue`：富文本编辑器封装（Tiptap 工具栏、图片上传、文本格式化）。

#### `app/pages/`

- `app/pages/index.vue`：前台首页，文章流、分类筛选、无限滚动、热门轮播。

#### `app/pages/posts/`

- `app/pages/posts/[slug].vue`：文章详情页，根据 slug 拉取文章并渲染内容。
- `app/pages/posts/write.vue`：用户写作页，登录后可创建/编辑本人文章。

#### `app/pages/user/`

- `app/pages/user/profile.vue`：用户中心页，展示用户信息与其文章列表。

#### `app/pages/admin/`

- `app/pages/admin/index.vue`：后台仪表盘（统计卡片、热门文章、动态）。
- `app/pages/admin/login.vue`：后台专用登录页（管理员校验）。

#### `app/pages/admin/articles/`

- `app/pages/admin/articles/index.vue`：后台文章列表页（筛选、搜索、分页、跳转编辑/预览）。
- `app/pages/admin/articles/create.vue`：后台新建文章页（复用编辑表单）。
- `app/pages/admin/articles/[slug].vue`：后台编辑文章页（加载指定文章并复用表单）。

### `plugins/`

- `plugins/auth.ts`：认证状态恢复与兜底校验插件，避免过期 token 导致“假登录”。

### `stores/`

- `stores/user.ts`：用户状态管理（登录态、用户信息、拉取当前用户、退出登录、cookie 持久化）。
- `stores/articles.ts`：文章 Pinia Store（逻辑已迁到服务端 API + 数据库，Store 体为空；注释说明保留用于后续 UI 级状态，如列表偏好等）。

### `server/`

#### `server/middleware/`

- `server/middleware/auth.ts`：服务端认证中间件，从 cookie 解析 JWT 并注入 `event.context.user`。

#### `server/utils/`

- `server/utils/oss.ts`：OSS 客户端创建、对象 key 生成、URL 拼装工具函数。

#### `server/api/`

- `server/api/hello.ts`：示例/测试 API（返回 Hello World）。
- `server/api/posts.ts`：文章列表查询与文章创建接口（含权限与状态策略）。
- `server/api/posts/[slug].ts`：文章详情、更新、删除接口（含作者/管理员权限校验）。
- `server/api/upload.ts`：图片上传接口（登录校验、格式/大小校验、上传 OSS）。

#### `server/api/auth/`

- `server/api/auth/init.ts`：系统初始化接口，首次创建默认管理员。
- `server/api/auth/login.ts`：登录接口，校验凭证并写入 `auth_token` cookie。
- `server/api/auth/logout.ts`：登出接口，清除认证 cookie。
- `server/api/auth/me.ts`：当前用户信息接口，校验 token 后返回用户 DTO。
- `server/api/auth/register.ts`：注册接口（默认普通用户，带 secretCode 可升管理员）。
- `server/api/auth/reset-admin.ts`：管理员密码重置/管理员账户兜底创建接口。

#### `server/api/user/`

- `server/api/user/posts.ts`：当前登录用户文章列表接口（基于全量文章过滤 authorId）。

### `lib/`

#### `lib/database/`

- `lib/database/client.ts`：数据库连接与初始化逻辑（建表、补字段、注入 mock 数据）。
- `lib/database/schema.ts`：Drizzle 表结构定义（`users`、`articles`）。
- `lib/database/users.ts`：用户数据层与认证逻辑（注册、登录、JWT 生成与校验、DTO 转换）。
- `lib/database/articles.ts`：文章数据层（查询、分页、搜索、创建、更新、删除、slug 去重）。

### `shared/`

#### `shared/types/`

- `shared/types/article.ts`：文章类型定义（前后端共享）。
- `shared/types/user.ts`：用户类型定义（前后端共享）。

#### `shared/data/`

- `shared/data/articles.ts`：初始化用 mock 文章数据。

### `public/`

- `public/robots.txt`：爬虫抓取策略配置（当前允许全部抓取）。

## 2. 当前技术栈

- **前端框架**：Nuxt 4（`package.json` 中 `nuxt` ^4.x）+ Vue 3 + Vue Router
- **源码目录**：Nuxt 4 默认以 `app/` 为页面与布局根；根目录保留 `plugins/`、`stores/`、`server/`、`lib/` 等
- **状态管理**：Pinia + `pinia-plugin-persistedstate`（Nuxt 模块方式注册）
- **样式方案**：Tailwind CSS（`@nuxtjs/tailwindcss`）
- **富文本编辑**：Tiptap（StarterKit、Link、Image、Placeholder、TextAlign、Underline）
- **轮播组件**：Swiper
- **服务端运行层**：Nuxt Nitro / h3 API
- **数据库**：MySQL（`mysql2` 连接池 + `DATABASE_URL`）
- **ORM/迁移**：Drizzle ORM + Drizzle Kit；运行时表结构主要由 `lib/database/client.ts` 中 `CREATE TABLE IF NOT EXISTS` 初始化（与是否已生成 `drizzle/` 迁移目录可并存）
- **认证方案**：JWT + HttpOnly Cookie
- **密码加密**：bcryptjs
- **对象存储**：阿里云 OSS（`ali-oss`，配置来自 `runtimeConfig` / 环境变量）
- **语言**：TypeScript
- **包管理**：npm
- **API 路径**：文章资源使用 `/api/posts`、`/api/posts/[slug]`（与 `README.md` 早期清单中的 `/api/articles` 命名不一致，以代码为准）

## 3. 可能需要 TODO 的功能（按优先级）

### P0（高优先）

- [ ] **敏感信息治理**：清理 `.env.example` 中疑似真实 OSS Key，替换为占位符；轮换已暴露密钥。
- [ ] **环境变量模板补全**：在 `.env.example` 中增加 `DATABASE_URL`、`JWT_SECRET` 等占位说明（与 `client.ts`、`users.ts`、`drizzle.config.ts` 对齐），避免新成员漏配。
- [ ] **认证安全加固**：`JWT_SECRET` 改为强随机环境变量，禁用默认硬编码兜底值（当前 `lib/database/users.ts` 仍有字符串兜底）。
- [ ] **初始化/重置接口保护**：给 `auth/init`、`auth/reset-admin` 加一次性令牌或仅开发环境开放。
- [ ] **管理员注册后门治理**：移除 `register` 中硬编码 `secretCode=admin123` 提权逻辑。

### P1（中优先）

- [ ] **数据库查询下推**：`getArticles` 目前先全量查再内存过滤/排序，改为 SQL 条件过滤 + 分页。
- [ ] **用户文章接口优化**：`/api/user/posts` 增加 `authorId` 条件查询，避免全量后端过滤。
- [ ] **文章浏览量逻辑完善**：详情页访问增加安全计数策略（去重、防刷、异步更新）。
- [ ] **删除功能前后台闭环**：后台列表增加“删除”操作与二次确认，前端联动接口。

### P2（体验与工程化）

- [ ] **评论/互动模块**：评论、点赞、收藏、关注作者等社区能力。
- [ ] **搜索体验升级**：前端搜索联想、关键词高亮、多条件组合筛选。
- [ ] **稿件工作流完善**：待审核列表、审核记录、驳回原因、发布排期。
- [ ] **测试体系建设**：补齐 API 单测、关键页面 E2E、权限回归测试。
- [ ] **可观测性建设**：接入请求日志、错误监控、慢查询告警。

## 4. 当前项目状态结论

- 已具备「前台阅读 + 登录注册 + 用户写作 + 后台管理 + MySQL 持久化 + OSS 图片上传」的**可运行闭环**；`lib/database/client.ts` 仍在首次初始化时注入 mock 文章数据（便于空库演示）。
- **README.md** 中的勾选清单尚未反映上述完成度，容易让人误判为“未开始做”；建议将清单更新为与当前仓库一致，或注明以本文件与 `server/api`、`app/pages` 为准。
- 目前最大风险仍在于**安全配置（`.env.example` 形态、JWT 兜底、init/reset-admin、注册提权）**与**列表查询实现（`getArticles` 全表读取后在内存过滤/排序/分页，且 stats 再次全表查询）**，建议优先处理 P0 与 P1 再扩展功能。

## 5. 仓库文件规模（便于对照）

- 核心业务与配置以 TypeScript / Vue 为主，根目录下除 `node_modules`、构建产物外，源文件约 **40+** 个（含 `app/`、`server/`、`lib/`、`shared/`、`plugins/`、`stores/` 等）；`public/` 当前仅有 `robots.txt`。
- 若本地存在 `.nuxt/`、`node_modules/`、`.output/` 等，均属生成或依赖目录，不必写入版本控制（见 `.gitignore`）。
