# She Can Do Anything — 项目代码分析文档

> 一个基于 Vue 3 的女性经验探索平台，以"五种时间"理论为核心，通过真实人物样本（评委 + 组员）展示不同人生路径，支持标签筛选、关键词搜索、人物详情查看和提问功能。

---

## 项目概览

| 项目 | 说明 |
|------|------|
| **技术栈** | Vue 3 + Vite + Vue Router |
| **构建方式** | 纯前端 SPA，无后端服务 |
| **数据源** | 本地 JS 文件（26 位人物数据 + 标签池） |
| **入口文件** | `index.html` → `src/main.js` |
| **开发服务器** | `npm run dev`（端口 **8887**） |

---

## 运行方式

### 前置要求

| 依赖 | 最低版本 | 说明 |
|------|---------|------|
| Node.js | >= 18, < 20 | Vite 5.x 兼容 Node.js 18，Vite 6+ 需要 Node.js 20+ |
| npm | >= 9 | 随 Node.js 自带 |
| 浏览器 | 任意现代浏览器 | Chrome / Firefox / Edge / Safari |

> **⚠️ Node.js 版本注意**：本项目锁定 Vite ^5.4.0，兼容 Node.js 18。如果你使用 Node.js 20+，可以将 `vite` 升级到 `^6.0.0`。

### 启动步骤

**1. 安装依赖**（仅需首次运行）：
```bash
cd /home/dxl/she-can-do-anything-main
npm install
```

**2. 启动开发服务器**：
```bash
npm run dev
```

终端会显示 Vite 的启动信息：
```
  VITE v5.4.21  ready in 333 ms

  ➜  Local:   http://localhost:8887/
  ➜  Network: use --host to expose
```

**3. 浏览器访问**：打开 `http://localhost:8887` 即可看到应用。

### 常用命令

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动开发服务器（支持热更新，端口 **8887**） |
| `npm run build` | 生产构建，输出到 `dist/` 目录 |
| `npm run preview` | 预览生产构建产物（需先执行 build） |

### 生产部署

构建后的文件可直接部署到任意静态服务器：
```bash
npm run build
# 产物在 dist/ 目录，可上传到 Nginx、Vercel、GitHub Pages 等
```

### 常见问题

| 问题 | 解决方法 |
|------|---------|
| `styleText` 报错（SyntaxError） | Vite 6+ 不兼容 Node.js 18，本项目已锁定 Vite ^5.4.0，重新 `npm install` 即可 |
| 端口 8887 被占用 | 修改 `vite.config.js` 中的 `server.port`，或用 `npm run dev -- --port 3000` 临时指定 |
| 页面空白 | 确认浏览器控制台无报错，检查 `npm run dev` 是否正常启动 |
| `npm install` 报错 | 确认 Node.js 版本在 18.x（`node -v` 检查） |

---

## 完整文件清单

```
she-can-do-anything-main/
├── index.html                          # HTML 入口
├── package.json                        # 项目依赖配置
├── package-lock.json                   # 依赖锁定文件
├── vite.config.js                      # Vite 构建配置
├── .gitignore                          # Git 忽略规则
├── she-is-enhanced.html                # 增强版单文件演示页
└── src/
    ├── main.js                         # 应用入口
    ├── App.vue                         # 根组件
    ├── router.js                       # 路由配置
    ├── styles.css                      # 全局样式（约 1250 行）
    ├── data/
    │   ├── people.js                   # 人物数据（26 位）
    │   └── tags.js                     # 标签池 + 布局配置
    ├── utils/
    │   └── peopleFilters.js            # 人物筛选/排序工具函数
    ├── pages/
    │   ├── HomePage.vue                # 首页
    │   ├── FiveTimesPage.vue           # 五种时间页
    │   ├── LifeTemplatesPage.vue       # 人生模板页
    │   └── QaSquarePage.vue            # 问答广场页
    └── components/
        ├── AppLayout.vue               # 应用壳组件
        ├── TopNav.vue                  # 顶部导航栏
        ├── LandingHero.vue             # 首页英雄区
        ├── SheIsSearchSection.vue      # She is 搜索区
        ├── DynamicTagCloud.vue         # 动态标签云
        ├── TimeEntryChips.vue          # 时间类型快捷按钮
        ├── PersonGrid.vue              # 人物卡片网格
        ├── PersonCard.vue              # 单个人物卡片
        ├── PersonDetail.vue            # 人物详情页
        ├── AskQuestionModal.vue        # 提问弹窗
        ├── NotificationDropdown.vue    # 通知下拉面板
        └── Toast.vue                   # 全局提示组件
```

---

## 文件详细说明

### 一、配置层

#### `index.html` — HTML 入口

| 属性 | 说明 |
|------|------|
| **作用** | 整个应用的 HTML 壳，挂载 `#app` 根节点 |
| **内容** | 声明 `<!DOCTYPE html>`、viewport 元标签、UTF-8 编码，引入 Vite 的 `/src/main.js` 模块入口 |
| **依赖** | 无外部依赖，Vite 在构建时自动注入 CSS/JS |

#### `package.json` — 项目依赖配置

| 属性 | 说明 |
|------|------|
| **作用** | 定义项目脚本和依赖 |
| **脚本** | `dev`: 启动 Vite 开发服务器；`build`: 生产构建；`preview`: 预览构建产物 |
| **依赖** | `vue`（Vue 3 框架）、`vue-router`（前端路由）、`@vitejs/plugin-vue`（Vite Vue 插件）、`vite`（构建工具） |

#### `vite.config.js` — Vite 构建配置

| 属性 | 说明 |
|------|------|
| **作用** | 配置 Vite 构建行为 |
| **内容** | 仅启用 Vue 插件，无额外配置（无代理、无别名） |

#### `.gitignore` — Git 忽略规则

| 属性 | 说明 |
|------|------|
| **作用** | 指定不应被 Git 跟踪的文件/目录 |
| **通常包含** | `node_modules/`、`dist/`、`.DS_Store`、`*.local` 等 |

---

### 二、应用入口层

#### `src/main.js` — 应用入口

| 属性 | 说明 |
|------|------|
| **行数** | 6 行 |
| **作用** | 创建 Vue 应用实例，挂载到 `#app` 元素 |
| **做的事** | 引入 CSS 样式、App 根组件、路由配置，调用 `createApp(App).use(router).mount('#app')` |
| **依赖** | `vue`、`./styles.css`、`./App.vue`、`./router` |

#### `src/App.vue` — 根组件

| 属性 | 说明 |
|------|------|
| **作用** | 应用最外层壳，管理全局状态（Toast 消息、提问弹窗） |
| **核心状态** | `toastMessage`（提示文字）、`modalPerson`（被提问的人物对象） |
| **核心方法** | `showToast()` — 显示提示；`openAskModal()` / `closeAskModal()` — 控制提问弹窗；`handleQuestionSent()` — 提问发送后的回调 |
| **组件树** | `<AppLayout>` 包裹 `<RouterView>` + `<AskQuestionModal>` + `<Toast>` |
| **事件流** | 子组件通过 `emit('toast', msg)` 向上冒泡提示消息；通过 `emit('ask-person', person)` 打开提问弹窗 |

#### `src/router.js` — 路由配置

| 属性 | 说明 |
|------|------|
| **作用** | 定义应用的 4 个页面路由 |
| **路由表** | |

| 路径 | 路由名 | 组件 | 说明 |
|------|--------|------|------|
| `/` | `home` | `HomePage` | 首页（着陆 + 搜索 + 人物展示） |
| `/five-times` | `five-times` | `FiveTimesPage` | 五种时间理论介绍页 |
| `/life-templates` | `life-templates` | `LifeTemplatesPage` | 人生模板页（支持搜索参数） |
| `/qa-square` | `qa-square` | `QaSquarePage` | 问答广场（待开发） |

- 支持 `scrollBehavior`：根据 URL hash 平滑滚动到对应锚点

---

### 三、数据层

#### `src/data/people.js` — 人物数据

| 属性 | 说明 |
|------|------|
| **作用** | 定义 26 位人物（21 位评委 + 5 位组员）的完整数据 |
| **数据结构** | 每个 `basePeople` 数组项是一个元组：`[id, name, role, avatar, city, age, industry, tags, mbti, zodiac, hobbyTags, tagline, canHelp, helpedCount, thanksCount, completeness]` |
| **字段说明** | |

| 字段 | 类型 | 说明 | 示例 |
|------|------|------|------|
| `id` | String | 唯一标识 | `'judge-01'` |
| `name` | String | 人物名称 | `'评委 01'` |
| `role` | String | 角色（评委/组员） | `'评委'` |
| `avatar` | String | 头像缩写 | `'01'` |
| `city` | String | 城市 | `'北京'` |
| `age` | Number | 年龄 | `36` |
| `industry` | String | 行业 | `'互联网'` |
| `tags` | Array | 核心标签 | `['创业', '职场发展', '赚钱时间']` |
| `mbti` | String | MBTI 人格类型 | `'INTJ'` |
| `zodiac` | String | 星座 | `'摩羯座'` |
| `hobbyTags` | Array | 爱好标签 | `['写作', '旅行']` |
| `tagline` | String | 人物座右铭/标签语 | `'从产品、商业与人的需求之间…'` |
| `canHelp` | Array | 能提供的帮助领域 | `['产品判断', '职场发展', '创业']` |
| `helpedCount` | Number | 帮助过的人数 | `18` |
| `thanksCount` | Number | 收到感谢信数量 | `7` |
| `completeness` | Number | 资料完整度百分比 | `92` |
| `story` | String | 人物故事（自动生成占位文本） | — |

- 通过 `.map()` 将元组转换为语义化对象，自动生成 `story` 字段

#### `src/data/tags.js` — 标签池与配置

| 属性 | 说明 |
|------|------|
| **作用** | 定义标签分类体系、气泡布局位和时间类型常量 |
| **导出** | |

| 导出 | 类型 | 说明 |
|------|------|------|
| `tagPool` | Array | 36 个标签，分为 8 个类别 |
| `bubbleSlots` | Array | 12 个气泡的百分比坐标 `(x, y)` |
| `timeTags` | Array | 5 种时间类型标签 |
| `categoryStyle` | Object | 类别 → 颜色的映射 |

- **标签类别（8 类）**：

| 类别 | 标签数 | CSS 变量色 | 示例 |
|------|--------|-----------|------|
| `city` | 4 | `--lavender` | 北京、上海、西安、成都 |
| `industry` | 4 | `--coral` | 互联网、教育、金融、自由职业 |
| `stage` | 6 | `--green` | 转行、创业、GAP、留学、育儿、离异重启 |
| `help` | 5 | `--orange` | 职场发展、自我成长、理财、婚恋情感、时间管理 |
| `time` | 5 | `--blue` | 生存时间、赚钱时间、好看时间、好玩时间、心流时间 |
| `zodiac` | 4 | `--yellow` | 双子座、天蝎座、摩羯座、射手座 |
| `mbti` | 5 | `--lavender` | INTJ、ENFP、INFJ、ENTP、ISFJ |
| `hobby` | 7 | `--mint` | 跳舞、唱歌、旅行、摄影、写作、健身、手作 |

#### `src/utils/peopleFilters.js` — 人物筛选与排序工具

| 属性 | 说明 |
|------|------|
| **作用** | 提供人物数据的搜索、标签匹配、排序功能 |
| **导出函数** | |

| 函数 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `getSearchableText(person)` | 人物对象 | String | 将人物的所有文本字段拼接为一个可搜索字符串 |
| `matchesTag(person, tag)` | 人物对象、标签字符串 | Boolean | 判断人物是否匹配指定标签（精确匹配城市、行业、MBTI、星座、标签等） |
| `matchesKeyword(person, keyword)` | 人物对象、关键词 | Boolean | 模糊搜索（在名称、座右铭、故事、标签中查找包含关系） |
| `sortPeople(list, sortMode, query)` | 人物数组、排序模式、查询词 | Array | 按匹配度/资料完整度/帮助人数排序，返回新数组 |

- **排序模式（3 种）**：
  - `match` — 按匹配度（精确标签命中 ×3 + 关键词命中 ×1）
  - `complete` — 按资料完整度百分比
  - `helped` — 按帮助过的人数

---

### 四、页面层（Pages）

#### `src/pages/HomePage.vue` — 首页

| 属性 | 说明 |
|------|------|
| **作用** | 应用主入口页面，整合着陆区、搜索区、人物展示区 |
| **子组件** | `<LandingHero>` → `<SheIsSearchSection>` → `<PersonGrid>` → `<PersonDetail>` |
| **核心功能** | |

| 功能 | 实现 |
|------|------|
| 人物轮播 | 每 5.2 秒自动轮换 2 张人物卡片（从 26 人中循环取 6 张） |
| 标签筛选 | 监听 `selectedTags`，从 `people` 中过滤匹配人物，按匹配度排序展示最多 6 张 |
| 排序切换 | 支持 3 种排序：匹配度、完整度、帮助人数 |
| 人物详情 | 点击"查看她的故事"打开 `<PersonDetail>`，平滑滚动到详情页 |
| 路由锚点 | 支持 URL `#sheis` 锚点自动滚动到搜索区 |
| 清空筛选 | 重置标签、排序、选中人物 |

- **数据流**：`SheIsSearchSection` 通过 `@tags-change` 事件传递选中标签 → `visiblePeople` computed 实时计算过滤结果 → `<PersonGrid>` 渲染

#### `src/pages/FiveTimesPage.vue` — 五种时间页

| 属性 | 说明 |
|------|------|
| **作用** | 展示五种时间理论的定义和解释 |
| **内容** | 5 张时间定义卡片，每张包含：中文标题、英文翻译、详细描述 |
| **五种时间** | |

| 时间 | 英文 | 说明 |
|------|------|------|
| 生存时间 | Survival Time | 为生存必须付出的时间，外部驱动，被动感 |
| 赚钱时间 | Value Time | 为创造价值投入的时间，提升竞争力 |
| 好看时间 | Wellness Time | 为维持和提升外貌/健康投入的时间 |
| 好玩时间 | Joy Time | 为体验乐趣、探索新奇、获得放松投入的时间 |
| 心流时间 | Flow Time | 为获得心流体验投入的时间，高度专注 |

#### `src/pages/LifeTemplatesPage.vue` — 人生模板页

| 属性 | 说明 |
|------|------|
| **作用** | 从 URL 查询参数中获取搜索条件，展示匹配的人物样本 |
| **支持的查询参数** | `keyword`（关键词）、`tag`（单个标签）、`tags`（多个标签逗号分隔） |
| **筛选逻辑** | 同时支持 `tag`、`tags`、`keyword` 三种查询方式，可组合使用 |
| **匹配排序** | 匹配标签时按命中数量降序 + 完整度降序；最多展示 6 张卡片 |
| **空状态** | 无匹配时显示"暂时没有匹配样本"提示 |
| **人物详情** | 与 HomePage 共享 `<PersonDetail>` 组件 |

#### `src/pages/QaSquarePage.vue` — 问答广场页

| 属性 | 说明 |
|------|------|
| **作用** | 预留页面，展示公开提问、回答和感谢信（待开发） |
| **当前内容** | 3 张占位卡片：公开提问、真实回答、感谢信 |
| **状态** | 纯静态展示，无动态数据 |

---

### 五、组件层（Components）

#### `src/components/AppLayout.vue` — 应用壳组件

| 属性 | 说明 |
|------|------|
| **作用** | 包装整个应用的外壳，提供 `<TopNav>` 导航栏和内容插槽 |
| **结构** | `<main class="app-shell">` → `<TopNav>` + `<slot>` |
| **事件透传** | 将 `<TopNav>` 的 `toast` 事件向上冒泡 |

#### `src/components/TopNav.vue` — 顶部导航栏

| 属性 | 说明 |
|------|------|
| **作用** | 固定顶部导航，提供品牌展示、页面导航、通知入口、登录入口 |
| **导航项** | `She is`（首页锚点）、`五种时间`、`人生模板`、`问答广场` |
| **活跃状态** | 根据当前路由路径高亮对应导航项 |
| **功能按钮** | 消息通知（♡ 图标 + 红点 badge = 3）、登录按钮 |
| **子组件** | `<NotificationDropdown>` — 通知下拉面板 |

#### `src/components/LandingHero.vue` — 首页英雄区

| 属性 | 说明 |
|------|------|
| **作用** | 首页顶部的品牌展示区，包含标题、描述、CTA 按钮和 AI 创造者流程展示 |
| **内容** | |
| 品牌 | "CODING LADY · 女性 AI 创造者黑客松" + "她来**创造**" |
| 副标题 | "SHE IS ____" |
| 描述 | "在真实女性经验里，找到属于自己的时间与人生样本…" |
| CTA 按钮 | "开始探索"（滚动到搜索区）+ "查看五种时间"（跳转路由） |
| AI 流程展示 | 3 步流程：提问 Prompt → 匹配 Match → 回应 Answer |

#### `src/components/SheIsSearchSection.vue` — She is 搜索区

| 属性 | 说明 |
|------|------|
| **作用** | 核心搜索交互区，支持关键词搜索和标签气泡选择 |
| **功能** | |
| 打字动画 | 自动轮播 "正在重启的"、"自由探索的"、"认真赚钱的" 等描述词（每 1.8s 切换） |
| 关键词搜索 | 输入搜索词后跳转至人生模板页（`/life-templates?keyword=xxx`） |
| 标签气泡 | 引入 `<DynamicTagCloud>`，点击标签添加到已选列表 |
| 已选面板 | 显示已选标签，支持逐个移除 |
| 时间快捷入口 | `<TimeEntryChips>` 5 种时间类型按钮，点击跳转五种时间页 |

#### `src/components/DynamicTagCloud.vue` — 动态标签云

| 属性 | 说明 |
|------|------|
| **作用** | 在搜索区内展示 12 个漂浮的标签气泡，定期轮换 |
| **机制** | |
| 布局 | 使用 `bubbleSlots` 中的 12 个 `(x%, y%)` 坐标定位 |
| 轮换 | 每 4.2 秒轮换 4 个标签（`activeStart` 步进 4），带淡入淡出动画 |
| 匹配高亮 | 输入关键词时，匹配的标签会高亮并增加脉冲动画 |
| 选中状态 | 已选标签高亮显示，边框颜色与类别色匹配 |
| 分类着色 | 通过 `data-category` 属性控制气泡的前缀圆点颜色 |

#### `src/components/TimeEntryChips.vue` — 时间类型快捷按钮

| 属性 | 说明 |
|------|------|
| **作用** | 展示 5 种时间类型的快捷入口按钮 |
| **事件** | `@select` — 点击某个时间类型按钮时触发，向上传递选中的标签 |
| **数据来源** | `timeTags` 数组（来自 `tags.js`） |

#### `src/components/PersonGrid.vue` — 人物卡片网格

| 属性 | 说明 |
|------|------|
| **作用** | 将人物数组渲染为 3 列网格（响应式：平板 2 列，手机 1 列） |
| **Props** | `people`（人物数组） |
| **事件** | `open`（打开人物详情）、`toast`（显示提示） |
| **子组件** | 为每个人物渲染一个 `<PersonCard>` |

#### `src/components/PersonCard.vue` — 人物卡片

| 属性 | 说明 |
|------|------|
| **作用** | 单个人物的概览卡片，展示基本信息和标签 |
| **展示内容** | |
| 收藏按钮 | 右上角 ♡ / ★ 切换，点击触发 Toast 提示 |
| 头像 | 圆形头像，显示 avatar 缩写（如 "01"） |
| 基本信息 | 名称 + 角色·城市·年龄·行业·MBTI·星座 |
| 座右铭 | 人物的 tagline |
| 标签 | 最多展示 5 个标签（从 tags + hobbyTags 中取） |
| 统计数据 | "帮过 X 人"、"收到 Y 封感谢信"、"完整度 Z%" |
| 操作按钮 | "查看她的故事 →" 点击触发 `open` 事件 |
| **标签着色** | 通过 `categoryStyle` 映射标签类别到 CSS 变量颜色 |

#### `src/components/PersonDetail.vue` — 人物详情页

| 属性 | 说明 |
|------|------|
| **作用** | 展示单个选定人物的完整信息 |
| **展示内容** | |
| 返回按钮 | "← 返回人物列表" |
| 英雄区 | 大头像 + 姓名 + 基本信息 + 座右铭 + 完整标签列表 |
| 我的故事 | 人物故事段落（当前为占位文本） |
| 我能帮你 | 展示 `canHelp` 标签列表 |
| 帮助记录 | "帮过 X 人 · 收到 Y 封感谢信" + 可展开的感谢信列表 |
| 向她提问 | 底部悬浮的大按钮，触发 `ask` 事件 |
| **Props** | `person`（人物对象） |
| **事件** | `back`（返回）、`ask`（打开提问弹窗） |

#### `src/components/AskQuestionModal.vue` — 提问弹窗

| 属性 | 说明 |
|------|------|
| **作用** | 向指定人物提问的模态对话框 |
| **触发条件** | `person` prop 非 null 时打开 |
| **功能** | |
| 文本输入 | textarea，最多 500 字，实时字数计数 |
| 隐私选择 | 公开（其他人可见）或私密（仅提问者和被问者可见） |
| 发送动画 | 点击"发送提问"后显示"已发送"状态，650ms 后自动关闭 |
| **Props** | `person`（被提问的人物对象） |
| **事件** | `close`（关闭弹窗）、`sent`（提问发送成功） |

#### `src/components/NotificationDropdown.vue` — 通知下拉面板

| 属性 | 说明 |
|------|------|
| **作用** | 展示 3 条模拟通知 |
| **内容** | 提问回复、感谢信送达、五种时间测试即将开放 |
| **显示控制** | `open` prop 为 true 时展开，带渐入动画 |
| **状态** | 纯静态展示，后续需要接入真实数据源 |

#### `src/components/Toast.vue` — 全局提示组件

| 属性 | 说明 |
|------|------|
| **作用** | 底部居中的 Toast 消息提示 |
| **机制** | `message` prop 变化时自动显示，2.2 秒后自动触发 `hidden` 事件消失 |
| **样式** | 黑色胶囊形，固定在页面底部，带渐入渐出动画 |
| **Props** | `message`（提示文字） |
| **事件** | `hidden`（提示消失） |

---

### 六、样式层

#### `src/styles.css` — 全局样式

| 属性 | 说明 |
|------|------|
| **行数** | 约 1253 行 |
| **CSS 变量** | 定义 9 个颜色变量 + 字体变量 |

| 变量 | 色值 | 用途 |
|------|------|------|
| `--lavender` | `#6c5ce7` | 主品牌色（紫色） |
| `--coral` | `#fd79a8` | 强调色（粉色） |
| `--ink` | `#2d3436` | 正文颜色 |
| `--paper` | `#fdf6f0` | 背景色（米白） |
| `--mint` | `#00cec9` | 薄荷绿 |
| `--green` | `#57c785` | 绿色 |
| `--orange` | `#f6a65d` | 橙色 |
| `--blue` | `#74b9ff` | 蓝色 |
| `--yellow` | `#f6d365` | 黄色 |

- **布局**：最大宽度 1180px 居中，毛玻璃效果导航栏，多层径向渐变背景
- **动画**：`riseIn`（卡片入场）、`floaty`（气泡漂浮）、`pulse`（匹配标签脉冲）
- **响应式**：两个断点 — 980px（平板适配）、640px（手机适配）
- **毛玻璃效果**：导航栏、卡片、弹窗均使用 `backdrop-filter: blur()` 和半透明背景

---

## 数据流图

```
┌─────────────┐     ┌───────────────┐     ┌─────────────────┐
│ people.js   │     │  tags.js      │     │ peopleFilters.js│
│ (26人数据)   │     │ (36个标签)    │     │ (筛选/排序工具)  │
└──────┬──────┘     └───────┬───────┘     └───────┬─────────┘
       │                    │                     │
       ▼                    ▼                     ▼
┌──────────────────────────────────────────────────────────┐
│                      App.vue                              │
│  ┌─────────────────────────────────────────────────────┐ │
│  │                   AppLayout.vue                      │ │
│  │  ┌──────────┐  ┌────────────────────────────────┐   │ │
│  │  │  TopNav  │  │          RouterView             │   │ │
│  │  │  + Notif │  │  ┌─────────┐  ┌──────────────┐ │   │ │
│  │  │ Dropdown │  │  │HomePage │  │LifeTemplates │ │   │ │
│  │  └──────────┘  │  │(5子组件) │  │(2子组件)     │ │   │ │
│  │                │  └─────────┘  └──────────────┘ │   │ │
│  └──────────────────────────────────────────────────┘   │ │
│  ┌────────────────────┐  ┌──────────────────────────┐   │ │
│  │ AskQuestionModal   │  │ Toast                    │   │ │
│  │ (提问弹窗)          │  │ (全局提示)                │   │ │
│  └────────────────────┘  └──────────────────────────┘   │ │
└──────────────────────────────────────────────────────────┘
```

---

## 组件依赖关系

```
App.vue
├── AppLayout.vue
│   └── TopNav.vue
│       └── NotificationDropdown.vue
├── RouterView
│   ├── HomePage.vue
│   │   ├── LandingHero.vue
│   │   ├── SheIsSearchSection.vue
│   │   │   ├── DynamicTagCloud.vue
│   │   │   └── TimeEntryChips.vue
│   │   ├── PersonGrid.vue
│   │   │   └── PersonCard.vue
│   │   └── PersonDetail.vue
│   ├── FiveTimesPage.vue
│   ├── LifeTemplatesPage.vue
│   │   ├── PersonGrid.vue
│   │   │   └── PersonCard.vue
│   │   └── PersonDetail.vue
│   └── QaSquarePage.vue
├── AskQuestionModal.vue
└── Toast.vue
```

---

## 当前状态与后续开发方向

| 模块 | 当前状态 | 后续可开发 |
|------|---------|-----------|
| 人物数据 | 26 位静态数据（占位名称） | 接入真实人物数据、头像图片 |
| 提问功能 | 模拟发送（setTimeout） | 接入后端 API、WebSocket 实时通信 |
| 通知系统 | 3 条静态模拟数据 | 接入推送服务、实时未读计数 |
| 问答广场 | 纯占位页面 | 实现问答列表、回答交互、感谢信展示 |
| 登录系统 | 按钮 + Toast 模拟 | 接入真实登录认证流程 |
| 五种时间测试 | 仅在页面展示定义 | 实现测试问卷、推荐算法 |
| 收藏功能 | 前端状态，无持久化 | 接入用户收藏数据库 |
| 搜索增强 | 关键词 + 标签匹配 | 全文搜索、模糊推荐 |
