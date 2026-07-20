# 用户系统 & 个人简介 — 设计方案

> 目标项目：`/home/dxl/she-can-do-anything`
> 日期：2026-07-19

---

## 1. 需求总览

| 需求 | 优先级 | 说明 |
|------|--------|------|
| 邮箱 + 密码登录 | **必做** | 注册/登录/登出，JWT Token 鉴权 |
| 个人信息完善 | **必做** | 登录后填写个人资料，含多个字段和标签 |
| 问答广场关联用户 | 选做 | 提问/回答时自动关联登录用户 |

---

## 2. 前端路由规划

在现有 5 条路由基础上新增 3 条：

```
现有路由：
  /                  → HomePage
  /five-times        → FiveTimesPage
  /life-templates    → LifeTemplatesPage
  /qa-square         → QaSquarePage
  /particle          → ParticlePage

新增路由：
  /login             → LoginPage          （登录/注册页）
  /profile           → ProfilePage        （个人资料编辑页）
  /profile/:userId   → ProfilePublicPage   （他人个人主页，公开可见）
```

---

## 3. 页面设计

### 3.1 登录页 `/login`

**布局**：全屏居中卡片，背景与主站一致的渐变底色。

```
┌──────────────────────────────────────────────────────┐
│                    SHE IS ____                       │  ← 品牌标识
│                                                      │
│              ┌──────────────────────────┐            │
│              │   登录 / 注册            │            │
│              │                          │            │
│              │  邮箱                    │            │
│              │  [                    ] │            │
│              │                          │            │
│              │  密码                    │            │
│              │  [                    ] │            │
│              │                          │            │
│              │  [  登录  ]  [  注册  ] │            │
│              │                          │            │
│              │  已有账号？/ 还没有账号？ │            │
│              └──────────────────────────┘            │
│                                                      │
│  ← 返回首页                                          │
└──────────────────────────────────────────────────────┘
```

**交互**：
- 同一组件内切换登录/注册模式
- 登录成功 → 存储 JWT → 跳转回原页面（或首页）
- 注册成功 → 自动登录 → 跳转至 `/profile` 引导完善资料
- 登录失败 → Toast 提示错误原因
- 表单验证：邮箱格式、密码 ≥ 6 位

**导航栏变化**：
- 未登录：「登录」按钮 → 跳转 `/login`
- 已登录：「登录」按钮 → 显示用户昵称，下拉菜单含「我的资料」「登出」

### 3.2 个人资料页 `/profile`

**布局**：分区块表单，与现有 `.page-card` 风格一致。

```
┌──────────────────────────────────────────────┐
│ [TopNav]                                     │
├──────────────────────────────────────────────┤
│                                              │
│  个人资料                                    │
│  ┌────────────────────────────────────────┐  │
│  │                                        │  │
│  │  基本信息                              │  │
│  │  ┌──────────────────────────────────┐ │  │
│  │  │ 昵称      [                ]     │ │  │
│  │  │ 城市      [                ]     │ │  │
│  │  │ 年龄      [                ]     │ │  │
│  │  │ 学历      [ 下拉选择       ]     │ │  │
│  │  │ 行业      [                ]     │ │  │
│  │  │ 婚育      [ 下拉选择       ]     │ │  │
│  │  └──────────────────────────────────┘ │  │
│  │                                        │  │
│  │  自我介绍                              │  │
│  │  ┌──────────────────────────────────┐ │  │
│  │  │ 一句话介绍  [              ]     │ │  │
│  │  │ 人生故事    [              ]     │ │  │
│  │  │              [              ]     │ │  │
│  │  └──────────────────────────────────┘ │  │
│  │                                        │  │
│  │  能力 & 擅长                           │  │
│  │  ┌──────────────────────────────────┐ │  │
│  │  │ 你能在哪方面帮助人  [        ]    │ │  │
│  │  │ 擅长领域            [        ]    │ │  │
│  │  └──────────────────────────────────┘ │  │
│  │                                        │  │
│  │  标签 & 偏好                           │  │
│  │  ┌──────────────────────────────────┐ │  │
│  │  │ 推荐人    [                ]     │ │  │
│  │  │ 时间标签  [💪生存][💰赚钱]...    │ │  │
│  │  │ 爱好      [标签输入，回车添加]    │ │  │
│  │  │ MBTI      [ 下拉 16 型选择 ]     │ │  │
│  │  └──────────────────────────────────┘ │  │
│  │                                        │  │
│  │        [  保存  ]                      │  │
│  └────────────────────────────────────────┘  │
│                                              │
└──────────────────────────────────────────────┘
```

**字段详情**：

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| nickname | 文本 | 是 | 昵称，最大 30 字符 |
| city | 文本 | 否 | 所在城市 |
| age | 数字 | 否 | 年龄，1-120 |
| education | 下拉 | 否 | 高中/专科/本科/硕士/博士/其他 |
| industry | 文本 | 否 | 所在行业 |
| marriage | 下拉 | 否 | 未婚/已婚/离异/丧偶 |
| tagline | 文本 | 否 | 一句话介绍，最大 50 字符 |
| lifeStory | 多行文本 | 否 | 人生故事，最大 2000 字符 |
| canHelp | 文本 | 否 | 你能在哪方面帮助人 |
| expertise | 文本 | 否 | 擅长领域 |
| referrer | 文本 | 否 | 推荐人 |
| timeTags | 多选标签 | 否 | 五种时间标签（多选） |
| hobbies | 标签输入 | 否 | 爱好，回车添加，x 删除 |
| mbti | 下拉 | 否 | 16 型人格选择 |

**交互**：
- 首次登录自动跳转此页
- 保存成功 → Toast 提示 → 可返回首页
- 导航栏用户昵称点击也可进入此页

### 3.3 他人主页 `/profile/:userId`（选做）

公开可见的个人主页，展示已填写的信息。

```
┌──────────────────────────────────────────────┐
│ [TopNav]                                     │
├──────────────────────────────────────────────┤
│                                              │
│  ┌────────────────────────────────────────┐  │
│  │  [头像]  昵称                           │  │
│  │          城市 · 年龄 · 学历             │  │
│  │          行业 · 婚育                    │  │
│  │                                        │  │
│  │  "一句话介绍"                          │  │
│  │                                        │  │
│  │  ─────────────────────────────         │  │
│  │                                        │  │
│  │  人生故事                              │  │
│  │  ...                                   │  │
│  │                                        │  │
│  │  ─────────────────────────────         │  │
│  │                                        │  │
│  │  擅长：xxx, xxx                        │  │
│  │  能提供帮助：xxx                       │  │
│  │                                        │  │
│  │  时间标签：[💪生存] [🎵心流]           │  │
│  │  爱好：读书, 旅行, 摄影                │  │
│  │  MBTI：INTJ                           │  │
│  │                                        │  │
│  │  推荐人：xxx                           │  │
│  └────────────────────────────────────────┘  │
│                                              │
└──────────────────────────────────────────────┘
```

---

## 4. 后端设计

### 4.1 数据库变更

在现有 JSON 存储（`backend/data/questions.json`）基础上新增两张表，使用新的 JSON 文件 `backend/data/users.json`：

```
┌──────────────────────────┐
│       users               │
│──────────────────────────│
│ id (PK, auto-increment)  │
│ email        (unique)     │
│ password_hash             │
│ nickname                  │
│ city                      │
│ age                       │
│ education                 │
│ industry                  │
│ marriage                  │
│ tagline                   │
│ lifeStory                 │
│ canHelp                   │
│ expertise                 │
│ referrer                  │
│ timeTags     (JSON array) │
│ hobbies      (JSON array) │
│ mbti                      │
│ created_at                │
│ updated_at                │
└────────────┬─────────────┘
             │
             │ 1
             │
             │ N
┌────────────▼─────────────┐
│     questions (增强)      │
│──────────────────────────│
│ ... (现有字段保留)         │
│ user_id (FK → users.id)  │  ← 新增
└──────────────────────────┘
```

同时新增 JWT 密钥存储（环境变量 `JWT_SECRET`）。

### 4.2 新增 API 接口

#### 认证相关

| 方法 | 路径 | 说明 | 请求体 | 响应 |
|------|------|------|--------|------|
| POST | `/api/auth/register` | 注册 | `{ email, password, nickname? }` | `{ token, user }` |
| POST | `/api/auth/login` | 登录 | `{ email, password }` | `{ token, user }` |
| GET | `/api/auth/me` | 获取当前用户 | Header: `Authorization: Bearer <token>` | `{ user }` |
| POST | `/api/auth/logout` | 登出 | Header: `Authorization: Bearer <token>` | `{ ok: true }` |

#### 个人资料

| 方法 | 路径 | 说明 | 请求体 | 响应 |
|------|------|------|--------|------|
| GET | `/api/profile` | 获取当前用户资料 | Header: `Authorization: Bearer <token>` | `{ profile }` |
| PUT | `/api/profile` | 更新当前用户资料 | 完整或部分 profile 字段 | `{ profile }` |
| GET | `/api/profile/:userId` | 获取他人公开资料 | 无需认证 | `{ profile (公开字段) }` |

#### 问答（增强）

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| POST | `/api/questions` | 提问 | **需认证**，自动从 token 获取 user_id 和 nickname |
| POST | `/api/questions/:id/answer` | 回答 | **需认证**，自动从 token 获取 user_id 和 nickname |

> 选做：如果未登录状态下调用上述接口，可回退到匿名模式（author = "匿名用户"）。

### 4.3 密码存储

- 使用 `bcrypt`（或 Node.js 原生 `crypto.scrypt`）对密码进行 hash
- 不存储明文密码
- 登录时比对 hash

### 4.4 JWT Token

- 签发：注册/登录成功后生成 JWT，有效期 7 天
- Payload：`{ userId, email, nickname }`
- 前端存储在 `localStorage`（简单方案）或 `httpOnly cookie`（更安全，需额外配置）
- 每次请求携带 `Authorization: Bearer <token>`
- 后端中间件验证 token，解析出 userId 注入到 request

---

## 5. 前端状态管理

### 5.1 用户状态

使用 Vue 3 `reactive` 创建全局用户状态 composable：

```javascript
// src/composables/useAuth.js
const authState = reactive({
  user: null,        // { id, email, nickname, ... }
  token: null,       // JWT token
  isLoggedIn: false,
})
```

提供方法：
- `login(email, password)` → 调用 POST `/api/auth/login` → 存储 token + user
- `register(email, password, nickname)` → 调用 POST `/api/auth/register`
- `logout()` → 清空 token + user → 调用 POST `/api/auth/logout`
- `fetchMe()` → 页面刷新时调用 GET `/api/auth/me` 恢复登录态
- `updateProfile(data)` → 调用 PUT `/api/profile`

### 5.2 路由守卫

在 `router.js` 中添加 `beforeEach` 守卫：

```javascript
router.beforeEach((to) => {
  if (to.meta.requiresAuth && !authState.isLoggedIn) {
    return { path: '/login', query: { redirect: to.fullPath } }
  }
})
```

| 路由 | requiresAuth | 说明 |
|------|-------------|------|
| `/login` | 否 | 未登录可访问，已登录自动跳转 |
| `/profile` | **是** | 仅登录用户可访问 |
| `/profile/:userId` | 否 | 公开页面，所有人可见 |
| `/particle` | 否（选做：是） | 回答功能需登录 |

### 5.3 导航栏改造

**TopNav.vue** 修改：

```
未登录状态：
  [SHE IS ____]  [She is] [五种时间] [人生模板] [问答广场]        [🔔] [登录]

已登录状态：
  [SHE IS ____]  [She is] [五种时间] [人生模板] [问答广场]        [🔔] [昵称 ▾]
                                                                  └─ 我的资料
                                                                  └─ 登出
```

---

## 6. 后端文件变更

### 6.1 新增文件

| 文件 | 说明 |
|------|------|
| `backend/src/routes/auth.js` | 注册/登录/登出接口 |
| `backend/src/middleware/auth.js` | JWT 验证中间件 |
| `backend/src/db/users.js` | 用户 JSON 存储读写 |
| `backend/.env` | 环境变量（JWT_SECRET） |

### 6.2 修改文件

| 文件 | 变更 |
|------|------|
| `backend/src/app.js` | 新增 `/api/auth/*` 路由、新增 `/api/profile/*` 路由、questions/answers 路由接入 auth 中间件 |
| `backend/src/routes/questions.js` | 创建问题时从 req.user 获取 user_id 和 nickname |
| `backend/package.json` | 新增 `bcrypt`（或使用 crypto）、`jsonwebtoken` 依赖 |

---

## 7. 前端文件变更

### 7.1 新增文件

| 文件 | 说明 |
|------|------|
| `src/pages/LoginPage.vue` | 登录/注册页 |
| `src/pages/ProfilePage.vue` | 个人资料编辑页 |
| `src/pages/ProfilePublicPage.vue` | 他人个人主页 |
| `src/composables/useAuth.js` | 全局用户状态 + 认证方法 |
| `src/api/auth.js` | 认证相关 API 封装 |

### 7.2 修改文件

| 文件 | 变更 |
|------|------|
| `src/router.js` | 新增 3 条路由 + 路由守卫 |
| `src/components/TopNav.vue` | 「登录」按钮改为用户信息下拉菜单 |
| `src/App.vue` | onMounted 调用 `fetchMe()` 恢复登录态 |
| `src/api/index.js` | 新增请求拦截器自动携带 token |
| `src/styles.css` | 新增登录页、个人页相关样式 |
| `src/pages/QaSquarePage.vue` | 提问时自动使用登录用户昵称 |

---

## 8. 样式设计原则

所有新增页面严格遵循现有设计规范：

| 元素 | 规范 |
|------|------|
| 背景 | `radial-gradient` + `linear-gradient` 渐变底色（同 body） |
| 卡片 | `.page-card` 样式：圆角 32px、毛玻璃白底、柔和阴影 |
| 按钮 | 复用 `.primary-button`（薄荷绿）、`.soft-button`（白底描边） |
| 输入框 | 复用 `.form-input`、`.form-textarea` 样式 |
| 字体 | `var(--serif)` 用于标题，`var(--sans)` 用于正文 |
| 颜色 | `--lavender` 紫色系主色，`--mint` 按钮色，`--coral` 强调色 |
| 圆角 | 按钮 999px（pill），卡片 26-32px，输入框 8-10px |

---

## 9. 实现阶段

### Phase 1：基础认证（必做）

1. 后端新增 `users.json` 存储 + auth 路由（注册/登录/登出）
2. 后端新增 JWT 中间件
3. 前端新增 `useAuth.js` composable + `api/auth.js`
4. 前端新增 `LoginPage.vue`
5. 修改 `TopNav.vue`：登录按钮交互
6. 修改 `router.js`：新增 `/login` 路由
7. 修改 `App.vue`：启动时恢复登录态

### Phase 2：个人资料（必做）

1. 后端新增 `/api/profile` 路由（GET/PUT）
2. 前端新增 `ProfilePage.vue`
3. 修改 `router.js`：新增 `/profile` 路由 + 守卫
4. 修改 `TopNav.vue`：已登录用户昵称点击跳转 `/profile`

### Phase 3：问答广场关联（选做）

1. 后端 questions/answers 接口接入 auth 中间件
2. 创建/回答问题时自动关联 user_id 和 nickname
3. `QaSquarePage.vue` 提问时预填登录用户昵称
4. 粒子页面回答时自动携带用户信息

---

## 10. 安全考量

| 项目 | 方案 |
|------|------|
| 密码存储 | bcrypt/scrypt hash，永不存明文 |
| Token 传输 | HTTPS 环境（生产），Bearer Token |
| Token 存储 | localStorage（开发）/ httpOnly cookie（生产） |
| 接口防护 | 需要认证的接口必须携带有效 token |
| 输入验证 | 后端验证邮箱格式、密码长度、字段长度上限 |
| SQL/JSON 注入 | JSON 文件存储，无 SQL 注入风险；仍需 XSS 防护 |

---

## 11. 待确认事项

| 事项 | 建议 | 备注 |
|------|------|------|
| 注册是否需要验证码？ | 暂不需要，简化流程 | 后续可加 |
| 密码重置/找回？ | 暂不做 | 后续可加邮箱找回 |
| 头像上传？ | 暂不需要，用昵称首字母生成 | 与现有 PersonCard 风格一致 |
| 登录后是否强制填写资料？ | 不强制，但首次登录引导跳转 `/profile` | 可跳过 |
| 未登录能否提问/回答？ | 可以，匿名模式（author = "匿名用户"） | 选做 |

---

## 12. 实施状态（2026-07-19 已完成）

### Phase 1：基础认证 ✅ 已完成

| 文件 | 状态 |
|------|------|
| `backend/src/db/users.js` | ✅ 新增 |
| `backend/src/middleware/auth.js` | ✅ 新增 |
| `backend/src/routes/auth.js` | ✅ 新增 |
| `backend/src/routes/profile.js` | ✅ 新增 |
| `backend/src/app.js` | ✅ 修改（接入新路由 + auth） |
| `backend/src/db/database.js` | ✅ 修改（支持 user_id 字段） |
| `backend/src/routes/questions.js` | ✅ 修改（支持 user_id 字段） |
| `backend/package.json` | ✅ 修改（新增 jsonwebtoken 依赖） |
| `backend/.env` | ✅ 新增 |
| `src/api/auth.js` | ✅ 新增 |
| `src/api/index.js` | ✅ 修改（请求拦截器携带 token） |
| `src/composables/useAuth.js` | ✅ 新增 |
| `src/pages/LoginPage.vue` | ✅ 新增 |
| `src/pages/ProfilePage.vue` | ✅ 新增 |
| `src/pages/ProfilePublicPage.vue` | ✅ 新增 |
| `src/router.js` | ✅ 修改（3 条新路由 + 守卫） |
| `src/components/TopNav.vue` | ✅ 修改（登录/用户菜单） |
| `src/App.vue` | ✅ 修改（恢复登录态 + 条件 AppLayout） |
| `src/pages/QaSquarePage.vue` | ✅ 修改（预填用户昵称 + 携带 token） |

### 构建验证

```
✓ 119 modules transformed.
✓ built in 1.73s
```

### 后端启动验证

```
[initDb] Database initialized.
[initUsersDb] Users database initialized.
Backend server running on http://localhost:3001
```

---

## 13. 问题修复记录

### 13.1 个人资料无法保存 — 浅拷贝导致数据未持久化

> 发现日期：2026-07-19

#### 现象

填写个人资料后点击"保存"，PUT 接口返回更新后的数据，但刷新页面后数据又恢复为旧值。

#### 根因分析

**`backend/src/db/users.js:75` — `findUserById` 返回浅拷贝**：

```javascript
// 问题代码
if (normalized === 'select * from users where id = ?') {
  const user = data.users.find((u) => Number(u.id) === id)
  return user ? { ...user } : null   // ← 浅拷贝！
}
```

`updateUserProfile` 调用 `findUserById(userId)` 获取浅拷贝，修改拷贝后调用 `saveDb()`：

```
data.users[0] ──→ { nickname: "旧值", ... }    ← 原始对象（未被修改）
findUserById() ──→ { nickname: "旧值", ... }   ← 浅拷贝
修改 ──→ { nickname: "新值", ... }             ← 拷贝被修改
saveDb() ──→ 序列化 data ──→ 写入的是原始对象"旧值"  ← BUG
```

#### 修复

`updateUserProfile` 直接在 `data.users` 数组中查找并修改原始对象：

```javascript
// 修复后
export function updateUserProfile(userId, profile) {
  const user = data.users.find((u) => Number(u.id) === userId)  // ← 原始对象
  // ... 修改原始对象
  saveDb()  // ← 保存的是 data，包含已修改的原始对象
  return sanitizeUser(user)
}
```

**额外修复**：前端 ProfilePage 错误处理改用 `err.response?.data?.error`。

#### 页面文案变更

- 标题："个人资料" → "我的人生样本卡"
- 引导语："完善你的信息，让更多人认识你。" → "写下你的人生轨迹，让更多人看见你的真实模样。"

---

## 14. 常见问题排查

### 14.1 启动后端报错：EADDRINUSE: address already in use :::3001

> 错误信息：`Error: listen EADDRINUSE: address already in use :::3001`

#### 原因

3001 端口已被其他进程占用。通常是之前启动的后端进程没有正常关闭，仍在后台运行。

#### 解决方案

**方案 A：杀掉占用 3001 端口的进程（推荐）**

```bash
# 查看谁在占用 3001 端口
lsof -i :3001
# 或
ss -tlnp | grep 3001

# 杀掉占用进程
fuser -k 3001/tcp

# 确认端口已释放
lsof -i :3001   # 应无输出

# 重新启动后端
cd /home/dxl/she-can-do-anything/backend
npm start
```

**方案 B：一键清理 + 重启**

```bash
pkill -f "node src/app.js"   # 杀掉所有 node 后端进程
sleep 1
cd /home/dxl/she-can-do-anything/backend
npm start
```

**方案 C：更换后端端口（不推荐，仅作为临时方案）**

修改 `backend/src/app.js` 中的端口配置：

```javascript
// 第 11 行附近
const PORT = Number(process.env.PORT || 3002)  // 改为其他端口
```

同时修改前端 `vite.config.js` 的代理目标：

```javascript
proxy: {
  '/api': {
    target: 'http://localhost:3002',  // 与后端端口一致
    changeOrigin: true
  }
}
```

#### 预防措施

- 启动后端时建议使用 `npm run dev`（`--watch` 模式），修改代码后自动重载，减少手动重启频率
- 关闭终端时确认后端进程已退出：`pkill -f "node src/app.js"`
- 使用 `lsof -i :3001` 定期检查端口占用情况
