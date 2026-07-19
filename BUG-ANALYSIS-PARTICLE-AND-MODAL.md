# 问答广场粒子特效 & 问答弹窗无法显示 — 根因分析

> 日期：2026-07-19
> 参考实现：`/home/dxl/codingLady/frontend/standalone.html`

---

## 问题描述

1. 进入问答广场 → 点击"回答问题"进入粒子页面后，**粒子不跟随鼠标移动，也没有鼠标拖尾粒子特效**
2. **点击页面任意位置无法弹出问答框**

---

## 根因分析

### 问题 1：粒子特效不跟随鼠标 — `pointer-events: none` 阻断了所有鼠标事件

**严重程度：🔴 致命（所有鼠标交互的根因）**

**全局 CSS 冲突** — `src/styles.css:1201-1209` 中定义了全局样式：

```css
/* ===== Particle Canvas ===== */
.particle-canvas {
  position: fixed;
  top: 72px;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  pointer-events: none;    /* ← 阻断了所有鼠标事件 */
}
```

`ParticleCanvas.vue` 的 scoped 样式中设置了 `z-index: 1`、`cursor: pointer` 等，但 **没有设置 `pointer-events`**。Vue scoped 样式与全局样式是叠加关系而非覆盖关系，最终 Canvas 元素同时拥有：

| 属性 | 来源 | 最终值 |
|------|------|--------|
| `pointer-events` | 全局 `styles.css` | **`none`** ❌ |
| `position` | 全局 + scoped | `fixed` |
| `z-index` | 全局 + scoped (scoped 权重更高) | `1` |

`pointer-events: none` 导致 Canvas 元素 **完全忽略所有鼠标事件**（mouseenter、mousemove、click 全部被浏览器拦截，根本不会派发）。

**事件链路断裂**：

```
用户移动/点击鼠标
  → 浏览器看到 pointer-events: none，不向 Canvas 派发事件
    → Vue 的 @mousemove/@click 处理器永远不会被调用
      → handleMouseMove() 从未执行 → ps.setMouse() 未调用
        → mouseX/mouseY 始终为 null → 粒子不受鼠标影响
      → handleClick() 从未执行 → 无 burst 粒子、无问题返回
```

**对比 standalone.html 的正确实现**（standalone.html:630-644）：

```javascript
// standalone.html — 直接在原生 DOM 元素上绑定事件，无 pointer-events 限制
canvas.addEventListener('mouseenter', () => { isMouseOnCanvas = true; });
canvas.addEventListener('mouseleave', () => { isMouseOnCanvas = false; });
canvas.addEventListener('mousemove', (e) => {
  mouseX = e.clientX - rect.left;
  mouseY = e.clientY - rect.top;
  spawnTrailParticles(mouseX, mouseY);   // ← 每次移动生成拖尾粒子
});
canvas.addEventListener('click', (e) => { /* 显示问答卡片 */ });
```

standalone.html 中 Canvas 没有 `pointer-events: none`，所有事件正常触发。

---

### 问题 2：点击无法弹出问答框 — 多因素叠加

#### 2a. 问题 1 的直接后果

由于 `pointer-events: none`，Canvas 的 `@click` 事件从未触发 → `ParticleCanvas.handleClick()` 从未执行 → `emit('canvas-click')` / `emit('particle-click')` 从未发出 → `ParticlePage.onParticleClick()` / `ParticlePage.onCanvasClick()` 永远不会被调用 → `showModal` 永远为 `false` → 问答弹窗不显示。

#### 2b. `.app-shell` 布局约束 — Canvas 尺寸和覆盖范围错误

**文件**：`src/styles.css:44-48`

```css
.app-shell {
  width: min(1180px, calc(100% - 32px));
  margin: 0 auto;
  padding: 18px 0 72px;
}
```

渲染层级：

```
body
 └── .app-shell（max-width: 1180px, 居中, padding-bottom: 72px）
      ├── TopNav（导航栏）
      └── <RouterView> → ParticlePage
           ├── .guide-text（fixed, top: 80px, z-index: 5）
           ├── ParticleCanvas → canvas（fixed, z-index: 1）
           └── .bottom-bar（fixed, z-index: 10）
```

虽然 `position: fixed` 相对于视口定位，但：
1. 全局样式 `.particle-canvas` 设置 `top: 72px`、`width: 100%`（而非 `100vw`），Canvas 实际只覆盖屏幕中间约 1180px 宽的区域，左右两侧无法点击
2. `height: 100%` 在 fixed 定位下相对于包含块计算，可能被 `.app-shell` 的 padding 影响

**对比 standalone.html**（standalone.html:58-61）：

```css
#particleCanvas {
  position: fixed;
  top: 56px;      /* 精确对应 navbar 高度 */
  left: 0;
  right: 0;
  bottom: 0;
  background: #F5F0E8;
  cursor: crosshair;
}
```

使用 `left: 0; right: 0; bottom: 0` 让 Canvas 覆盖除了 navbar 外的 **整个视口**，不受任何父容器限制。

#### 2c. questions 为空数组时的静默失败

**文件**：`ParticlePage.vue:36-41`

```javascript
function onCanvasClick(event) {
  if (questions.value.length === 0) return   // ← 静默返回，无任何提示
  // ...
}
```

当后端服务未启动或 API 返回空数组时，`questions` 始终为空数组，点击任何位置都静默失败，用户看不到任何反馈。

**对比 standalone.html**（standalone.html:657-660）：

```javascript
if (questions.length === 0) {
  showToast('暂无更多问题');  // ← 有用户可见的提示
  return;
}
```

#### 2d. 全局 CSS 中 `z-index: 1` 与引导文字冲突

全局 `.particle-canvas` 和 `.particle-guide` 的 `z-index` 分别为 1 和 2，与组件内 `guide-text`（z-index: 5）、`bottom-bar`（z-index: 10）的层级关系混乱。在全局定义的 `.particle-guide`（z-index: 2）会作为另一个元素叠加在页面上。

---

## 修复方案

### 修复 1：移除全局 `pointer-events: none`，改为在不需要交互的页面设置

**文件**：`src/styles.css`

将全局 `.particle-canvas` 的 `pointer-events: none` 移除，改为 **仅在 HomePage 等非粒子页面的装饰性 Canvas 上禁用**：

```css
/* styles.css — 修改第 1201-1209 行 */
.particle-canvas {
  position: fixed;
  top: 0;              /* 改为 0，不再偏移 72px（由组件自行控制） */
  left: 0;
  width: 100vw;        /* 改为 100vw 覆盖整个视口 */
  height: 100vh;       /* 改为 100vh */
  z-index: 1;
  pointer-events: auto; /* ← 改为 auto，允许鼠标交互 */
}

/* 为 HomePage 等页面的装饰性粒子单独设置 */
.home-particle-bg .particle-canvas {
  pointer-events: none;
}
```

**或更安全的方案**：直接在 `ParticleCanvas.vue` 的 scoped 样式中使用更高优先级覆盖：

```css
/* ParticleCanvas.vue scoped 样式新增 */
.particle-canvas {
  /* ... existing styles ... */
  pointer-events: auto !important;
}
```

### 修复 2：Canvas 尺寸和定位改为视口级别

**文件**：`ParticleCanvas.vue` scoped 样式

```css
.particle-canvas {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;     /* 使用 vw 而非 %，不受父容器宽度约束 */
  height: 100vh;    /* 使用 vh 而非 % */
  cursor: crosshair; /* 与 standalone.html 一致 */
  z-index: 1;
  pointer-events: auto;
}
```

**同时修改全局 `styles.css:1201-1209`** 保持一致。

### 修复 3：ParticlePage 层级调整

**文件**：`ParticlePage.vue`

```css
/* guide-text 的 top 值应对齐 TopNav 实际高度（约 56-64px） */
.guide-text {
  top: 70px;          /* 从 80px 调整为 70px，避免被 TopNav 遮挡 */
  z-index: 3;         /* 只需高于 Canvas 即可 */
}

/* bottom-bar 保持 z-index: 10，高于 Canvas */
```

### 修复 4：questions 为空时提供用户反馈

**文件**：`ParticlePage.vue:36-41`

```javascript
function onCanvasClick(event) {
  if (questions.value.length === 0) {
    // 显示提示，而非静默返回
    showToast('暂无可回答的问题，请先在问答广场提个问题')
    return
  }
  // ...
}
```

### 修复 5：确保 ParticlePage 不受 `.app-shell` 布局影响

**文件**：`ParticlePage.vue`

在 `.particle-page` 容器上添加样式使其脱离 `.app-shell` 的宽度约束：

```css
.particle-page {
  position: relative;
  width: 100vw;
  left: 50%;
  right: 50%;
  margin-left: -50vw;
  margin-right: -50vw;
  min-height: 100vh;
}
```

### 修复 6：Canvas 背景色需显式设置

standalone.html 中 Canvas 有 `background: #F5F0E8`，而 Vue 版的 Canvas 背景色完全依赖 composable 中的 `drawBackground()` 在每帧绘制。初始化后第一帧绘制前可能有短暂的透明闪烁。建议在 CSS 中也设置背景色：

```css
.particle-canvas {
  background: #F5F0E8;  /* 与 standalone.html 一致，避免首帧闪烁 */
}
```

---

## 修改记录（2026-07-19 已应用）

### 修改记录

#### 第一轮（2026-07-19）：粒子特效 & 弹窗无法显示

| 文件 | 修改内容 |
|------|---------|
| `src/styles.css` | `.particle-canvas`: `top: 0`, `width: 100vw`, `height: 100vh`, `pointer-events: auto`, 新增 `background: #F5F0E8` |
| `src/components/ParticleCanvas.vue` | scoped 样式: `cursor: crosshair`, `pointer-events: auto`, `background: #F5F0E8` |
| `src/pages/ParticlePage.vue` | `.particle-page` 脱离 app-shell 约束、`guide-text` top 改为 70px/z-index 改为 3、新增 `showToast` 函数、空 questions 时显示提示、新增 Toast 组件和过渡动画 |

构建验证：`✓ 107 modules transformed. built in 1.66s`

#### 第二轮（2026-07-19）：弹窗位置偏离点击位置

| 文件 | 修改内容 |
|------|---------|
| `src/components/QuestionModal.vue` | `.question-modal-overlay` 移除 `display: flex/align-items/justify-content`；`.question-modal-card` 从 `position: relative` → `position: absolute`；`modalStyle()` 增加底部/右侧边界保护 |

构建验证：`✓ 107 modules transformed. built in 1.50s`

---

## 修复优先级

| 优先级 | 修复 | 影响范围 |
|--------|------|---------|
| P0 🔴 | 修复 1：`pointer-events: none` → `auto` | 粒子跟随鼠标、点击弹窗、拖尾粒子 — 全部修复 |
| P0 🔴 | 修复 2：Canvas 尺寸改为 `100vw/100vh` | 点击区域覆盖全屏 |
| P1 🟡 | 修复 4：空 questions 时显示提示 | 后端未启动时的用户体验 |
| P2 🟢 | 修复 3：引导文字 z-index 调整 | 视觉层级优化 |
| P2 🟢 | 修复 5：脱离 `.app-shell` 约束 | 全屏覆盖稳定性 |
| P2 🟢 | 修复 6：Canvas CSS 背景色 | 首帧闪烁优化 |

**修复 1 和修复 2 是核心问题，修复后粒子跟随鼠标和点击弹窗两大功能均可恢复正常。**

---

## 关键代码对比总结

| 维度 | standalone.html（正常） | Vue 版（异常） | 修复方向 |
|------|------------------------|---------------|---------|
| Canvas pointer-events | 无限制（默认 auto） | **`pointer-events: none`**（全局 CSS） | 改为 auto |
| Canvas 事件绑定 | 原生 `addEventListener` | Vue `@click` / `@mousemove` | 解除 pointer-events 限制即可 |
| Canvas 尺寸 | `left:0; right:0; bottom:0; top:56px` | `width: 100%; height: 100%` + 全局 `top: 72px` | 改为 `100vw/100vh` |
| 拖尾粒子 | 鼠标移动时 `spawnTrailParticles()` | `ps.setMouse()` 内部生成 | 事件可达即生效 |
| 点击弹窗 | `canvas.addEventListener('click')` → 创建 DOM 卡片 | `handleClick()` → emit → 打开 Vue 组件 | 事件可达 + questions 非空即生效 |
| 空 questions 处理 | `showToast('暂无更多问题')` | 静默 `return` | 增加提示 |

---

## 问题 3：问答弹窗总是出现在屏幕右下角而非点击位置

> 状态：已修复

### 现象

点击 Canvas 后，问答弹窗出现在屏幕右下角（或偏离点击位置的异常区域），而非在鼠标点击处附近弹出。

### 根因分析

**数据传递链路正常**，问题出在 **QuestionModal 的 CSS 定位模型错误**。

#### 正确的数据流（无问题）

```
用户点击 Canvas (clientX=500, clientY=400)
  → ParticleCanvas.handleClick()
    → emit('canvas-click', { x: 500, y: 400 })  ← clientX/Y 正确
      → ParticlePage.onCanvasClick(event)
        → modalPosition = { x: event.x, y: event.y }  ← 正确读到 500, 400
          → QuestionModal :position="{ x: 500, y: 400 }"
            → modalStyle() → { left: '500px', top: '400px' }  ← 值正确
```

#### 错误的定位模型（根因）

QuestionModal 的叠加层使用 **flexbox 居中 + 卡片 `position: relative` + `left/top` 偏移**：

```css
/* QuestionModal.vue:190-199 */
.question-modal-overlay {
  display: flex;
  align-items: center;        /* 垂直居中 */
  justify-content: center;    /* 水平居中 */
}

/* QuestionModal.vue:201 */
.question-modal-card {
  position: relative;         /* ← 问题在这里 */
}
```

当 `left: 500px; top: 400px` 应用于 `position: relative` 元素时，偏移是 **相对于 flexbox 已经将其居中的位置**，而不是相对于视口左上角：

```
视口尺寸：1920×1080
flexbox 居中位置：(960, 540)  ← 卡片中心被 flexbox 放在这里
应用 left: 500px, top: 400px:
  → 实际位置 = (960+500, 540+400) = (1460, 940)  ← 右下角！
```

点击屏幕中部的 (500, 400) → 弹窗出现在 (1460, 940) → **右下角**。

#### 对比 standalone.html 的正确做法

standalone.html 中问答卡片使用 **`position: absolute`** 直接相对于 `<body>`（最近的非 static 祖先）定位：

```css
/* standalone.html:64-65 */
.q-card {
  position: absolute;   /* ← 相对于 body 定位 */
  z-index: 500;
}
```

```javascript
// standalone.html:686-689 — 直接设置 left/top 为视口坐标
card.style.left = left + 'px';
card.style.top = top + 'px';
```

`position: absolute` + 相对于视口的 left/top → 卡片精确出现在点击位置附近。

### 修复方案

将 QuestionModal 的定位模型从 **flexbox 居中 + relative 偏移** 改为 **fixed 覆盖层 + absolute 卡片**：

#### 修改 `QuestionModal.vue` 的 scoped 样式

**`.question-modal-overlay`**：
- `display: flex` → 移除（不再需要 flexbox 居中）
- `align-items/justify-content` → 移除
- 保持 `position: fixed; inset: 0`

**`.question-modal-card`**：
- `position: relative` → **`position: absolute`**
- `left/top` 由 `modalStyle()` 动态提供 → 相对于视口精确定位
- 移除不需要的 `width: min(480px, calc(100vw - 32px))` 中的 min 计算，改为 `width: 480px; max-width: calc(100vw - 32px)`

#### 修改 `modalStyle()` 函数

增加对 `left/top` 的底部边界保护，防止弹窗超出屏幕底部：

```javascript
function modalStyle() {
  if (!props.position) return {}
  const w = 480  // 卡片最大宽度
  const h = 400  // 估算卡片高度
  const left = clamp(props.position.x, 16, window.innerWidth - w)
  const top = clamp(props.position.y, 16, window.innerHeight - h)
  return { left: left + 'px', top: top + 'px' }
}

function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val))
}
```
