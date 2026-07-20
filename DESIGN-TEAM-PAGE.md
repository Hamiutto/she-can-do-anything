# 团队思考板块 — 合并方案

> 日期：2026-07-19
> 数据来源：`SHE-IS-网站单文件版-v3.html`

---

## 1. 需求总览

- 新增"团队思考"板块，加入导航栏
- 包含三个子标签页：团队阵容、商业价值、灵感来源
- 风格与项目整体前端设计系统保持一致（毛玻璃、圆角、紫色主题）
- 点击导航栏可跳转到该板块

---

## 2. 现有内容分析

### 2.1 团队阵容（5 位成员）

| 姓名 | 角色 | 一句话 | 技能标签 |
|------|------|--------|---------|
| 舒婷 | 队长 / 创意统筹 | "把"她行"从一句口号，变成一张可走的经验地图" | 营销推广、品牌叙事、用户洞察、团队统筹 |
| 冻冻 | 队员 / 产品技术开发 | "让想法 1 小时落地成页面，而不是停在文档里" | MVP 规划、AI Native 开发、前端实现、系统部署 |
| 杨硕 | 队员 / 市场融资叙事 | "让评审一眼看懂"这件事为什么值得投"" | 黑客松获奖经验、路演演讲、AI 工具落地、用户增长 |
| 阿紫 | 队员 / 内容用户洞察 | "用用户听得懂的话，讲她正在经历的事" | 内容创作、用户洞察、商业诊断、AI 应用 |
| 晓蕾 | 队员 / 全栈技术实现 | "负责让作品稳定、丝滑、随时能打开" | 系统梳理、全栈开发、Bug 定位、视觉动效 |

### 2.2 商业价值

- 商业模式公式：真实女性样本 × AI 同频匹配 × 付费轻咨询 × 回声沉淀
- 冷启动 1000 人预估：5% 付费转化、¥99 均价、20% 平台服务费
- 三阶段规划：短期（0-6 月）、中期（6-18 月）、长期（18 月+）

### 2.3 灵感来源

6 张卡片：五种时间理论、21 位评委、真实女性困境、AI 工具、回声瓶机制、她行信仰

---

## 3. 页面设计

### 3.1 路由规划

新增路由：
```
/team → TeamPage.vue（团队思考页面）
```

### 3.2 导航栏变更

在 TopNav 中新增"团队思考"导航按钮，位于"问答广场"之后：
```
[She is] [五种时间] [人生模板] [问问她] [团队思考]
```

### 3.3 页面结构

```
┌──────────────────────────────────────────────┐
│ [TopNav 导航栏]                              │
├──────────────────────────────────────────────┤
│                                              │
│  我们是谁，为什么做这件事                     │
│  5 个人，一个共同目标：让女性的真实经验        │
│  被看见、被链接、被回应。                     │
│                                              │
│  [ 👥 团队阵容 ] [ 💰 商业价值 ] [ 💡 灵感来源 ] │
│                                              │
│  ── 当前激活的标签页内容 ──                  │
│                                              │
└──────────────────────────────────────────────┘
```

### 3.4 标签页交互

使用 Vue 响应式状态切换三个标签页，点击切换时：
- 当前标签高亮（白色背景 + 阴影）
- 非激活标签灰色
- 内容区域淡入动画（fadeUp）

---

## 4. 修改方案

### 4.1 新增文件

| 文件 | 说明 |
|------|------|
| `src/pages/TeamPage.vue` | 团队思考页面（三标签页：阵容/商业/灵感） |
| `src/data/team.js` | 团队数据（5 位成员信息 + 灵感来源） |

### 4.2 修改文件

| 文件 | 变更 |
|------|------|
| `src/router.js` | 新增 `/team` 路由 |
| `src/components/TopNav.vue` | 新增"团队思考"导航按钮 |
| `src/styles.css` | 追加团队卡片、标签页样式 |

### 4.3 TeamPage.vue 核心结构

```vue
<script setup>
import { ref } from 'vue'
import { teamMembers, businessModel, inspirationCards } from '../data/team.js'

const activeTab = ref('team')
const tabs = [
  { key: 'team', label: '👥 团队阵容' },
  { key: 'value', label: '💰 商业价值' },
  { key: 'inspiration', label: '💡 灵感来源' },
]
</script>

<template>
  <section class="page-section section is-active">
    <div class="page-card team-card">
      <h2>我们是谁，为什么做这件事</h2>
      <p class="lead">5 个人，一个共同目标：让女性的真实经验被看见、被链接、被回应。</p>

      <!-- Tab bar -->
      <div class="team-tabs">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          :class="['team-tab', { active: activeTab === tab.key }]"
          @click="activeTab = tab.key"
        >
          {{ tab.label }}
        </button>
      </div>

      <!-- Team Members -->
      <div v-show="activeTab === 'team'" class="team-content">
        <div class="team-grid">
          <div v-for="member in teamMembers" :key="member.name" class="member-card">
            <div class="member-avatar">{{ member.avatar }}</div>
            <h4>{{ member.name }}</h4>
            <div class="member-role">{{ member.role }}</div>
            <p class="member-tagline">"{{ member.tagline }}"</p>
            <div class="member-skills">
              <span v-for="skill in member.skills" :key="skill" class="member-skill">{{ skill }}</span>
            </div>
            <p class="member-story">{{ member.story }}</p>
          </div>
        </div>
      </div>

      <!-- Business Value -->
      <div v-show="activeTab === 'value'" class="team-content">
        <!-- 商业模式公式 + 冷启动数据 + 三阶段规划 -->
      </div>

      <!-- Inspiration -->
      <div v-show="activeTab === 'inspiration'" class="team-content">
        <div class="inspire-grid">
          <div v-for="card in inspirationCards" :key="card.title" class="inspire-card">
            <div class="inspire-emoji">{{ card.emoji }}</div>
            <h4>{{ card.title }}</h4>
            <p>{{ card.body }}</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
```

### 4.4 team.js 数据结构

```javascript
export const teamMembers = [
  {
    name: '舒婷',
    role: '队长 / 创意统筹',
    avatar: '舒',
    tagline: '把"她行"从一句口号，变成一张可走的经验地图',
    skills: ['营销推广', '品牌叙事', '用户洞察', '团队统筹'],
    story: '91 年出生的团队"大姐"，深信"AI 越强大，人类的温情就越重要"。她发起的这个项目，源于一个长期洞察：人和人之间存在巨大的信息与认知壁垒，但破圈之后，你的来时路就是别人的困境——这才是真正的女性帮助女性。',
  },
  // ... 其余 4 位
]

export const inspirationCards = [
  { emoji: '🕐', title: '五种时间理论', body: '趁早创始人王潇提出的女性时间管理框架...' },
  // ... 其余 5 个
]
```

### 4.5 导航栏变更

在 TopNav.vue 的导航链接中新增：
```html
<RouterLink class="nav-link" :class="{ 'is-active': activeKey === 'team' }" to="/team">团队思考</RouterLink>
```

在 `activeKey` computed 中新增：
```javascript
if (route.path === '/team') return 'team'
```

### 4.6 CSS 样式（适配项目现有风格）

团队卡片使用 `.page-card` 基础样式，内部元素复用项目现有变量：
- 头像：使用 `var(--lavender)` 渐变色圆形
- 技能标签：复用 `.mini-tags` 样式
- Tab 栏：使用 pill 按钮风格（`border-radius: 999px`）
- 灵感卡片：复用 `.qa-card` 卡片样式

---

## 5. 代码变更清单

| 步骤 | 文件 | 操作 |
|------|------|------|
| 1 | `src/data/team.js` | 新建，定义团队数据和灵感来源 |
| 2 | `src/pages/TeamPage.vue` | 新建，团队思考页面 |
| 3 | `src/router.js` | 新增 `/team` 路由 |
| 4 | `src/components/TopNav.vue` | 新增"团队思考"导航 |
| 5 | `src/styles.css` | 追加团队相关样式（可选，优先复用现有） |

---

## 6. 影响评估

| 影响 | 说明 |
|------|------|
| 现有功能 | 不受影响 |
| 导航栏 | 新增一个按钮，其余不变 |
| 移动端 | 标签栏可横向滚动，团队卡片响应式（5→3→2→1 列） |
| 性能 | 纯前端静态数据，无额外 API 调用 |

---

## 7. 与源文件的差异

| 源文件（单文件版） | 本项目（Vue 版） | 说明 |
|-------------------|-----------------|------|
| CSS-only radio tab | Vue `v-show` + `activeTab` | 更灵活，支持动画 |
| base64 头像图片 | 首字母头像 | 与现有 PersonCard 风格一致 |
| 硬编码 HTML | 数据驱动 + 组件渲染 | 更易维护 |
| 独立 CSS 变量 | 复用项目 CSS 变量 | 风格统一 |
