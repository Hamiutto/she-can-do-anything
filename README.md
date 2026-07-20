# She Can Do Anything

一个基于 Vue 3 + Vite 的女性经验交流社区。前端包含人物检索、五种时间页、问答广场、粒子问答、登录注册和个人主页；后端提供本地开发 API，另有一套 `api/` 目录用于部署平台入口。

## 项目结构

```text
.
├── api/                 # 部署用服务端入口
├── backend/             # 本地开发后端
├── docs/                # 项目说明、设计稿、修复记录、历史资料
│   ├── assets/          # 原始素材与数据源
│   ├── design/          # 页面设计稿
│   ├── archive/         # 历史方案与旧版本资料
│   ├── features/        # 功能设计说明
│   ├── bugfixes/        # 修复记录
│   └── runbooks/        # 运行手册
├── public/              # 前端静态资源
├── src/                 # Vue 前端源码
├── package.json         # 前端脚本与依赖
├── vite.config.js       # Vite 开发代理
└── vercel.json          # 部署重写规则
```

## 本地运行

前后端需要分别启动。

前端依赖：

```powershell
npm install
```

后端依赖：

```powershell
Set-Location backend
npm install
```

后端开发服务：

```powershell
Set-Location backend
npm run dev
```

前端开发服务：

```powershell
npm run dev
```

- 前端默认地址：`http://localhost:8887`
- 后端默认地址：`http://localhost:3001`

## 常用命令

```powershell
npm run build
npm run preview
```

```powershell
Set-Location backend
npm start
```

## 主要页面

- `/` 首页和人物搜索
- `/five-times` 五种时间页
- `/life-templates` 人生模板页
- `/qa-square` 问答广场
- `/particle` 粒子问答页
- `/thanks` 感谢页
- `/team` 团队页
- `/login` 登录注册
- `/profile` 个人主页

## 数据与素材

- 本地数据：`backend/data/questions.json`、`backend/data/users.json`、`backend/data/questions.db`
- 运行图片：`public/首页背景图.png`
- 原始素材与设计资料：`docs/assets/`、`docs/design/`
- 部署 API：`api/[...path].js`，数据库连接读取 `DATABASE_URL` 或 `POSTGRES_URL`

## 文档入口

- [docs/README.md](./docs/README.md)
- [docs/project-overview.md](./docs/project-overview.md)
- [docs/runbooks/local-development.md](./docs/runbooks/local-development.md)
