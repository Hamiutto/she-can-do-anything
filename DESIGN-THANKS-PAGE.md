# 问问她 — "我想感谢"模块开发方案

> 日期：2026-07-19

---

## 1. 需求总览

- 点击"我想感谢"卡片进入新的感谢页面
- 页面使用标签浮动特效展示感谢文案（参考 SheIsSearchSection 的 DynamicTagCloud）
- 每个浮动标签包含：用户名 + 感谢文字
- 支持提交新的感谢

---

## 2. 现状分析

### 2.1 QaSquarePage 当前状态

"我想感谢"卡片当前为纯静态占位，无点击事件：

```html
<article class="qa-card">
  <strong>我想感谢</strong>
  <p>爱出者爱返，福往者福来。</p>
</article>
```

### 2.2 标签浮动特效参考

DynamicTagCloud.vue 实现方式：
- `bubbleSlots` 定义 12 个固定百分比位置 `{ x, y }`
- `tagPool` 提供标签数据池，轮播展示
- `@select` 点击标签触发回调
- CSS `.tag-bubble` 配合 `@keyframes floaty` 实现浮动动画

### 2.3 数据存储

感谢数据暂使用前端本地存储（数组），后续可对接后端 API。

---

## 3. 页面设计

### 3.1 路由规划

新增路由：
```
/thanks → ThanksPage.vue（感谢页面）
```

### 3.2 页面布局

```
┌──────────────────────────────────────────────┐
│ [TopNav]                                     │
├──────────────────────────────────────────────┤
│                                              │
│  感谢墙                                      │
│  爱出者爱返，福往者福来。                     │
│                                              │
│  ┌──────────────────────────────────────┐   │
│  │                                      │   │
│  │   [漂浮标签1]     [漂浮标签3]         │   │
│  │                                      │   │
│  │         [漂浮标签2]                   │   │
│  │                                      │   │
│  │   [漂浮标签4]        [漂浮标签5]      │   │
│  │                                      │   │
│  └──────────────────────────────────────┘   │
│                                              │
│  [  写一条感谢  ]                            │
│                                              │
└──────────────────────────────────────────────┘
```

### 3.3 浮动标签样式

每个标签为圆角气泡卡片，包含：
- 用户名（小字，灰色）
- 感谢文字（正文，深色）

```
┌──────────────────────────┐
│ @潇洒姐                  │  ← 用户名
│ 谢谢你把经验说得这么具体， │
│ 我突然觉得自己不是一个    │  ← 感谢文字
│ 人在摸索。                │
└──────────────────────────┘
```

---

## 4. 修改方案

### 4.1 新增文件

| 文件 | 说明 |
|------|------|
| `src/pages/ThanksPage.vue` | 感谢页面（浮动标签 + 提交表单弹窗） |
| `src/data/thanks.js` | 感谢数据（本地种子数据 + 存储方法） |

### 4.2 修改文件

| 文件 | 变更 |
|------|------|
| `src/router.js` | 新增 `/thanks` 路由 |
| `src/pages/QaSquarePage.vue` | "我想感谢"卡片添加 `@click="goThanks"` 点击事件 |

### 4.3 感谢数据结构

```javascript
// src/data/thanks.js
export const thanksData = ref([
  { id: 1, user: '潇洒姐', text: '谢谢你把经验说得这么具体，我突然觉得自己不是一个人在摸索。' },
  { id: 2, user: '匿名用户', text: '感谢你的分享，让我有勇气迈出了转行的第一步。' },
  // ...
])

export function addThank(user, text) {
  thanksData.value.unshift({
    id: Date.now(),
    user: user || '匿名用户',
    text,
  })
}
```

### 4.4 ThanksPage.vue 核心逻辑

```javascript
<script setup>
import { ref, computed } from 'vue'
import { thanksData, addThank } from '../data/thanks.js'
import { bubbleSlots } from '../data/tags.js'

// 轮播逻辑（同 DynamicTagCloud）
const activeStart = ref(0)
const fading = ref(false)
const showModal = ref(false)
const thankText = ref('')

const activeThanks = computed(() => {
  const len = bubbleSlots.length
  const list = thanksData.value
  return bubbleSlots.map((slot, index) => ({
    ...list[(activeStart.value + index) % list.length],
    ...slot,
  }))
})

function submitThank() {
  if (!thankText.value.trim()) return
  addThank('', thankText.value.trim())  // 后续接入登录用户
  thankText.value = ''
  showModal.value = false
}
</script>
```

### 4.5 标签模板

```html
<div class="thanks-field">
  <div
    v-for="(item, index) in activeThanks"
    :key="item.id + '-' + index"
    class="thanks-bubble"
    :class="{ 'is-fading': fading && index < 4 }"
    :style="{ left: item.x + '%', top: item.y + '%' }"
  >
    <span class="bubble-user">@{{ item.user }}</span>
    <p class="bubble-text">{{ item.text }}</p>
  </div>
</div>
```

### 4.6 标签 CSS（参考 .tag-bubble）

```css
.thanks-field {
  position: relative;
  height: 420px;
  margin: 18px 0;
}

.thanks-bubble {
  position: absolute;
  border: 1px solid rgba(255, 255, 255, 0.70);
  border-radius: 16px;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.82);
  box-shadow: 0 12px 26px rgba(85, 74, 126, 0.11);
  animation: floaty 4.8s ease-in-out infinite;
  max-width: 220px;
  transform: translate(-50%, -50%);
}

.bubble-user {
  display: block;
  font-size: 0.75rem;
  color: var(--lavender, #6c5ce7);
  font-weight: 700;
  margin-bottom: 4px;
}

.bubble-text {
  margin: 0;
  font-size: 0.85rem;
  color: rgba(45, 52, 54, 0.78);
  line-height: 1.6;
}

@keyframes floaty {
  0%, 100% { margin-top: 0; }
  50% { margin-top: -10px; }
}
```

---

## 5. 代码变更清单

| 步骤 | 文件 | 操作 |
|------|------|------|
| 1 | `src/data/thanks.js` | 新建，定义感谢数据结构和种子数据（8-12 条） |
| 2 | `src/pages/ThanksPage.vue` | 新建，感谢页面（浮动标签 + 提交弹窗） |
| 3 | `src/router.js` | 新增 `/thanks` 路由 |
| 4 | `src/pages/QaSquarePage.vue` | "我想感谢"卡片添加 `@click="goThanks"` |

---

## 6. 影响评估

| 影响 | 说明 |
|------|------|
| 现有功能 | 不受影响 |
| 导航栏 | 无需修改 |
| 后端 | 暂无需修改（感谢数据本地存储） |
| 移动端 | 标签使用百分比定位 + `max-width`，兼容响应式 |

---

## 7. 后续扩展

- 感谢数据对接后端 API（`POST /api/thanks`, `GET /api/thanks`）
- 提交感谢时自动携带登录用户信息
- 感谢标签支持点击查看详情
- 感谢数量统计展示
