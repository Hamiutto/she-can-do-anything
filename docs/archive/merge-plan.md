# She Can Do Anything × 粒子问答 — 项目合并方案

> 将 `/home/dxl/codingLady`（粒子问答系统）合并到 `/home/dxl/she-can-do-anything-main`（女性经验平台）中，重点改造 **问答广场** 页面，实现完整的提问→粒子回答流程。

---

## 1. 合并目标

### 1.1 核心需求

| 需求 | 说明 |
|------|------|
| **问答广场激活** | 将问答广场从静态占位页改造为功能完整的问答入口 |
| **公开提问** | 点击弹出提问框，支持标记五种时间类型，提交后问题出现在粒子页面 |
| **真实回答→回答问题** | 板块名称改为"回答问题"，点击跳转到粒子界面 |
| **粒子界面融合** | 导航栏统一为 she-can-do-anything 风格，背景加引导词 |
| **数据库复用** | 问答相关数据库直接复用 codingLady 的后端 |

### 1.2 不改动的部分

| 模块 | 说明 |
|------|------|
| 首页（HomePage） | 保持现有逻辑不变 |
| 五种时间页（FiveTimesPage） | 保持现有逻辑不变 |
| 人生模板页（LifeTemplatesPage） | 保持现有逻辑不变 |
| 人物数据（people.js） | 保持现有逻辑不变 |
| 标签体系（tags.js） | 保持现有逻辑不变 |

---

## 2. 两个项目现状对比

### 2.1 she-can-do-anything-main（目标项目）

| 属性 | 值 |
|------|-----|
| 技术栈 | Vue 3 + Vite 5.4 + Vue Router |
| 端口 | **8887** |
| 后端 | 无（纯前端） |
| 导航栏 | `She is` / `五种时间` / `人生模板` / `问答广场` |
| 导航栏样式 | 毛玻璃效果，`--lavender` 紫色主题，圆角 pill 按钮 |
| 问答广场 | 静态占位，3 张卡片（公开提问、真实回答、感谢信） |

### 2.2 codingLady（源项目）

| 属性 | 值 |
|------|-----|
| 技术栈 | Vue 3 + Vite 5.4 + Vue Router |
| 端口 | 8888 |
| 后端 | Node.js Express + SQLite（sql.js） |
| 后端端口 | 3001 |
| 导航栏 | 粉色渐变（`#FFB5C8 → #FF8FAB → #FF6B8A`），56px 固定顶栏 |
| 粒子系统 | Canvas 2D，200-300 粒子，鼠标跟随粒子流，点击浮现问题 |
| 问答弹窗 | 从点击位置弹出，支持回答/跳过，回答后粒子破碎 |
| 数据库 | questions / answers / notifications 三张表 |

---

## 3. 合并后目录结构

```
she-can-do-anything-main/          # 目标项目（合并后的完整项目）
├── index.html
├── package.json                   # 合并依赖（新增 axios, sql.js, express, cors）
├── vite.config.js                 # 端口 8887 + 代理到后端 3001
├── .gitignore
├── she-is-enhanced.html
├── docs/archive/old-readme-analysis.md
│
├── backend/                       # ← 从 codingLady 复制过来
│   ├── package.json
│   ├── src/
│   │   ├── app.js
│   │   ├── db/
│   │   │   └── database.js
│   │   └── routes/
│   │       ├── questions.js
│   │       └── notifications.js
│   └── data/
│       └── questions.db           # SQLite 数据库文件
│
└── src/
    ├── main.js                    # 不变
    ├── App.vue                    # 不变
    ├── router.js                  # 不变（4 条路由）
    ├── styles.css                 # 合并粒子界面样式
    ├── api/                       # ← 从 codingLady 复制
    │   └── index.js
    │
    ├── data/
    │   ├── people.js              # 不变
    │   └── tags.js                # 不变
    ├── utils/
    │   └── peopleFilters.js       # 不变
    │
    ├── pages/
    │   ├── HomePage.vue           # 不变
    │   ├── FiveTimesPage.vue      # 不变
    │   ├── LifeTemplatesPage.vue  # 不变
    │   └── QaSquarePage.vue       # ★ 核心改造：从占位页到功能页
    │
    └── components/
        ├── AppLayout.vue          # 不变
        ├── TopNav.vue             # 不变
        ├── LandingHero.vue        # 不变
        ├── SheIsSearchSection.vue # 不变
        ├── DynamicTagCloud.vue    # 不变
        ├── TimeEntryChips.vue     # 不变
        ├── PersonGrid.vue         # 不变
        ├── PersonCard.vue         # 不变
        ├── PersonDetail.vue       # 不变
        ├── AskQuestionModal.vue   # 不变
        ├── NotificationDropdown.vue # 不变
        ├── Toast.vue              # 不变
        │
        ├── ParticleCanvas.vue     # ← 从 codingLady 复制，改造导航栏
        ├── ParticleNavBar.vue     # ← 新建：复用 TopNav 风格的导航栏
        ├── QuestionModal.vue      # ← 从 codingLady 复制
        ├── QuestionForm.vue       # ← 从 codingLady 复制
        └── ShatterEffect.vue      # ← 从 codingLady 复制
            └── composables/       # ← 新增目录
                └── useParticleSystem.js  # ← 从 codingLady 复制
```

---

## 4. 文件变更清单

### 4.1 新增文件（从 codingLady 复制）

| 目标路径 | 来源 | 说明 | 是否需修改 |
|---------|------|------|-----------|
| `backend/package.json` | codingLady/backend/ | 后端依赖配置 | ✅ 需检查 |
| `backend/src/app.js` | codingLady/backend/ | Express 入口 | ✅ 需检查 |
| `backend/src/db/database.js` | codingLady/backend/ | SQLite 数据库 | ✅ 需检查 |
| `backend/src/routes/questions.js` | codingLady/backend/ | 问题 API | ✅ 无需改 |
| `backend/src/routes/notifications.js` | codingLady/backend/ | 通知 API | ✅ 无需改 |
| `src/api/index.js` | codingLady/frontend/ | Axios 封装 | ✅ 无需改 |
| `src/composables/useParticleSystem.js` | codingLady/frontend/ | 粒子系统核心 | ✅ 无需改 |
| `src/components/ParticleCanvas.vue` | codingLady/frontend/ | 粒子画布组件 | ✅ 需改导航栏 |
| `src/components/QuestionModal.vue` | codingLady/frontend/ | 问答弹窗 | ✅ 无需改 |
| `src/components/QuestionForm.vue` | codingLady/frontend/ | 提问表单 | ✅ 无需改 |

### 4.2 修改文件（目标项目已有）

| 文件 | 变更内容 |
|------|---------|
| `package.json` | 新增 `axios`、`sql.js`、`express`、`cors` 依赖 |
| `vite.config.js` | 新增 `/api` 代理到 `http://localhost:3001` |
| `src/router.js` | **无需修改**（4 条路由保持不变，QaSquarePage 原地改造） |
| `src/styles.css` | 新增粒子系统相关样式（Canvas、粒子连线、破碎特效等） |
| `src/pages/QaSquarePage.vue` | **核心改造**（见下方详细方案） |

### 4.3 不变文件

| 类别 | 文件 |
|------|------|
| 配置 | `index.html`、`.gitignore` |
| 入口 | `main.js`、`App.vue`、`router.js` |
| 数据 | `data/people.js`、`data/tags.js`、`utils/peopleFilters.js` |
| 组件 | `AppLayout`、`TopNav`、`LandingHero`、`SheIsSearchSection`、`DynamicTagCloud`、`TimeEntryChips`、`PersonGrid`、`PersonCard`、`PersonDetail`、`AskQuestionModal`、`NotificationDropdown`、`Toast` |
| 页面 | `HomePage`、`FiveTimesPage`、`LifeTemplatesPage` |

---

## 5. 核心改造方案

### 5.1 QaSquarePage.vue — 问答广场功能改造

**当前状态**：纯静态占位页，3 张卡片无交互。

**改造目标**：
- "公开提问"卡片 → 点击弹出提问弹窗
- "真实回答" → 改名为"回答问题" → 点击跳转到粒子页面
- "感谢信" → 保持静态占位（后续开发）

#### 5.1.1 公开提问功能

```
用户操作流程：
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│ 点击"公开提问" │ ──→ │ 弹出提问弹窗  │ ──→ │ 填写问题信息  │
└─────────────┘     └─────────────┘     └──────┬──────┘
                                               │
                    ┌──────────────┐     ┌─────▼──────┐
                    │ Toast: 已提交 │ ←── │ 确认提问    │
                    └──────────────┘     └────────────┘
                                               │
                                               ▼
                                        POST /api/questions
                                        （提交到后端数据库）
```

**提问弹窗设计**：
- 复用 `QuestionForm.vue` 组件（已有昵称 + 问题 + 五种时间选择）
- 或者在 QaSquarePage 内联实现一个轻量版提问弹窗
- 五种时间选择：5 个按钮（💪生存 💰赚钱 💄好看 🎮好玩 🎵心流）
- 提交后调用 `POST /api/questions`，传递 `{ content, author, time_type }`

**弹窗 UI 原型**：
```
┌──────────────────────────────────────┐
│           公开提问               ✕   │
├──────────────────────────────────────┤
│                                      │
│  昵称  [                    ]        │
│                                      │
│  问题  [                    ]        │
│        [                    ]        │
│        [                    ]        │
│                                      │
│  时间类型                            │
│  [💪生存] [💰赚钱] [💄好看]          │
│  [🎮好玩] [🎵心流]                   │
│                                      │
│        [  确认提问  ]                 │
│                                      │
└──────────────────────────────────────┘
```

#### 5.1.2 回答问题功能（跳转到粒子页面）

**当前文案**：「真实回答」→ 回答会保留人的语气和具体处境...

**改造为**：
```
┌────────────────────────┐
│  回答问题              │
│                        │
│  点击前往粒子世界      │
│  在飞舞的粒子中找到    │
│  你想回答的问题 ✨     │
│                        │
│  [  前往粒子页面  ]    │
└────────────────────────┘
```

**跳转逻辑**：点击按钮 → `router.push('/particle')`（需要新增粒子页面路由）

### 5.2 新增粒子页面路由

在 `router.js` 中新增一条路由：

```javascript
import ParticlePage from './pages/ParticlePage.vue'

// 新增路由
{ path: '/particle', name: 'particle', component: ParticlePage }
```

### 5.3 新建 ParticlePage.vue

这是一个新页面，整合粒子系统核心功能，但**导航栏复用 TopNav 风格**。

**页面结构**：
```
┌────────────────────────────────────────────┐
│ [TopNav 风格导航栏]                         │  ← 复用 she-can-do-anything 的导航样式
├────────────────────────────────────────────┤
│                                            │
│   "点击粒子，回答一个真实的问题"             │  ← 引导词（居中，半透明，悬浮于粒子上方）
│   "或在空白处点击，发现新问题"               │
│                                            │
│   ┌──────────────────────────────┐         │
│   │                              │         │
│   │     Canvas 粒子渲染区域       │         │  ← 使用 ParticleCanvas 组件
│   │     (200-300 粒子)           │         │
│   │                              │         │
│   └──────────────────────────────┘         │
│                                            │
│   [  返回问答广场  ]                        │  ← 底部返回按钮
│                                            │
└────────────────────────────────────────────┘
```

**引导词样式**：
- 位置：Canvas 上方，居中
- 样式：`font-family: var(--serif)`，`color: rgba(45,52,54,0.4)`，`font-size: 18px`
- `pointer-events: none`（不阻挡鼠标事件）
- 带轻微的呼吸动画

**ParticlePage 核心逻辑**：
1. onMounted → `GET /api/questions` 获取待回答问题列表
2. 将问题列表传给 `ParticleCanvas`，每个问题对应一个粒子
3. 点击粒子 → 弹出 `QuestionModal`
4. 回答 → `POST /api/questions/:id/answer` → 粒子破碎 → 返回列表
5. 跳过 → 关闭弹窗，粒子继续漂浮
6. 点击空白 → 在点击位置附近浮现一个问题

### 5.4 粒子导航栏改造

**codingLady 原版导航栏**：粉色渐变，56px 固定顶栏

**改造方案**：使用 she-can-do-anything 的 TopNav 样式

| 属性 | 原版（粉色） | 新版（复用 TopNav） |
|------|-------------|-------------------|
| 背景 | `linear-gradient(#FFB5C8, #FF6B8A)` | 毛玻璃 `backdrop-filter: blur(16px)` |
| 品牌 | "粒子问答 ✨" | "SHE IS ____" |
| 导航项 | 无 | `五种时间` / `人生模板` / `问答广场` |
| 右侧 | 通知铃铛 + 提问按钮 | 消息通知 + 登录 |
| 颜色变量 | 粉色系 | `--lavender` 紫色系 |

**实现方式**：
- 方案 A：ParticlePage 中直接复用 `<TopNav>` 组件（推荐）
- 方案 B：在粒子页面中嵌入一个简化的导航栏，使用相同的 CSS class

### 5.5 粒子系统 Canvas 适配

**codingLady 原版**：Canvas top: 56px（为粉色导航栏留空间）

**改造后**：
- Canvas top: 与 she-can-do-anything 的 TopNav 高度对齐（约 70-80px，因为 TopNav 有 padding）
- Canvas height: `calc(100vh - 80px)`
- 引导词区域占用额外的 60px

---

## 6. 数据库对接方案

### 6.1 数据库表结构（复用 codingLady）

| 表名 | 作用 | 字段 |
|------|------|------|
| `questions` | 存储问题 | id, content, author, status, time_type, particle_x, particle_y, color, created_at |
| `answers` | 存储回答 | id, question_id, content, author, created_at |
| `notifications` | 存储通知 | id, user_name, type, title, message, question_id, answer_id, is_read, created_at |

### 6.2 API 接口（复用 codingLady）

| 方法 | 路径 | 说明 | 前端调用方 |
|------|------|------|-----------|
| GET | `/api/questions` | 获取所有待回答问题 | ParticlePage 加载时 |
| POST | `/api/questions` | 提交新问题 | QaSquarePage 提问弹窗 |
| GET | `/api/questions/:id` | 获取单个问题 | QuestionModal |
| POST | `/api/questions/:id/answer` | 回答问题 | QuestionModal 提交回答 |
| GET | `/api/notifications/:userName` | 获取通知 | TopNav 通知面板 |
| POST | `/api/notifications/:id/read` | 标记已读 | TopNav 通知面板 |

### 6.3 Vite 代理配置

在 `vite.config.js` 中新增代理：
```javascript
export default defineConfig({
  plugins: [vue()],
  server: {
    port: 8887,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true
      }
    }
  }
})
```

### 6.4 种子数据

后端首次启动时自动插入 15 条预置问题（含 time_type 分类）。如果已有数据则不会重复插入。

---

## 7. 用户交互流程

### 7.1 完整流程图

```
┌──────────────────────────────────────────────────────┐
│                    问答广场页面                        │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────┐  │
│  │  公开提问     │  │  回答问题     │  │  感谢信    │  │
│  │  (点击弹窗)   │  │  (跳转粒子)   │  │  (占位)    │  │
│  └──────┬───────┘  └──────┬───────┘  └────────────┘  │
└─────────┼─────────────────┼──────────────────────────┘
          │                 │
    ┌─────▼─────┐     ┌─────▼─────┐
    │ 提问弹窗   │     │ 粒子页面   │
    │           │     │           │
    │ [昵称]    │     │ 引导词     │
    │ [问题]    │     │ 粒子动效   │
    │ [时间类型]│     │           │
    │ [确认提问]│     │ 点击粒子 → │
    └─────┬─────┘     │ 问答弹窗   │
          │           └─────┬─────┘
          ▼                 │
    POST /api/questions     │
          │                 │
          ▼                 ├──→ 回答 → POST answer → 粒子破碎
    Toast: 已提交            │
          │                 └──→ 跳过 → 关闭弹窗
          ▼
    问题存入数据库
    可在粒子页面看到
```

### 7.2 五种时间标记流程

```
用户提问时选择时间类型：

  ┌─────────────────────┐
  │  时间类型            │
  │  ┌────┐ ┌────┐     │
  │  │💪生存│ │💰赚钱│     │  ← 点击选中
  │  └────┘ └────┘     │
  │  ┌────┐ ┌────┐     │
  │  │💄好看│ │🎮好玩│     │
  │  └────┘ └────┘     │
  │  ┌────┐             │
  │  │🎵心流│  ← 默认选中  │
  │  └────┘             │
  └─────────────────────┘

提交时后端记录 time_type 字段 → 粒子页面根据 time_type 显示彩色标签
```

---

## 8. 样式合并方案

### 8.1 需要新增的 CSS

在 `src/styles.css` 中新增以下样式：

| 样式类别 | 来源 | 说明 |
|---------|------|------|
| 粒子 Canvas 基础样式 | codingLady | `position: fixed`、尺寸、cursor |
| 粒子连线和光晕 | codingLady | Canvas 2D 绘制，无 CSS |
| 问答弹窗样式 | codingLady | `.modal-overlay`、`.modal`、`.time-badge` |
| 提问表单样式 | codingLake | `.form-input`、`.time-type-selector` |
| 时间类型标签 | codingLady | `.time-survival`、`.time-earning` 等 5 种颜色 |
| 破碎特效 | codingLady | Canvas 2D 绘制，无 CSS |
| 引导词样式 | 新建 | `.particle-guide`，半透明居中文字 |

### 8.2 需要兼容的样式冲突

| 冲突点 | 解决方案 |
|--------|---------|
| `body` 背景 | she-can-do-anything 的渐变背景保留，粒子页面 Canvas 使用 `#F5F0E8` |
| 按钮样式 | 粒子页面复用 `primary-button`、`soft-button` 等已有 class |
| 弹窗样式 | 粒子页面的弹窗使用独立 class 名（`.particle-modal`）避免冲突 |
| 导航栏高度 | TopNav 在 she-can-do-anything 中无固定高度，粒子 Canvas 通过 JS 动态获取 |

---

## 9. 实现步骤

### Phase 1：基础整合（文件复制 + 依赖安装）

1. 复制 `backend/` 目录到 she-can-do-anything-main 根目录
2. 合并 `package.json`，新增 `axios`、`sql.js`、`express`、`cors` 依赖
3. 更新 `vite.config.js`，添加 `/api` 代理 + 端口 8887
4. 复制 `src/api/index.js`
5. 复制 `src/composables/useParticleSystem.js`
6. 安装依赖：`cd backend && npm install` + `cd .. && npm install`

### Phase 2：问答广场改造

1. 改造 `QaSquarePage.vue`：
   - "真实回答" 改名为 "回答问题"
   - "公开提问" 添加点击事件，弹出提问表单
   - "回答问题" 添加点击事件，跳转到粒子页面
2. 在 QaSquarePage 中内联实现轻量版提问弹窗（含五种时间选择）
3. 提交问题调用 `POST /api/questions`

### Phase 3：粒子页面

1. 新建 `src/pages/ParticlePage.vue`
2. 新建 `src/components/ParticleCanvas.vue`
3. 新建 `src/components/QuestionModal.vue`
4. 复制 `src/composables/useParticleSystem.js`
5. 在 `router.js` 中添加 `/particle` 路由
6. 实现引导词、Canvas 适配、粒子数据加载

### Phase 4：样式合并

1. 在 `src/styles.css` 中追加粒子相关样式
2. 确保与现有样式无冲突
3. 引导词样式（半透明、居中、呼吸动画）
4. 问答弹窗样式（复用 TopNav 风格）

### Phase 5：联调验证

1. 启动后端：`cd backend && npm start`（3001 端口）
2. 启动前端：`npm run dev`（8887 端口）
3. 验证问答广场 → 提问 → 粒子页面 → 回答 → 破碎特效 全流程

---

## 10. 启动方式

合并后项目需要同时启动前端和后端：

```bash
# 终端 1：启动后端
cd /home/dxl/she-can-do-anything-main/backend
npm start            # 监听 http://localhost:3001

# 终端 2：启动前端
cd /home/dxl/she-can-do-anything-main
npm run dev          # 监听 http://localhost:8887
```

浏览器访问 `http://localhost:8887`，导航到「问答广场」即可体验。

---

## 11. 风险与注意事项

| 风险 | 说明 | 应对 |
|------|------|------|
| Node.js 版本 | 后端 `sql.js` 需要 WASM 文件路径正确 | 已在 database.js 中配置本地路径 |
| 数据库文件 | `questions.db` 首次启动自动创建 | 确保 `backend/data/` 目录可写 |
| Canvas 性能 | 200-300 粒子 + 连线计算 | 使用 `requestAnimationFrame`，限制帧率 |
| 端口冲突 | 8887 或 3001 被占用 | 修改 `vite.config.js` 或 `backend/src/app.js` 中的端口 |
| CSS 冲突 | 两套项目的样式可能冲突 | 粒子相关样式使用独立前缀 `.particle-*` |

---

## 12. 不在此次合并范围内的内容

| 功能 | 当前状态 | 后续计划 |
|------|---------|---------|
| 感谢信板块 | 静态占位 | 后续对接回答数据，展示真实感谢信 |
| 登录系统 | 按钮 + Toast 模拟 | 后续接入真实登录认证 |
| 通知系统 | 静态模拟数据 | 后续对接后端通知 API |
| 收藏功能 | 前端状态 | 后续持久化 |
| 人物数据增强 | 占位文本 | 后续替换为真实人物故事 |

---

## 13. 合并后问题修复

### 13.1 问题 1：问答广场出现两个导航栏

**原因**：`App.vue` 通过 `AppLayout` 已包含 `TopNav`，而 `ParticlePage.vue` 又额外引入了 `<TopNav />` 组件，导致双重导航栏。

**修复**：从 `ParticlePage.vue` 中移除 `<TopNav />` 组件引用。粒子页面继承 App.vue 中的全局导航栏，无需重复引入。

### 13.2 问题 2：提问弹窗打不开

**原因**：`QaSquarePage.vue` 的卡片点击区域 `z-index` 和弹窗遮罩 `z-index` 冲突，且 `qa-card` 元素缺少 `cursor: pointer` 样式，用户难以识别可点击区域。

**修复**：
- 为 `.qa-card--interactive` 添加 `cursor: pointer` 和 `:hover` 效果
- 确保弹窗遮罩 `z-index: 60` 高于页面元素
- 确认 `v-if="showModal"` 逻辑正确绑定

### 13.3 问题 3：粒子不随鼠标移动、点击不显示问题（核心修复）

**根因分析**：`useParticleSystem` composable 内部维护了两个独立的 questions 池：
1. `particles[i].questionData` — 初始化时绑定到每个粒子上
2. `const questions = reactive([])` — 独立的响应式数组，`handleClick` 从这里随机取题

问题在于：
- `ParticlePage.vue` 的 `questions` 初始值为 `[]`（空数组），粒子初始化时 `questionData` 全为 null
- API 异步加载完成后，`questions.value` 更新了，但 composable 内部的 `questions` 池从未被填充
- 因此 `handleClick` 随机取题时，池为空 → 返回 `questionData: null` → 弹窗不显示

**修复**：在 `ParticleCanvas.vue` 中添加 `watch` 监听 `props.questions` 变化，当 API 数据到达时调用 `ps.setQuestions(newQuestions)` 同步到 composable 内部池。

```javascript
watch(
  () => props.questions,
  (newQuestions) => {
    if (newQuestions && newQuestions.length > 0) {
      ps.setQuestions(newQuestions)
    }
  },
  { deep: true }
)
```

**文件变更**：
- `src/components/ParticleCanvas.vue` — 新增 `watch` 导入和 `setQuestions` 同步逻辑

### 13.4 问题 4：增加粒子数量和鼠标跟随效果

**修复**：修改 `useParticleSystem.js` 中的常量：

| 常量 | 修改前 | 修改后 | 说明 |
|------|--------|--------|------|
| `BASE_MIN` | 150 | **250** | 最少基础粒子数 |
| `BASE_MAX` | 200 | **350** | 最多基础粒子数 |
| `TRAIL_MAX` | 100 | **150** | 鼠标跟随粒子最大数量 |
| `MOUSE_ATTRACT_RADIUS` | 200 | **250** | 鼠标吸引半径增大 |
| `TRAIL_SPAWN_MIN` | 2 | **3** | 每次鼠标移动最少生成粒子数 |
| `TRAIL_SPAWN_MAX` | 3 | **5** | 每次鼠标移动最多生成粒子数 |
| `TRAIL_LIFE_MAX` | 90 | **100** | 跟随粒子最大生命周期 |

**效果**：粒子总数从 ~150-200 提升到 ~250-350，鼠标移动时生成更多跟随粒子（3-5 个 vs 原来的 2-3 个），吸引范围扩大到 250px。

---

---

## 13. 合并后启动方式

合并已完成，需要同时启动前端和后端：

### 终端 1 — 后端服务

```bash
cd /home/dxl/she-can-do-anything-main/backend
npm install          # 首次运行：安装 express, cors, sql.js
npm start            # 启动后端，监听 http://localhost:3001
```

### 终端 2 — 前端开发服务器

```bash
cd /home/dxl/she-can-do-anything-main
npm install          # 首次运行：安装 vue, vite, axios 等
npm run dev          # 启动前端，监听 http://localhost:8887
```

### 浏览器访问

打开 `http://localhost:8887`，导航到「问答广场」即可体验完整流程：
1. 点击「公开提问」→ 弹出提问框 → 填写问题 + 选择时间类型 → 提交
2. 点击「回答问题」→ 进入粒子页面 → 点击粒子 → 回答/跳过
3. 粒子页面底部「返回问答广场」可回到入口页
