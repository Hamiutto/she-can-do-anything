# 评委信息数据更新方案

> 日期：2026-07-19
> 数据源：`评委信息_新版18字段(1).xlsx`（21 位评委，每人在一个 sheet）

---

## 1. 现状分析

### 1.1 当前 people.js 结构

```javascript
// 21 位评委（judge-01 ~ judge-21）+ 5 位组员（member-01 ~ member-05）
basePeople = [
  ['judge-01', '评委 01', '评委', '01', '北京', 36, '互联网', [...], 'INTJ', '摩羯座', [...], '一句话...', [...], 18, 7, 92],
  // ...共 26 条
]

// 映射为对象
export const people = basePeople.map(([id, name, role, avatar, city, age, industry, tags, mbti, zodiac, hobbyTags, tagline, canHelp, helpedCount, thanksCount, completeness]) => ({
  id, name, role, avatar, city, age, industry, tags, mbti, zodiac,
  hobbyTags, tagline,
  story: `${role}资料待补充。当前使用安全占位...`,
  canHelp, helpedCount, thanksCount, completeness
}))
```

**问题**：
- 所有评委信息为占位数据（名字"评委 01"，tagline 为模板文字，story 为占位文本）
- 缺少真实学历、婚育、推荐人、人生故事等字段

### 1.2 Excel 数据结构

每个评委 sheet 的固定格式（A 列=字段名，B 列=内容，C 列=来源链接）：

| 行号 | 字段名 | 示例 |
|------|--------|------|
| 3 | 昵称 | 潇洒姐（微博@王潇_潇洒姐） |
| 4 | 现在所在城市 | 北京市 |
| 5 | 出生家乡 | 北京 |
| 6 | 年龄 | 46-50 |
| 7 | 学历 | 中国传媒大学播音系本科 → 中国人民大学新媒体硕士 → 长江商学院EMBA |
| 8 | 行业 | 女性成长社区/出版/时间管理 |
| 9 | 婚姻状态 | 已婚（丈夫叶里恩） |
| 10 | 生育状态 | 有子女（女儿叶倚闻） |
| 11 | 一句话介绍自己 | 「五种时间」理论创始人... |
| 12 | 人生故事（300字） | 2001年毕业于中国传媒大学... |
| 13 | 能在哪方面帮助人 | 时间管理方法论、女性成长... |
| 14 | 擅长领域 | 五种时间体系、自律生活规划... |
| 15 | 推荐人 | 活动组委会（主发起人） |
| 16 | 时间标签 | 全五维（生存·赚钱·好看·好玩·心流） |
| 17 | 爱好 | 时间管理、塑身/运动、写作 |
| 18 | MBTI | ENTJ（指挥官） |
| 19 | 星座 | 天蝎座 |
| 20 | 年收入 | 未公开 |

---

## 2. 字段映射方案

### 2.1 提取字段

从 Excel 中提取以下字段用于 people.js 展示：

| 展示字段 | 来源列 | 说明 | 处理规则 |
|---------|--------|------|---------|
| `name` | 昵称（行 3） | 提取括号前的人名 | "潇洒姐（微博@...）" → "潇洒姐" |
| `city` | 现在所在城市（行 4） | 直接取值 | "北京市" → "北京"；"未公开" → "" |
| `age` | 年龄（行 6） | 取范围中间值 | "46-50" → 48；"未公开" → null |
| `education` | 学历（行 7） | **新增字段** | 截取前 50 字符；"未公开" → "" |
| `industry` | 行业（行 8） | 直接取值 | — |
| `marriage` | 婚姻状态（行 9） | **新增字段** | "已婚" / "离异" / "未婚" / "" |
| `parenting` | 生育状态（行 10） | **新增字段** | "有子女" / "" |
| `tagline` | 一句话介绍（行 11） | 直接取值 | 最大 50 字符 |
| `story` | 人生故事（行 12） | 直接取值 | 最大 500 字符，截取后加 "..." |
| `canHelp` | 能在哪方面帮助人（行 13） | 从字符串提取标签 | 用 "、" / "，" / "," 分割为数组 |
| `expertise` | 擅长领域（行 14） | **新增字段** | 从字符串提取标签 |
| `referrer` | 推荐人（行 15） | **新增字段** | 直接取值 |
| `tags` | 时间标签（行 16） | 提取时间类型关键词 | 匹配 "生存/赚钱/好看/好玩/心流" |
| `hobbyTags` | 爱好（行 17） | 从字符串提取 | 用 "、" / "，" 分割 |
| `mbti` | MBTI（行 18） | 提取括号前类型 | "ENTJ（指挥官）" → "ENTJ"；"未公开" → "" |
| `zodiac` | 星座（行 19） | 直接取值 | "未公开" → "" |
| `helpedCount` | — | 无对应字段 | 设为 null |
| `thanksCount` | — | 无对应字段 | 设为 null |
| `completeness` | — | 按有数据字段占比 | 计算得出 |

### 2.2 姓名映射（Excel → 系统 ID）

| 序号 | Excel 姓名 | 系统 ID | 角色 |
|------|-----------|---------|------|
| 01 | 王潇 | judge-01 | 评委 |
| 02 | 李媛媛 | judge-02 | 评委 |
| 03 | 尹乐 | judge-03 | 评委 |
| 04 | 黄硕 | judge-04 | 评委 |
| 05 | Yoyo Yang | judge-05 | 评委 |
| 06 | 袁滚滚 | judge-06 | 评委 |
| 07 | AJ | judge-07 | 评委 |
| 08 | 彭静 | judge-08 | 评委 |
| 09 | Andy | judge-09 | 评委 |
| 10 | 安于 | judge-10 | 评委 |
| 11 | 代临艳 | judge-11 | 评委 |
| 12 | Dr. Michelle He | judge-12 | 评委 |
| 13 | 樊月姣 | judge-13 | 评委 |
| 14 | 李佳芮 | judge-14 | 评委 |
| 15 | 雷蕾 | judge-15 | 评委 |
| 16 | 王小雨 | judge-16 | 评委 |
| 17 | 汪聪 | judge-17 | 评委 |
| 18 | 魏小蕾 | judge-18 | 评委 |
| 19 | 王晓韵 | judge-19 | 评委 |
| 20 | 薛原 | judge-20 | 评委 |
| 21 | 邢琪 | judge-21 | 评委 |

---

## 3. people.js 数据结构变更

### 3.1 新增字段

在映射后的对象中新增以下字段（不影响现有组件）：

```javascript
export const people = basePeople.map((row) => ({
  // 已有字段（保留不变）
  id: row.id,
  name: row.name,
  role: row.role,
  avatar: row.avatar,
  city: row.city,
  age: row.age,
  industry: row.industry,
  tags: row.tags,
  mbti: row.mbti,
  zodiac: row.zodiac,
  hobbyTags: row.hobbyTags,
  tagline: row.tagline,
  story: row.story,
  canHelp: row.canHelp,
  helpedCount: row.helpedCount,
  thanksCount: row.thanksCount,
  completeness: row.completeness,
  
  // ★ 新增字段
  education: row.education,    // 学历
  marriage: row.marriage,      // 婚姻状态
  parenting: row.parenting,    // 生育状态
  expertise: row.expertise,    // 擅长领域（数组）
  referrer: row.referrer,      // 推荐人
  timeTags: row.timeTags,      // 时间类型标签（survival/earning/beauty/fun/flow）
}))
```

### 3.2 basePeople 数组结构变更

```javascript
const basePeople = [
  [
    id, name, role, avatar, city, age, industry,
    tags, mbti, zodiac, hobbyTags, tagline,
    education, marriage, parenting, expertise, referrer, timeTags,
    story, canHelp, helpedCount, thanksCount, completeness
  ],
  // ...
]
```

**注意**：数组长度从 16 列扩展到 23 列，但只在映射函数中按名称取值，不影响现有组件的 `people[n].xxx` 调用。

---

## 4. 数据处理规则

### 4.1 姓名提取

```javascript
// "潇洒姐（微博@王潇_潇洒姐）" → "潇洒姐"
// "AJ（本名孙歌）" → "AJ"
// "汪聪（聪哥/聪姐/聪聪）" → "汪聪"
function extractName(raw) {
  return raw.split(/[（(（]/)[0].trim()
}
```

### 4.2 年龄提取

```javascript
// "46-50" → 48（取中间值）
// "31-35" → 33
// "未公开" → null
function extractAge(raw) {
  if (!raw || raw.includes('未公开')) return null
  const match = raw.match(/(\d+)-(\d+)/)
  if (match) return Math.round((parseInt(match[1]) + parseInt(match[2])) / 2)
  return parseInt(raw) || null
}
```

### 4.3 MBTI 提取

```javascript
// "ENTJ（指挥官）" → "ENTJ"
// "未公开" → ""
function extractMBTI(raw) {
  if (!raw || raw.includes('未公开')) return ''
  return raw.split(/[（(（]/)[0].trim()
}
```

### 4.4 城市清洗

```javascript
// "北京市" → "北京"
// "浙江省-杭州市" → "杭州"
// "亚洲（常驻日本）" → "日本"
function extractCity(raw) {
  if (!raw || raw.includes('未公开')) return ''
  return raw.replace(/市$/g, '').replace(/^.+-/, '').replace(/.*（/g, '').trim()
}
```

### 4.5 标签提取

```javascript
// "时间管理方法论、女性成长社区建设、个人品牌打造" → ["时间管理", "女性成长", "个人品牌"]
function extractTags(raw, maxLen = 60) {
  if (!raw) return []
  return raw
    .split(/[、，,，\s]+/)
    .map(s => s.trim())
    .filter(Boolean)
    .slice(0, 5)
}
```

### 4.6 时间标签映射

```javascript
// "全五维（生存·赚钱·好看·好玩·心流）" → ['survival', 'earning', 'beauty', 'fun', 'flow']
// "赚钱时间 + 心流时间" → ['earning', 'flow']
// "好看时间（健康/生活方式）" → ['beauty']
function extractTimeTags(raw) {
  const mapping = {
    '生存': 'survival',
    '赚钱': 'earning',
    '好看': 'beauty',
    '好玩': 'fun',
    '心流': 'flow',
  }
  const result = []
  for (const [cn, en] of Object.entries(mapping)) {
    if (raw.includes(cn)) result.push(en)
  }
  return result
}
```

### 4.7 人生故事截取

```javascript
// 超过 500 字符时截取并加 "..."
function truncateStory(raw, maxLen = 500) {
  if (!raw) return ''
  if (raw.length <= maxLen) return raw
  return raw.slice(0, maxLen - 3) + '...'
}
```

---

## 5. 实施步骤

1. **编写数据转换脚本**：用 Python 读取 Excel，生成新的 people.js 数据数组
2. **更新 people.js**：替换 `basePeople` 数组，更新映射函数
3. **验证**：启动前端，检查人物卡片显示是否正常
4. **组员数据保持不变**：5 位组员（member-01 ~ member-05）维持现有占位数据

---

## 6. 影响评估

| 组件 | 影响 | 说明 |
|------|------|------|
| PersonCard.vue | 无影响 | 只显示已有字段（name, city, age, industry, tags, tagline 等） |
| PersonDetail.vue | 无影响 | 只显示已有字段，新增字段未被引用 |
| PersonGrid.vue | 无影响 | 只渲染已有字段 |
| peopleFilters.js | 无影响 | 筛选逻辑基于已有字段 |
| HomePage.vue | 无影响 | 展示层不变 |

**风险**：无。所有新增字段均为追加，不修改已有字段名称或类型。现有组件对新字段无引用，不会报错。
