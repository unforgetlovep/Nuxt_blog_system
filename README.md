# 📝 基于 Nuxt 的博客管理系统

> 毕业设计项目 - 一个功能完善的博客内容管理系统

## 🚀 项目启动步骤

### 1. 安装依赖

```bash
npm install
```

### 2. 启动开发服务器

```bash
npm run dev
```

项目将运行在 `http://localhost:3000`

### 3. 生产环境构建

```bash
# 构建项目
npm run build

# 预览生产构建
npm run preview
```

---

## 📋 开发任务清单

### 🗄️ 数据层

- [ ] **数据库设计与配置**  
  设计文章表结构（标题、内容、作者、分类、标签、创建时间等字段）

- [ ] **配置数据库连接**  
  选择并配置数据库（MySQL/PostgreSQL/SQLite），安装 ORM（Prisma/Drizzle）

- [ ] **创建数据库模型**  
  编写文章模型定义并执行数据库迁移

### 🔌 API 接口层

- [ ] **文章创建接口**  
  `POST /api/articles` - 接收标题、内容、分类等参数

- [ ] **文章列表接口**  
  `GET /api/articles` - 支持分页、筛选、排序功能

- [ ] **文章详情接口**  
  `GET /api/articles/:id` - 根据 ID 获取单篇文章

- [ ] **文章更新接口**  
  `PUT /api/articles/:id` - 更新指定文章内容

- [ ] **文章删除接口**  
  `DELETE /api/articles/:id` - 软删除或物理删除

### 🎨 前端页面

- [ ] **文章列表页面**  
  展示文章列表，支持分页和基本筛选

- [ ] **文章详情页面**  
  展示完整文章内容

- [ ] **文章编辑页面**  
  表单页面用于创建和编辑文章

- [ ] **前端与 API 集成**  
  连接页面与后端 API，处理数据交互

### ✅ 测试与验证

- [ ] **功能测试**  
  验证所有增删改查功能正常工作

---

## 📚 技术栈

- **框架**: Nuxt 3
- **语言**: TypeScript
- **数据库**: 待配置（SQLite/MySQL/PostgreSQL）
- **ORM**: 待配置（Prisma/Drizzle）

---

## 📖 开发文档

更多信息请参考 [Nuxt 官方文档](https://nuxt.com/docs/getting-started/introduction)

---

## 📝 开发说明

**当前开发策略**: 优先实现核心功能（文章增删改查），UI 优化将在功能完成后进行。
