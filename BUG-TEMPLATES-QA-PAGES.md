# 人生模板 & 问答广场页面打不开 — 根因分析

> 日期：2026-07-19

---

## 现象

打开"人生模板"或"问答广场"页面后白屏，控制台报错。

---

## 根因

**组员数据字段错位** — 更新评委数据时，21 位评委使用了 **23 列** 的新数组格式，但 5 位组员仍保留了旧格式（**19 列**），导致字段映射错位。

### 新格式（评委，23 列）

```javascript
['judge-01', '潇洒姐', '评委', '01', '北京', 48, '行业...', [...], 'ENTJ', '天蝎座', [...], '一句话...',
 '学历...', '已婚', '有子女', [...], '推荐人', [...],  // ← 列 12-17
 '人生故事...', [...], null, null, 100]                // ← 列 18-22
```

### 旧格式（组员，19 列 — 错误）

```javascript
['member-01', '组员 01', '组员', 'M1', '西安', 24, '互联网', [...], 'ENFP', '双子座', [...], '一句话...',
 '', '', '', [...], '',                                // ← 列 12-17
 '我的故事：从转行...', 5, 2, 76]                      // ← 列 18-21: 故事在 18 但 canHelp 在 19 是数字！
```

### 映射函数读取字段

```javascript
export const people = basePeople.map(row => ({
  id: row[0], name: row[1], role: row[2], avatar: row[3], city: row[4], age: row[5], industry: row[6],
  tags: row[7], mbti: row[8], zodiac: row[9], hobbyTags: row[10], tagline: row[11],
  education: row[12], marriage: row[13], parenting: row[14],
  expertise: row[15], referrer: row[16], timeTags: row[17],  // ← 组员这些是空字符串
  story: row[18], canHelp: row[19], helpedCount: row[20], thanksCount: row[21], completeness: row[22]
}))
```

### 实际读取结果（组员）

| 字段 | 应该读到 | 实际读到 | 类型 |
|------|---------|---------|------|
| `story` | 人生故事文本 | `'我的故事：从转行…'` | ✅ 字符串 |
| `canHelp` | 标签数组 `['转行', ...]` | **`5`** | ❌ **数字！** |
| `helpedCount` | 数字 `5` | `2` | ⚠️ 偏移 |
| `thanksCount` | 数字 `2` | `76` | ⚠️ 偏移 |
| `completeness` | 数字 `76` | `undefined` | ❌ |
| `timeTags` | 空数组 `[]` | `'我的故事：从转行…'` | ❌ **字符串！** |
| `hobbyTags` | 数组 | 正常 | ✅ |
| `tags` | 数组 | 正常 | ✅ |

### 崩溃链路

```
LifeTemplatesPage.vue 加载
  → import { people } from '../data/people'
    → peopleFilters.js: getSearchableText(person)
      → [...person.tags, ...person.hobbyTags, ...person.canHelp]  ← person.canHelp = 5（数字！）
        → Spread 运算符对数字抛出 TypeError: person.canHelp is not iterable
          → 白屏 ❌
```

**同样的问题也影响问答广场** — QaSquarePage 虽不直接使用 people 数据，但通过 App.vue → AppLayout → TopNav 加载，而 TopNav 的 NotificationDropdown 可能间接触发了页面渲染错误。

---

## 修复方案

将 5 位组员的数据也改为 23 列格式，字段对齐评委格式：

```javascript
['member-01', '组员 01', '组员', 'M1', '西安', 24, '互联网',
 ['转行', '好玩时间', '自我成长'], 'ENFP', '双子座', ['跳舞', '摄影'], '正在把自己的观察变成一个可点击的作品。',
 '', '', '', ['共创记录', '原型体验', '好玩时间'], '', [],   // ← 新增 timeTags: []
 '从转行互联网到参与产品设计，正在学习用更清晰的方式表达观察和想法。',  // ← story 放到正确位置
 ['转行', '原型体验', '好玩时间'], 5, 2, 76]
```

关键修正：
1. `timeTags`（列 17）设为 `[]`（空数组）
2. `story`（列 18）放真实人生故事文本（去掉"我的故事："前缀）
3. `canHelp`（列 19）放标签数组
4. `helpedCount`（列 20）放数字
5. `thanksCount`（列 21）放数字
6. `completeness`（列 22）放数字

---

## 修复方案

### 修复 1：组员数据对齐 23 列格式

将 5 位组员的 `basePeople` 条目从 19 列修正为 23 列，关键字段修正：

| 列索引 | 字段 | 旧值（错误） | 新值（正确） |
|--------|------|------------|------------|
| 17 | `timeTags` | `'我的故事：从转行…'`（字符串） | `[]`（空数组） |
| 18 | `story` | `['转行', '原型体验', '好玩时间']`（数组） | 真实人生故事文本（字符串） |
| 19 | `canHelp` | `5`（数字） | 真实 canHelp 标签数组 |
| 20 | `helpedCount` | `2` | 真实数字 |
| 21 | `thanksCount` | `76` | 真实数字 |
| 22 | `completeness` | `undefined` | 真实数字 |

### 修复 2：时间标签显示中文

当前 `tags` 和 `timeTags` 存储的是英文 key（`'survival'`, `'earning'` 等），页面展示时直接显示了英文。需要在展示层增加映射函数将英文转换为中文。

#### 涉及展示的文件

| 文件 | 当前显示方式 | 需要修改 |
|------|------------|---------|
| `PersonCard.vue` | `person.tags` 直接渲染 | 映射为中文 |
| `PersonDetail.vue` | `person.tags` 直接渲染 | 映射为中文 |
| `ProfilePublicPage.vue` | `user.timeTags` 直接渲染 | 映射为中文 |
| `peopleFilters.js` | 搜索匹配用英文 key | **无需修改**（搜索匹配用英文即可） |

#### 映射表

```javascript
const TIME_LABELS = {
  survival: '生存',
  earning: '赚钱',
  beauty: '好看',
  fun: '好玩',
  flow: '心流',
}
```

#### 修改方案

**方案 A（推荐）**：在 people.js 映射时新增 `timeLabels` 字段

在 people 导出映射中增加：

```javascript
export const people = basePeople.map(row => {
  const timeTags = row[17] || []
  const timeLabelMap = { survival: '生存', earning: '赚钱', beauty: '好看', fun: '好玩', flow: '心流' }
  const timeLabels = timeTags.map(t => timeLabelMap[t] || t)
  
  return {
    // ...已有字段
    timeTags,      // 存储用（英文 key，用于搜索匹配）
    timeLabels,    // 展示用（中文标签）
    // ...
  }
})
```

页面展示时使用 `person.timeLabels` 而非 `person.tags`。

**方案 B（更简洁）**：在 people.js 的 `tags` 字段直接存储中文

修改评委数据生成时的 `tags` 提取逻辑：将英文 key 转换为中文存储。但这样会破坏搜索匹配（peopleFilters.js 用英文 key 匹配），不推荐。

**方案 C（最灵活）**：新增全局工具函数

在 `src/utils/peopleFilters.js` 或新建 `src/utils/timeLabels.js`：

```javascript
export const TIME_LABEL_MAP = {
  survival: '生存', earning: '赚钱', beauty: '好看',
  fun: '好玩', flow: '心流',
}

export function toTimeLabels(keys) {
  if (!Array.isArray(keys)) return []
  return keys.map(k => TIME_LABEL_MAP[k] || k)
}
```

各页面引入使用：
```javascript
import { toTimeLabels } from '../utils/timeLabels'
// 模板中：v-for="label in toTimeLabels(person.tags)"
```

**推荐方案 A + C 组合**：数据层提供 `timeLabels` 字段，同时提供工具函数供没有 `timeLabels` 的旧数据使用。

---

## 完整修复清单

| 步骤 | 文件 | 操作 |
|------|------|------|
| 1 | `src/data/people.js` | 修正 5 位组员的 basePeople 条目为 23 列格式 |
| 2 | `src/data/people.js` | 映射函数中新增 `timeLabels` 字段（英文 → 中文） |
| 3 | `src/components/PersonCard.vue` | `person.tags` → `person.timeLabels` |
| 4 | `src/components/PersonDetail.vue` | `person.tags` → `person.timeLabels` |
| 5 | `src/pages/ProfilePublicPage.vue` | `user.timeTags` → 使用中文字段 |
| 6 | `src/utils/timeLabels.js` | 新建工具文件（可选，用于兼容旧数据） |

