# She Can Do Anything — 当前项目概览

> 更新时间：2026-07-20

这是一个基于 Vue 3 + Vite 的女性经验探索平台，当前已经包含前端 SPA、Node 后端接口、用户认证、个人资料、问答广场和粒子问答页面。

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | Vue 3, Vue Router, Vite 5 |
| 请求 | axios |
| 后端 | Node.js HTTP server |
| 数据 | `backend/data/questions.json`, `backend/data/users.json`, `backend/data/questions.db` |
| 认证 | JWT, `Authorization: Bearer <token>` |

## 当前路由

| 路径 | 页面 | 说明 |
|------|------|------|
| `/` | `HomePage` | 首页、She is 搜索、人物样本展示 |
| `/five-times` | `FiveTimesPage` | 五种时间介绍与筛选入口 |
| `/life-templates` | `LifeTemplatesPage` | 人生模板搜索结果页 |
| `/qa-square` | `QaSquarePage` | 问答广场、公开提问、进入粒子页面 |
| `/particle` | `ParticlePage` | 粒子问答页面 |
| `/login` | `LoginPage` | 登录/注册 |
| `/profile` | `ProfilePage` | 当前用户个人资料，需登录 |
| `/profile/:userId` | `ProfilePublicPage` | 公开个人主页 |

## 目录结构

```text
.
├── backend/                  # 后端接口与数据文件
│   ├── data/                 # questions/users 数据
│   └── src/                  # app、routes、db、middleware
├── docs/                     # 项目文档
├── src/                      # Vue 前端源码
│   ├── api/                  # axios 与认证 API
│   ├── components/           # 页面组件与通用组件
│   ├── composables/          # useAuth、useParticleSystem
│   ├── data/                 # 人物数据、标签数据
│   ├── pages/                # 路由页面
│   └── utils/                # 筛选工具
├── package.json              # 前端脚本与依赖
├── vite.config.js            # Vite 端口与 API 代理
└── vercel.json               # 部署配置
```

## 前后端关系

前端开发服务器运行在 `http://localhost:8887`。`vite.config.js` 将 `/api` 代理到后端 `http://localhost:3001`。

后端接口入口为 `backend/src/app.js`，主要接口包括：

| 接口前缀 | 说明 |
|---------|------|
| `/api/health` | 健康检查 |
| `/api/auth/*` | 注册、登录、当前用户、登出 |
| `/api/profile/*` | 当前用户资料与公开资料 |
| `/api/questions/*` | 问题列表、提问、回答 |
| `/api/notifications/*` | 通知列表与标记已读 |

## 关键文档

- 本地启动和排障见 [runbooks/local-development.md](./runbooks/local-development.md)。
- 功能设计见 [features/](./features/)。
- 历史修复记录见 [bugfixes/](./bugfixes/)。
- 早期分析和合并计划见 [archive/](./archive/)。
