# 问答广场 — 公开提问弹窗增强方案

> 日期：2026-07-19
> 参考实现：`src/components/PersonDetail.vue`（"向她提问"按钮）+ `src/components/AskQuestionModal.vue`

---

## 1. 需求描述

在问答广场页面点击「公开提问」板块后，弹出提问弹窗：
1. 提示用户输入问题内容
2. 选择该问题属于五种时间中的哪一类（💪生存 💰赚钱 💄好看 🎮好玩 🎵心流）
3. 点击"提交问题"发送到后端

---

## 2. 现状分析

### 2.1 QaSquarePage 当前已有基础弹窗

QaSquarePage.vue 已实现了基础提问弹窗（点击卡片 → `openModal()` → `showModal = true`），包含：
- 昵称输入框
- 问题 textarea
- 五种时间类型选择按钮
- 提交按钮 → 调用 `POST /api/questions`

### 2.2 存在的 BUG：time_type 值不匹配

**核心问题**：当前 `timeTypes` 的 `value` 是中文：

```javascript
const timeTypes = [
  { emoji: '💪', label: '生存', value: '生存' },    // ← 中文
  { emoji: '💰', label: '赚钱', value: '赚钱' },    // ← 中文
  // ...
]
```

但后端 `routes/questions.js` 的验证只接受英文 key：

```javascript
const validTimeTypes = ['survival', 'earning', 'beauty', 'fun', 'flow']

const timeType = validTimeTypes.includes(payload?.time_type) ? payload.time_type : 'fun'
```

**结果**：所有通过前端提交的问题 `time_type` 都回退到默认值 `'fun'`，用户选择的类型全部丢失。

### 2.3 参考实现

**PersonDetail.vue** 中"向她提问"的实现方式：
1. 卡片内 `<button @click="emit('ask', person)">` 触发事件
2. `App.vue` 捕获 `@ask-person` → 设置 `modalPerson`
3. `AskQuestionModal.vue` 组件接收 `person` prop，显示针对该人物的提问弹窗

对比之下，QaSquarePage 的弹窗直接在页面内实现（内联），而非独立组件。考虑到这是广场级提问（不针对具体人物），内联实现是合理的，但需要修复数据格式问题。

---

## 3. 修改方案

### 3.1 修复 time_type 字段映射

**文件**：`src/pages/QaSquarePage.vue`

修改 `timeTypes` 的 `value` 为英文 key，与后端保持一致：

```javascript
// 修改前
const timeTypes = [
  { emoji: '💪', label: '生存', value: '生存' },
  // ...
]

// 修改后
const timeTypes = [
  { emoji: '💪', label: '生存', value: 'survival' },
  { emoji: '💰', label: '赚钱', value: 'earning' },
  { emoji: '💄', label: '好看', value: 'beauty' },
  { emoji: '🎮', label: '好玩', value: 'fun' },
  { emoji: '🎵', label: '心流', value: 'flow' },
]

// 同时修改默认值
const timeType = ref('flow')  // 原 '心流' → 'flow'
```

### 3.2 优化弹窗 UI 交互

**增强点**：

| 增强项 | 说明 |
|--------|------|
| 时间类型默认选中 | 默认选中"心流"（flow），点击切换高亮 |
| 登录用户自动预填昵称 | 已实现，保持不变 |
| 表单验证提示 | 未输入问题时禁用提交按钮 |
| 提交成功反馈 | Toast 提示 + 自动关闭弹窗 |
| 登录状态引导 | 未登录用户提问时弹窗底部提示"登录后问题将关联你的账号" |

**弹窗原型**：

```
┌──────────────────────────────────────┐
│  公开提问                    ✕      │
├──────────────────────────────────────┤
│                                      │
│  [已登录：显示你的昵称]               │
│  [未登录：匿名提问]                   │
│                                      │
│  你的问题                              │
│  ┌──────────────────────────────┐   │
│  │ 写下你想问的问题……            │   │
│  │                              │   │
│  └──────────────────────────────┘   │
│                           0/500     │
│                                      │
│  五种时间（选择一个）                  │
│  [💪生存] [💰赚钱] [💄好看]           │
│  [🎮好玩] [🎵心流] ◀ 默认            │
│                                      │
│  ┌──────────────────────────────┐   │
│  │        提交问题               │   │
│  └──────────────────────────────┘   │
│                                      │
│  [未登录提示] 登录后问题将关联你的账号 │
└──────────────────────────────────────┘
```

### 3.3 代码变更清单

| 文件 | 变更类型 | 内容 |
|------|---------|------|
| `src/pages/QaSquarePage.vue` | 修改 | 修复 `timeTypes.value` 为英文 key；默认值改为 `'flow'`；新增未登录提示 |
| 无 | — | 后端无需修改（后端验证逻辑已正确） |

### 3.4 详细代码变更

**QaSquarePage.vue — script 部分**：

```diff
 const timeTypes = [
-  { emoji: '💪', label: '生存', value: '生存' },
-  { emoji: '💰', label: '赚钱', value: '赚钱' },
-  { emoji: '💄', label: '好看', value: '好看' },
-  { emoji: '🎮', label: '好玩', value: '好玩' },
-  { emoji: '🎵', label: '心流', value: '心流' },
+  { emoji: '💪', label: '生存', value: 'survival' },
+  { emoji: '💰', label: '赚钱', value: 'earning' },
+  { emoji: '💄', label: '好看', value: 'beauty' },
+  { emoji: '🎮', label: '好玩', value: 'fun' },
+  { emoji: '🎵', label: '心流', value: 'flow' },
 ]

 function openModal() {
   showModal.value = true
   nickname.value = authState.user?.nickname || ''
   question.value = ''
-  timeType.value = '心流'
+  timeType.value = 'flow'
   errorMsg.value = ''
 }
```

**QaSquarePage.vue — template 部分**：

在提交按钮下方新增未登录提示（可选）：

```diff
       <button class="primary-button submit-btn" ...>
         {{ isSubmitting ? '提交中…' : '提交问题' }}
       </button>
+
+      <p v-if="!authState.isLoggedIn" class="login-hint">
+        登录后问题将关联你的账号，
+        <RouterLink class="hint-link" to="/login">去登录</RouterLink>
+      </p>
     </div>
```

---

## 4. 验证方式

修改后通过以下步骤验证：

1. 启动后端 + 前端
2. 进入问答广场，点击「公开提问」
3. 输入问题，选择五种时间类型（如 💰赚钱）
4. 提交后检查后端数据：

```bash
# 后端数据文件
cat /home/dxl/she-can-do-anything/backend/data/questions.json | python3 -c "
import sys, json
data = json.load(sys.stdin)
q = data['questions'][-1]
print(f'问题: {q[\"content\"]}')
print(f'时间类型: {q[\"time_type\"]}')  # 应显示所选的英文 key，如 'earning'
"
```

预期输出 `time_type` 应与用户选择的按钮一致（如 `earning`），而非全部回退到 `fun`。

---

## 5. 额外优化（Phase 2）

后续可考虑将提问弹窗提取为独立组件 `AskSquareQuestionModal.vue`：
- 与 `AskQuestionModal.vue` 共享相同的 UI 风格
- 支持时间类型选择
- 复用登录用户昵称预填逻辑
- 降低 QaSquarePage 组件复杂度

---

## 6. 问题：点击"公开提问"弹窗无反应（2026-07-19 新发现）

### 6.1 根因分析

**全局 CSS 冲突** — `src/styles.css:1293-1309` 中的全局 `.modal-backdrop` 样式默认隐藏弹窗：

```css
/* styles.css:1293 */
.modal-backdrop {
  opacity: 0;            /* ← 完全透明 */
  pointer-events: none;  /* ← 不响应鼠标事件 */
  transition: opacity .22s ease;
}

.modal-backdrop.is-open {  /* ← 只有带 is-open 类才显示 */
  opacity: 1;
  pointer-events: auto;
}
```

QaSquarePage.vue 的弹窗使用 `v-if="showModal" class="modal-backdrop"`，组件的 scoped 样式虽然定义了 `.modal-backdrop` 的定位、背景色、`z-index: 1000` 等，但**没有覆盖全局的 `opacity: 0`**。

Vue 的 scoped 样式与全局样式是**叠加关系**：

| 属性 | 全局 styles.css | 组件 scoped | 最终值 |
|------|----------------|-------------|--------|
| `opacity` | **`0`** ❌ | 未定义 | **`0`**（不可见） |
| `pointer-events` | **`none`** ❌ | 未定义 | **`none`**（不可点击） |
| `position` | `fixed` | `fixed` | `fixed` |
| `z-index` | `50` | `1000` | `1000`（scoped 权重高） |
| `background` | `rgba(...)` | `rgba(...)` | 叠加 |

**结果**：弹窗 DOM 元素确实被创建了（`showModal = true`），但 `opacity: 0` 使其完全不可见。

**事件链路**：

```
用户点击"公开提问"卡片
  → openModal() 执行 → showModal.value = true
    → v-if 渲染 <div class="modal-backdrop">
      → 全局 CSS opacity: 0 → 弹窗不可见 ❌
```

### 6.2 解决方案

在 QaSquarePage.vue 的 scoped 样式中显式覆盖全局的 `opacity` 和 `pointer-events`：

```css
/* QaSquarePage.vue scoped 样式新增 */
.modal-backdrop {
  opacity: 1;
  pointer-events: auto;
}
```

同时建议将全局 `.modal-backdrop` 改为更具体的 class 名（如 `.letter-modal-backdrop`），避免与其他页面的同名 class 冲突。或者在 QaSquarePage 中使用不同的 class 名（如 `.qa-modal-backdrop`）。

### 6.3 代码变更

| 文件 | 变更 |
|------|------|
| `src/pages/QaSquarePage.vue` | `.modal-backdrop` 新增 `opacity: 1; pointer-events: auto;` |
