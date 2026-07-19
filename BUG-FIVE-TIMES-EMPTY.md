# 五种时间页面显示为空 — 根因分析与修复方案

> 日期：2026-07-19

---

## 现象

点击"五种时间"页面中的任意时间卡片（生存时间/赚钱时间/好看时间/好玩时间/心流时间）后，下方显示"暂时没有匹配的样本卡"，所有 26 位人物都不匹配。

---

## 根因分析

**标签值不匹配** — 五种时间页面用中文标签（`'生存时间'`）搜索，但人物数据中 `person.tags` 存储的是英文 key（`'survival'`），导致匹配失败。

### 数据流追踪

**FiveTimesPage.vue** 中的时间定义：

```javascript
const times = [
  { title: '生存时间', tag: '生存时间', ... },  // ← 搜索用 tag
  { title: '赚钱时间', tag: '赚钱时间', ... },
  { title: '好看时间', tag: '好看时间', ... },
  { title: '好玩时间', tag: '好玩时间', ... },
  { title: '心流时间', tag: '心流时间', ... },
]
```

**匹配逻辑**（`FiveTimesPage.vue:55`）：

```javascript
const matchingPeople = computed(() => {
  const filtered = people.filter((person) => matchesTag(person, selectedTime.value))
  // selectedTime.value = '生存时间'（中文）
  return sortPeople(filtered, 'match', selectedTime.value)
})
```

**peopleFilters.js 的 matchesTag**：

```javascript
export function matchesTag(person, tag) {
  const normalized = normalizeText(tag)  // '生存时间' → '生存时间'
  return [
    person.city, person.industry, person.mbti, person.zodiac,
    ...person.tags,      // ← ['survival', 'earning', ...] 英文！
    ...person.hobbyTags
  ].some((value) => normalizeText(value) === normalized)
  // 'survival' !== '生存时间' → 不匹配！
}
```

**对比**：
- 搜索值：`'生存时间'`（中文）
- 人物 tags：`['survival', 'earning', 'beauty', 'fun', 'flow']`（英文 key）
- 结果：永远不匹配 → 空列表

### 历史背景

更新评委数据时，将 `person.tags` 从中文（`'生存时间'`）改为英文 key（`'survival'`），以便后端 API 统一处理。但五种时间页面的筛选逻辑仍然使用中文 tag 进行搜索，造成断裂。

---

## 修复方案

### 方案 A（推荐）：在 matchesTag 中增加中英文映射

修改 `src/utils/peopleFilters.js` 的 `matchesTag` 函数，增加时间类型中英文映射：

```javascript
const TIME_TYPE_MAP = {
  '生存时间': 'survival',
  '赚钱时间': 'earning',
  '好看时间': 'beauty',
  '好玩时间': 'fun',
  '心流时间': 'flow',
}

export function matchesTag(person, tag) {
  if (!tag) return true
  const normalized = normalizeText(tag)
  
  // 如果是时间类型标签，同时匹配中文和英文 key
  const englishKey = TIME_TYPE_MAP[normalized]
  const searchValues = englishKey ? [normalized, englishKey] : [normalized]
  
  return [
    person.city,
    person.industry,
    person.mbti,
    person.zodiac,
    ...person.tags,
    ...person.hobbyTags,
    ...(person.timeLabels || []),  // 新增：也匹配中文 timeLabels
  ].some((value) => searchValues.includes(normalizeText(value)))
}
```

**优点**：一处修改，所有使用 `matchesTag` 的地方自动修复。
**缺点**：无。向后兼容，不影响其他搜索逻辑。

### 方案 B：修改 FiveTimesPage 的时间 tag 为英文 key

```javascript
const times = [
  { title: '生存时间', tag: 'survival', short: '生存', ... },
  { title: '赚钱时间', tag: 'earning', short: '赚钱', ... },
  // ...
]
```

**优点**：直接匹配。
**缺点**：
- 页面显示中使用了 `selectedTimeInfo?.tag`（"带有「生存时间」标签"），改为英文后显示不自然
- 需要同时修改模板中的展示逻辑

### 方案 C：在 people.js 的 tags 中同时存储中英文

```javascript
tags: ['survival', '生存时间', 'earning', '赚钱时间', ...]
```

**优点**：匹配直接。
**缺点**：数据冗余，增加存储和维护成本。

---

## 推荐方案

**方案 A**：在 `peopleFilters.js` 的 `matchesTag` 中增加中英文映射 + 同时匹配 `person.timeLabels`。

### 变更文件

| 文件 | 变更 |
|------|------|
| `src/utils/peopleFilters.js` | `matchesTag` 函数新增时间类型映射 + `person.timeLabels` 匹配 |

### 影响范围

- 五种时间页面：✅ 修复
- 人生模板搜索：不受影响（搜索用模糊匹配，`getSearchableText` 已包含 `person.tags`）
- 问答广场：不受影响
- 其他页面：不受影响
