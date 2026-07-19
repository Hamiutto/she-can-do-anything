# 问答广场 — 提交特效 & 弹窗优化方案

> 日期：2026-07-19

---

## 1. 需求描述

1. **提交粒子特效**：点击"提交问题"成功后，在按钮位置播放粒子气泡破碎特效，问题自动进入"回答问题→粒子页面"的问题库
2. **弹窗不遮灰**：打开提问弹窗时，问答广场页面本身不要变成灰色

---

## 2. 现状分析

### 2.1 提交后问题去向

当前流程：`QaSquarePage 提交 → POST /api/questions → 后端保存`。问题已经写入了后端数据库，但前端没有任何视觉反馈告知用户"提交成功"。

后端 `database.js` 的 `listPendingQuestions` 查询 `status = 'pending'` 的问题，粒子页面调用 `GET /api/questions` 获取待回答问题列表。**新问题默认 status 为 'pending'，自动出现在粒子页面问题库中**。这条链路已经完整。

### 2.2 提交后的反馈

当前仅有底部 Toast 文字提示"问题已提交成功！"，缺乏粒子页面风格的视觉反馈。

### 2.3 参考：standalone.html 的破碎特效

standalone.html 使用 `triggerShatter(x, y, color)` 在指定位置生成 12 个碎片粒子向外扩散 + 闪光特效（600ms）。核心逻辑：
- 从点击位置向 12 个方向发射碎片
- 碎片带速度、衰减 alpha
- 碎片消亡时产生 8 个闪光粒子
- 整个动画由 `requestAnimationFrame` 驱动

### 2.4 当前弹窗遮罩问题

QaSquarePage 使用 `<div v-if="showModal" class="modal-backdrop">`，其 scoped 样式设置了 `background: rgba(45, 52, 54, 0.24)`（半透明深色），叠加在全局 `.page-card` 上方，导致整个页面变灰。

---

## 3. 修改方案

### 3.1 粒子破碎特效 — 独立 CSS/Canvas 动画

**方案选择**：由于 QaSquarePage 没有 Canvas，采用 **CSS + DOM 粒子动画**，而非复用 useParticleSystem（需要 Canvas 环境）。

创建一个轻量级 `ShatterBurst.vue` 组件（或直接内联在 QaSquarePage 中），在提交成功后：
1. 在提交按钮位置创建 12 个圆形粒子 DOM 元素
2. 每个粒子从中心向外扩散（随机角度 + 速度）
3. 粒子带 alpha 衰减（600ms 生命周期）
4. 动画结束后自动移除 DOM 元素

**实现方式 — 内联方案**：

在 QaSquarePage 的 `<script>` 中新增 `burstParticles` 数组和 `triggerBurst(x, y)` 函数：

```javascript
const burstParticles = ref([])
let particleId = 0

function triggerBurst(x, y) {
  const particles = []
  const color = '#6c5ce7'  // lavender 主题色
  for (let i = 0; i < 12; i++) {
    const angle = (Math.PI * 2 / 12) * i + (Math.random() - 0.5) * 0.3
    const speed = 60 + Math.random() * 80  // px
    particles.push({
      id: particleId++,
      x, y,
      tx: Math.cos(angle) * speed,
      ty: Math.sin(angle) * speed,
      color,
    })
  }
  burstParticles.value = particles
  // 600ms 后自动清除
  setTimeout(() => { burstParticles.value = [] }, 650)
}
```

在模板中添加粒子层（固定定位，`pointer-events: none`）：

```html
<!-- Shatter burst particles -->
<div class="burst-layer">
  <span
    v-for="p in burstParticles"
    :key="p.id"
    class="burst-particle"
    :style="{
      left: p.x + 'px',
      top: p.y + 'px',
      background: p.color,
      '--tx': p.tx + 'px',
      '--ty': p.ty + 'px',
    }"
  ></span>
</div>
```

CSS 动画：

```css
.burst-layer {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 2000;
}

.burst-particle {
  position: absolute;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  animation: burstOut 0.6s ease-out forwards;
}

@keyframes burstOut {
  0% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 1;
  }
  100% {
    transform: translate(calc(-50% + var(--tx)), calc(-50% + var(--ty))) scale(0);
    opacity: 0;
  }
}
```

**触发时机**：在 `submitQuestion()` 的 `try` 块中，API 成功后调用 `triggerBurst`：

```javascript
async function submitQuestion() {
  if (!question.value.trim()) return
  isSubmitting.value = true
  errorMsg.value = ''

  try {
    // ... 现有 axios.post ...
    
    // 获取按钮位置
    const btn = document.querySelector('.submit-btn')
    if (btn) {
      const rect = btn.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      triggerBurst(cx, cy)
    }
    
    showToast.value = true
    toastMsg.value = '问题已提交成功！✨'
    // ...
  } catch (err) {
    // ...
  }
}
```

### 3.2 弹窗不遮灰 — 改为非全屏弹窗

**方案**：将弹窗从 `v-if="showModal" class="modal-backdrop"` 改为使用 `<Teleport to="body">` + 独立弹窗卡片，**移除灰色遮罩层**。

**变更前**：
```html
<div v-if="showModal" class="modal-backdrop" @click.self="closeModal">
  <div class="modal-dialog">...</div>
</div>
```

**变更后**：
```html
<Teleport to="body">
  <Transition name="slide-up">
    <div v-if="showModal" class="qa-modal" @click.self="closeModal">
      <div class="qa-modal-dialog">
        <!-- 内容不变 -->
      </div>
    </div>
  </Transition>
</Teleport>
```

**CSS**（无遮罩背景色，弹窗从底部滑入）：

```css
.qa-modal {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: auto;
  /* 不设置 background → 页面不变灰 */
}

.qa-modal-dialog {
  background: var(--paper, #fff);
  border-radius: 20px;
  padding: 32px 28px 28px;
  width: 90%;
  max-width: 480px;
  position: relative;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.18);
  border: 1px solid rgba(255, 255, 255, 0.9);
}

/* 滑入动画 */
.slide-up-enter-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.slide-up-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.slide-up-enter-from {
  opacity: 0;
  transform: translateY(24px) scale(0.97);
}
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(12px) scale(0.98);
}
```

### 3.3 问题进入粒子页面问题库

**现状确认**：这条链路已完整，无需修改。

```
QaSquarePage 提交问题
  → POST /api/questions → 后端写入 questions.json (status: 'pending')
    → 粒子页面 GET /api/questions → 自动获取新问题
      → useParticleSystem.setQuestions() → 粒子绑定问题数据
```

只需确保：
1. 提交时携带正确的 `time_type`（已修复为英文 key）
2. 后端 `createQuestion` 默认 status 为 `'pending'`（已确认）
3. 粒子页面 `onMounted` 调用 `GET /api/questions`（已有）

---

## 4. 代码变更清单

| 文件 | 变更类型 | 内容 |
|------|---------|------|
| `src/pages/QaSquarePage.vue` | 修改 | ① 模板改用 `<Teleport>` + 非遮罩弹窗 ② 新增 `burstParticles` 状态 + `triggerBurst()` 函数 ③ `submitQuestion()` 成功后触发破碎特效 ④ 移除旧的 `.modal-backdrop` 样式，改用 `.qa-modal` + 滑入动画 |
| 无 | — | 后端无需修改（问题自动入库已实现） |

---

## 5. 交互流程图

```
用户点击"公开提问"
  → 弹窗滑入（页面不变灰）
    → 填写问题 + 选择时间类型
      → 点击"提交问题"
        → API POST /api/questions
          → 后端保存（status: pending）
            → 按钮位置播放粒子破碎特效 ✨
              → Toast 提示"问题已提交成功！✨"
                → 弹窗自动关闭
                  → 问题可在粒子页面看到
```

---

## 6. 视觉效果

### 6.1 弹窗

```
问答广场页面（清晰可见）
┌──────────────────────────────────────────────┐
│ [TopNav]                                     │
├──────────────────────────────────────────────┤
│                                              │
│  ┌─────────────┐  ┌─────────────┐  ┌──────┐  │
│  │ 公开提问    │  │ 回答问题    │  │感谢信│  │  ← 卡片仍可见
│  │             │  │             │  │      │  │
│  └─────────────┘  └─────────────┘  └──────┘  │
│                                              │
│         ┌──────────────────────┐             │
│         │  公开提问       ✕   │             │  ← 弹窗悬浮，无灰遮罩
│         │                      │             │
│         │  问题内容 [      ]  │             │
│         │                      │             │
│         │  [提交问题]          │             │
│         └──────────────────────┘             │
└──────────────────────────────────────────────┘
```

### 6.2 破碎特效

```
提交按钮位置 → 12 个紫色圆点从中心向外扩散
  → 同时缩小 + 透明度衰减
    → 600ms 后消失
      → Toast 浮现："问题已提交成功！✨"
```
