# 她行 She Can Do Anything

> 越是 AI 信息冲击的时代，人和人之间真实的交流就越显珍贵。
>
> 她行是一个基于「五种时间」理论的女性互助社区：真实的人生样本、灵感粒子问答、回声感谢信，让每一个正在经历困境的女性，找到那个已经走过去的姐妹。

## ✨ 核心功能

| 模块 | 说明 |
|------|------|
| **人生样本库** | 21 位真实评委 + 持续增长的用户样本卡。支持城市、行业、MBTI、星座、爱好等多维度搜索，找到"世界上另一个她" |
| **五种时间体系** | 生存 / 赚钱 / 好看 / 好玩 / 心流，每种时间下都有对应的人生模板和真实故事 |
| **问问她** | 粒子问答交互，公开提问与回答问题，形成"提问 → 回答 → 感谢"的情感闭环 |
| **隐私保护** | 游客可自由浏览全部内容，仅在需要沉淀个人内容时触发登录注册 |

## 🛠 技术栈

| 层级 | 技术 | 说明 |
|------|------|------|
| 前端 | Vue 3 + Vite + Vue Router | 单页应用，组件化开发 |
| 后端 | Node.js（原生 HTTP Server） | 零框架依赖，轻量 API 服务 |
| 数据库 | sql.js（SQLite in-memory）+ JSON 文件 | 本地开发用轻量存储 |
| 认证 | JWT（jsonwebtoken） | 登录态签发与恢复 |
| 交互 | Canvas 粒子系统 | 问题粒子漂流、鼠标跟随、点击回答 |
| 部署 | Vercel | 前端静态托管 + Serverless API 代理 |

## 📦 项目结构

```text
.
├── api/                     # Vercel Serverless API 入口（部署用）
├── backend/                 # 本地开发后端
│   ├── src/
│   │   ├── app.js           # HTTP 服务入口（端口 3001）
│   │   ├── db/              # 数据库初始化与操作
│   │   ├── middleware/      # JWT 认证中间件
│   │   └── routes/          # 路由处理（auth / profile / questions / notifications）
│   ├── data/                # 本地数据文件
│   │   ├── questions.json
│   │   ├── questions.db
│   │   └── users.json
│   ├── .env                 # 环境变量（JWT_SECRET）
│   └── package.json
├── public/                  # 前端静态资源（图片等）
├── src/                     # Vue 前端源码
│   ├── main.js              # 应用入口
│   ├── App.vue              # 根组件（布局壳 + 路由出口）
│   ├── router.js            # 页面路由配置
│   ├── styles.css           # 全局样式与 CSS 变量
│   ├── api/                 # 前端 API 请求封装
│   ├── components/          # 可复用组件
│   │   ├── LandingSplash.vue    # 全屏首屏（背景图+引导文案）
│   │   ├── LandingHero.vue      # 品牌介绍 + AI Creator Stage
│   │   ├── SheIsSearchSection.vue # 标签探索 + 搜索
│   │   ├── PersonCard.vue       # 人物卡片
│   │   ├── PersonGrid.vue       # 人物网格
│   │   ├── PersonDetail.vue     # 人物详情
│   │   ├── DynamicTagCloud.vue  # 动态标签云
│   │   ├── ParticleCanvas.vue   # Canvas 粒子画布
│   │   ├── TopNav.vue           # 顶部导航栏
│   │   └── ...
│   ├── pages/               # 页面组件
│   │   ├── HomePage.vue         # 首页（首屏 + 搜索 + 人物展示）
│   │   ├── FiveTimesPage.vue    # 五种时间页
│   │   ├── LifeTemplatesPage.vue # 人生模板页
│   │   ├── QaSquarePage.vue     # 问答广场
│   │   ├── ParticlePage.vue     # 粒子问答页
│   │   ├── ThanksPage.vue       # 感谢页
│   │   ├── TeamPage.vue         # 团队页
│   │   ├── LoginPage.vue        # 登录注册
│   │   ├── ProfilePage.vue      # 个人资料编辑
│   │   └── ProfilePublicPage.vue # 个人公开主页
│   ├── composables/         # 组合式函数（认证、粒子系统）
│   ├── data/                # 静态数据（人物、标签、团队、感谢）
│   └── utils/               # 工具函数（筛选逻辑等）
├── docs/                    # 项目文档（设计稿、修复记录、运行手册）
├── package.json             # 前端依赖与脚本
├── vite.config.js           # Vite 配置（端口 8887 + API 代理）
└── vercel.json              # Vercel 部署配置
```

## 🚀 快速开始

### 前置要求

- **Node.js** >= 18.0（推荐 20+）
- **npm** >= 9.0

### 第一步：安装依赖

```bash
# 安装前端依赖
npm install

# 安装后端依赖
cd backend && npm install && cd ..
```

### 第二步：启动后端

```bash
cd backend
npm run dev     # 开发模式（文件修改自动重启）
```

后端默认运行在 `http://localhost:3001`。

> 后端会自动初始化数据库，首次启动会在 `backend/data/` 下生成 `questions.db`。

### 第三步：启动前端（新开一个终端）

```bash
npm run dev
```

前端默认运行在 `http://localhost:8887`，API 请求通过 Vite 代理转发到后端。

### 访问项目

打开浏览器访问：**http://localhost:8887**

### 一键启动（可选）

如果你希望一条命令同时启动前后端，可以在根目录运行：

```bash
# macOS / Linux
(cd backend && npm run dev) & npm run dev

# Windows (PowerShell)
Start-Process -NoNewWindow -FilePath "npm" -ArgumentList "run","dev" -WorkingDirectory "$PWD/backend"; npm run dev
```

## 🗺️ 页面路由

| 路由 | 页面 | 说明 |
|------|------|------|
| `/` | 首页 | 全屏首屏 → 品牌介绍 → 标签探索 → 人物样本 |
| `/five-times` | 五种时间 | 五种时间体系展示与人生模板 |
| `/life-templates` | 人生模板 | 搜索与筛选人生样本卡片 |
| `/qa-square` | 问答广场 | 公开提问、浏览问题、回答问题 |
| `/particle` | 粒子问答 | Canvas 粒子交互问答 |
| `/thanks` | 感谢页 | 回声感谢信 |
| `/team` | 团队页 | 团队展示 |
| `/login` | 登录注册 | 用户认证入口 |
| `/profile` | 个人资料 | 编辑个人人生样本卡（需登录） |
| `/profile/:userId` | 公开主页 | 查看他人公开资料 |

## 🔧 常用命令

```bash
# 前端开发（热更新）
npm run dev

# 前端构建生产版本
npm run build

# 预览生产构建
npm run preview

# 后端开发（文件变更自动重启）
cd backend && npm run dev

# 后端生产运行
cd backend && npm start
```

## 🔐 环境变量

后端配置通过 `backend/.env` 文件管理：

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `JWT_SECRET` | JWT 签名密钥 | `she-can-do-anything-jwt-secret-2026` |
| `PORT` | 后端服务端口 | `3001` |

部署到线上时，`api/[...path].js` 读取 `DATABASE_URL` 或 `POSTGRES_URL` 环境变量连接 PostgreSQL。

## 📊 数据说明

| 数据类型 | 存储位置 | 说明 |
|----------|----------|------|
| 问题与回答 | `backend/data/questions.json` + `questions.db` | 用户提问、回答、状态 |
| 用户数据 | `backend/data/users.json` | 注册用户名、密码（bcrypt 哈希）、个人资料 |
| 人物样本 | `src/data/people.js` | 前端静态人物数据（城市、行业、标签、故事等） |
| 标签体系 | `src/data/tags.js` | 探索标签分类与数据源 |
| 团队信息 | `src/data/team.js` | 团队成员资料 |

## 🌐 部署

项目已配置 Vercel 部署：

- `vercel.json` 配置了 SPA 路由重写和 API 代理
- `api/[...path].js` 作为 Serverless 函数处理后端请求
- 部署时需设置 `DATABASE_URL` 或 `POSTGRES_URL` 环境变量

## 📖 更多文档

| 文档 | 说明 |
|------|------|
| [docs/project-overview.md](./docs/project-overview.md) | 项目结构、技术栈、前后端关系详解 |
| [docs/runbooks/local-development.md](./docs/runbooks/local-development.md) | 本地启动手册、端口说明、常见问题 |
| [docs/features/](./docs/features/) | 功能设计文档（认证、问答、特效等） |
| [docs/bugfixes/](./docs/bugfixes/) | 问题修复记录 |
| [docs/design/](./docs/design/) | 页面设计稿 |
| [docs/archive/](./docs/archive/) | 历史方案与旧版本资料 |

## 📝 License

本项目为内部开发使用，仅供演示与交流。
