# 首屏 Landing Hero 设计方案

> 在现有 HomePage 最上方新增一屏全屏背景首屏，保留顶部导航栏，点击"开始浏览"平滑滚动至现有内容。

---

## 一、技术架构

### 1.1 新增文件

| 文件 | 类型 | 说明 |
|------|------|------|
| `src/components/LandingSplash.vue` | 新组件 | 全屏首屏组件（背景图+文案+按钮） |

### 1.2 修改文件

| 文件 | 修改内容 |
|------|----------|
| `src/pages/HomePage.vue` | 在 `<LandingHero />` 之前插入 `<LandingSplash />` |
| `src/styles.css` | 新增首屏相关 CSS 变量与样式类 |

---

## 二、页面结构设计

```
┌──────────────────────────────────────────────────────┐
│  TopNav（sticky, 保持现有样式, z-index: 20）          │
├──────────────────────────────────────────────────────┤
│                                                      │
│  ╭────────────────────────────────────────────────╮  │
│  │              全屏背景图 (100vh)                  │  │
│  │                                              │  │
│  │    ┌────────── 内容居中列 ──────────┐         │  │
│  │    │  导入小字 1（淡入动画）          │         │  │
│  │    │  导入小字 2（淡入动画）          │         │  │
│  │    │                                 │         │  │
│  │    │  她行          ← h1 大字        │         │  │
│  │    │  She can do anything  ← 副标    │         │  │
│  │    │                                 │         │  │
│  │    │  在这里，我们(women)共创...      │         │  │
│  │    │                                 │         │  │
│  │    │  这里既是你展示自我的大舞台...    │         │  │
│  │    │  世界这么大，你想要好奇的生活... │         │  │
│  │    │  人生路漫长，你眼下的困惑...      │         │  │
│  │    │                                 │         │  │
│  │    │  [ 开始浏览 ]    ← 按钮          │         │  │
│  │    └─────────────────────────────────┘         │  │
│  │                                              │  │
│  │  底部渐变遮罩 → 平滑过渡到下方内容             │  │
│  ╰────────────────────────────────────────────────╯  │
│                                                      │
├──────────────────────────────────────────────────────┤
│  （以下为现有 LandingHero + SheIsSearchSection + ...） │
└──────────────────────────────────────────────────────┘
```

---

## 三、视觉设计

### 3.1 背景图处理

```css
.landing-splash {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background:
    /* 底部渐变：过渡到下方 paper 色 */
    linear-gradient(to bottom, transparent 60%, var(--paper) 100%),
    /* 顶部微渐变：保证导航栏可读 */
    linear-gradient(to bottom, rgba(253, 246, 240, .65) 0%, transparent 18%),
    url('/首页背景图.png');
  background-size: cover;
  background-position: center center;
  background-repeat: no-repeat;
}
```

**处理策略：**
- 背景图覆盖整个首屏（`cover`），居中
- 顶部 18% 有轻微渐变，让 sticky 导航栏文字更可读
- 底部 40%→100% 渐变过渡到 `var(--paper)`（`#fdf6f0`），与下方 LandingHero 的 `radial-gradient` 背景自然衔接
- 根据背景图分析（大量白色/浅色负空间+两侧柔和人物剪影），内容居中完全可行

### 3.2 内容布局

内容放置在一个居中的垂直列中，最大宽度 720px：

```css
.splash-content {
  position: relative;
  z-index: 2;
  text-align: center;
  max-width: 720px;
  padding: 0 24px;
}
```

### 3.3 排版层级

| 层级 | 内容 | 字号 | 字重 | 字族 | 颜色 | 间距 |
|------|------|------|------|------|------|------|
| 导入小字 | 两行引导语 | 14px | 700 | var(--sans) | rgba(45,52,54,.60) | 行间距 4px，下方 28px |
| 主标题 | 她行 | clamp(56px, 10vw, 110px) | 700 | var(--serif) | var(--ink) | 下方 8px |
| 副标题 | She can do anything | clamp(24px, 4vw, 42px) | 800 | var(--serif) | var(--lavender) | 下方 24px |
| Slogan | 在这里，我们(women)... | 20px | 800 | var(--sans) | var(--coral) | 下方 22px |
| 描述小字 | 3行描述 | 16px | 400 | var(--sans) | rgba(45,52,54,.72) | 行间距 6px，下方 36px |
| CTA按钮 | 开始浏览 | 16px | 900 | var(--sans) | 见按钮样式 | — |

### 3.4 主标题 "她行" 特殊处理

```css
.splash-title {
  font-family: var(--serif);
  font-size: clamp(56px, 10vw, 110px);
  font-weight: 700;
  line-height: 1.02;
  letter-spacing: 0;
}

.splash-title .accent {
  color: var(--coral);  /* "行"字用 coral 色 */
}
```

与现有 LandingHero 中 `h1` 的 "她<span class="accent">行</span>" 保持一致的 accent 配色逻辑。

### 3.5 副标题

```css
.splash-subtitle {
  font-family: var(--serif);
  font-size: clamp(24px, 4vw, 42px);
  font-weight: 800;
  color: var(--lavender);
  letter-spacing: .02em;
}
```

### 3.6 Slogan

```css
.splash-slogan {
  font-size: clamp(18px, 2.5vw, 22px);
  font-weight: 800;
  color: var(--coral);
  margin: 24px 0 22px;
}
```

用 coral 色突出，与主/副标题形成色彩层次。

### 3.7 描述小字

三行描述文字，居中排列，使用 `line-height: 1.8`，颜色 `rgba(45, 52, 54, .72)`：

```
这里既是你展示自我的大舞台，又是助你解决问题的避风港
世界这么大，你想要好奇的生活一定有人在活
人生路漫长，你眼下的困惑也一定会找到解答
```

每行之间用 `<br>` 分隔，保持紧凑的视觉节奏。

### 3.8 CTA 按钮

```css
.splash-cta {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: 2px solid var(--lavender);
  border-radius: 999px;
  padding: 16px 36px;
  background: var(--lavender);
  color: #fff;
  font-size: 16px;
  font-weight: 900;
  box-shadow: 0 18px 42px rgba(108, 92, 231, .32);
  transition: transform .22s ease, box-shadow .22s ease, background .22s ease;
}

.splash-cta:hover {
  transform: translateY(-4px);
  box-shadow: 0 24px 56px rgba(108, 92, 231, .40);
  background: #5a4bd4;
}

.splash-cta::after {
  content: "↓";
  font-size: 20px;
  transition: transform .22s ease;
}

.splash-cta:hover::after {
  transform: translateY(2px);
}
```

按钮风格与现有 `.primary-button` 一致（pill shape, 紫色主题色），但尺寸更大、阴影更深，更突出 CTA 地位。hover 时向下的箭头也会有微动效。

---

## 四、动画设计

### 4.1 入场动画（CSS keyframes）

所有元素使用交错的淡入+上移动画，模拟"内容渐显"效果：

```css
@keyframes splash-fade-up {
  from {
    opacity: 0;
    transform: translateY(24px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.splash-eyebrows {
  animation: splash-fade-up .8s ease both;
  animation-delay: .2s;
}

.splash-title {
  animation: splash-fade-up .9s ease both;
  animation-delay: .5s;
}

.splash-subtitle {
  animation: splash-fade-up .9s ease both;
  animation-delay: .7s;
}

.splash-slogan {
  animation: splash-fade-up .8s ease both;
  animation-delay: .9s;
}

.splash-desc {
  animation: splash-fade-up .8s ease both;
  animation-delay: 1.1s;
}

.splash-cta {
  animation: splash-fade-up .8s ease both;
  animation-delay: 1.3s;
}
```

### 4.2 背景图微动效（可选增强）

背景图添加缓慢的缩放动画，营造"呼吸感"：

```css
.landing-splash::before {
  content: "";
  position: absolute;
  inset: 0;
  background: inherit;
  background-size: cover;
  background-position: center;
  animation: splash-breathe 20s ease-in-out infinite;
  z-index: 0;
}

@keyframes splash-breathe {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.04); }
}
```

### 4.3 滚动提示（可选）

在 CTA 按钮下方添加一个微小的"向下滚动"提示图标，缓慢上下浮动：

```css
.scroll-hint {
  margin-top: 28px;
  animation: splash-fade-up .8s ease both 1.6s, float-hint 2s ease-in-out infinite 2.4s;
  color: rgba(45, 52, 54, .35);
  font-size: 22px;
}

@keyframes float-hint {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(6px); }
}
```

---

## 五、组件代码

### 5.1 `src/components/LandingSplash.vue`

```vue
<script setup>
const emit = defineEmits(['scroll-to-content'])

function scrollToContent() {
  // 滚动到现有的 LandingHero 区域
  document.getElementById('home')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  emit('scroll-to-content')
}
</script>

<template>
  <section class="landing-splash" id="splash">
    <div class="splash-content">
      <!-- 导入小字 -->
      <p class="splash-eyebrows">
        越是AI信息冲击时代，人和人之间真实的交流就越显珍贵<br>
        越是新媒体发展冲击的时代，一个真实的活人在你面前和你一对一才更真实
      </p>

      <!-- 主标题 -->
      <h1 class="splash-title">她<span class="accent">行</span></h1>

      <!-- 副标题 -->
      <div class="splash-subtitle">She can do anything</div>

      <!-- Slogan -->
      <p class="splash-slogan">在这里，我们（women）共创美好活法的无限可能</p>

      <!-- 描述小字 -->
      <p class="splash-desc">
        这里既是你展示自我的大舞台，又是助你解决问题的避风港<br>
        世界这么大，你想要好奇的生活一定有人在活<br>
        人生路漫长，你眼下的困惑也一定会找到解答
      </p>

      <!-- CTA 按钮 -->
      <button class="splash-cta" type="button" @click="scrollToContent">
        开始浏览
      </button>

      <!-- 滚动提示（可选） -->
      <span class="scroll-hint">⌄</span>
    </div>
  </section>
</template>
```

### 5.2 `src/styles.css` 新增样式

```css
/* ===== Landing Splash ===== */

.landing-splash {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background:
    linear-gradient(to bottom, transparent 55%, var(--paper) 100%),
    linear-gradient(to bottom, rgba(253, 246, 240, .60) 0%, transparent 18%),
    url('/首页背景图.png');
  background-size: cover;
  background-position: center 30%;
  background-repeat: no-repeat;
  overflow: hidden;
}

.splash-content {
  position: relative;
  z-index: 2;
  text-align: center;
  max-width: 720px;
  padding: 0 24px;
  width: 100%;
}

/* 导入小字 */
.splash-eyebrows {
  font-size: clamp(13px, 1.6vw, 15px);
  font-weight: 700;
  color: rgba(45, 52, 54, .58);
  line-height: 1.7;
  margin-bottom: 28px;
  letter-spacing: .01em;
}

/* 主标题 */
.splash-title {
  font-family: var(--serif);
  font-size: clamp(56px, 10vw, 110px);
  font-weight: 700;
  line-height: 1.02;
  letter-spacing: 0;
  margin: 0;
}

.splash-title .accent {
  color: var(--coral);
}

/* 副标题 */
.splash-subtitle {
  font-family: var(--serif);
  font-size: clamp(24px, 4vw, 42px);
  font-weight: 800;
  color: var(--lavender);
  letter-spacing: .02em;
  margin-top: 8px;
}

/* Slogan */
.splash-slogan {
  font-size: clamp(18px, 2.5vw, 22px);
  font-weight: 800;
  color: var(--coral);
  margin: 24px 0 22px;
}

/* 描述小字 */
.splash-desc {
  font-size: clamp(15px, 1.8vw, 17px);
  color: rgba(45, 52, 54, .72);
  line-height: 1.85;
  margin: 0 0 36px;
}

/* CTA 按钮 */
.splash-cta {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: 2px solid var(--lavender);
  border-radius: 999px;
  padding: 16px 36px;
  background: var(--lavender);
  color: #fff;
  font-size: 16px;
  font-weight: 900;
  box-shadow: 0 18px 42px rgba(108, 92, 231, .32);
  transition: transform .22s ease, box-shadow .22s ease, background .22s ease;
}

.splash-cta:hover {
  transform: translateY(-4px);
  box-shadow: 0 24px 56px rgba(108, 92, 231, .40);
  background: #5a4bd4;
}

.splash-cta::after {
  content: "↓";
  font-size: 20px;
  transition: transform .22s ease;
}

.splash-cta:hover::after {
  transform: translateY(2px);
}

/* 滚动提示 */
.scroll-hint {
  display: block;
  margin-top: 28px;
  color: rgba(45, 52, 54, .35);
  font-size: 22px;
}

/* 入场动画 */
@keyframes splash-fade-up {
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: translateY(0); }
}

.splash-eyebrows  { animation: splash-fade-up .8s ease both; animation-delay: .2s; }
.splash-title     { animation: splash-fade-up .9s ease both; animation-delay: .5s; }
.splash-subtitle  { animation: splash-fade-up .9s ease both; animation-delay: .7s; }
.splash-slogan    { animation: splash-fade-up .8s ease both; animation-delay: .9s; }
.splash-desc      { animation: splash-fade-up .8s ease both; animation-delay: 1.1s; }
.splash-cta       { animation: splash-fade-up .8s ease both; animation-delay: 1.3s; }
.scroll-hint      { animation: splash-fade-up .8s ease both 1.6s, float-hint 2s ease-in-out infinite 2.4s; }

@keyframes float-hint {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(6px); }
}
```

---

## 六、路由与交互逻辑

### 6.1 HomePage.vue 修改

```vue
<template>
  <!-- 新增：首屏 -->
  <LandingSplash />

  <!-- 现有：LandingHero（现有首屏变为第二屏） -->
  <LandingHero />

  <!-- 以下保持不变 -->
  <SheIsSearchSection @tags-change="selectedTags = $event" />
  <section class="section" id="results">
    ...
  </section>
  ...
</template>
```

同时在 `<script setup>` 中 import：

```js
import LandingSplash from '../components/LandingSplash.vue'
```

### 6.2 "开始浏览" 按钮行为

点击按钮 → `scrollIntoView({ behavior: 'smooth', block: 'start' })` 滚动到 `#home`（即现有的 LandingHero 区域）。

**为什么不滚动到 `#sheis`？** 因为用户需要依次经过：
1. 现有的 LandingHero（她行 + She can do anything + AI Creator Stage）
2. She Is 搜索区域
3. 人物样本

这样形成完整的浏览路径：品牌认知 → 了解功能 → 开始使用。

### 6.3 TopNav 导航栏处理

TopNav 已经是 `position: sticky; top: 0; z-index: 20`，在全屏首屏上方自然悬浮。背景图首屏在 TopNav 下方，TopNav 的 `backdrop-filter: blur(16px)` 会让背景图在滚动经过时产生毛玻璃效果，视觉上一致。

**不需要修改 TopNav。**

### 6.4 导航栏品牌按钮跳转逻辑

现有 TopNav 中 `goHome()` 跳转到 `/`，`goSheIs()` 跳转到 `/#sheis`。

建议新增首屏后：
- `goHome()` 行为不变（到 `/`，从首屏顶部开始）
- 可考虑在 TopNav 增加一个新导航项 "首页" 或保持现有不变

---

## 七、响应式适配

### 7.1 平板（max-width: 980px）

```css
@media (max-width: 980px) {
  .landing-splash {
    min-height: 100vh;
    padding: 80px 0 40px; /* 为 sticky nav 留出空间 */
  }

  .splash-content {
    max-width: 560px;
  }

  .splash-title {
    font-size: clamp(44px, 12vw, 72px);
  }

  .splash-subtitle {
    font-size: clamp(20px, 5vw, 32px);
  }

  .splash-slogan {
    font-size: clamp(16px, 3vw, 20px);
  }
}
```

### 7.2 手机（max-width: 640px）

```css
@media (max-width: 640px) {
  .landing-splash {
    min-height: 100svh; /* 使用 small viewport height 适配移动端浏览器 chrome */
    padding: 72px 0 32px;
    background-position: center 20%; /* 手机上背景稍微上移 */
  }

  .splash-content {
    max-width: 100%;
    padding: 0 16px;
  }

  .splash-eyebrows {
    font-size: 13px;
    margin-bottom: 20px;
  }

  .splash-title {
    font-size: clamp(40px, 14vw, 58px);
  }

  .splash-subtitle {
    font-size: clamp(18px, 6vw, 26px);
    margin-top: 6px;
  }

  .splash-slogan {
    font-size: 16px;
    margin: 18px 0 16px;
  }

  .splash-desc {
    font-size: 14px;
    margin-bottom: 28px;
  }

  .splash-cta {
    padding: 14px 28px;
    font-size: 15px;
    width: 100%;
    justify-content: center;
  }

  .scroll-hint {
    margin-top: 20px;
  }
}
```

---

## 八、背景图文件处理

### 8.1 文件放置

背景图 `首页背景图.png` 需要放入 Vite 的 `public/` 目录，以便在 CSS 中通过绝对路径引用：

```
public/
  └── 首页背景图.png
```

**或者** 放在 `src/assets/` 下并通过 `import` 引用：

```js
import splashBg from '../assets/首页背景图.png'
```

推荐方案 1（`public/` 目录），因为：
- CSS 中直接写路径，不需要 JS import
- 文件名中文无影响
- Vite 会自动处理 public 目录下的静态文件

### 8.2 如果图片过大

如果原图分辨率过高（例如 4K），建议在 `public/` 中同时提供压缩版本：
- `首页背景图.png` — 原图（用于桌面端）
- `首页背景图@mobile.png` — 压缩版（用于移动端 `@media` 中引用）

---

## 九、与现有 LandingHero 的视觉衔接

现有 LandingHero 的 `.home-hero` 具有 `min-height: calc(100vh - 92px)` 和底部的渐变分隔线（`::after`）。

新增首屏后，两个区域的衔接：

1. **首屏底部**：`linear-gradient(to bottom, transparent 55%, var(--paper) 100%)` 自然过渡到 paper 色
2. **LandingHero 顶部**：现有的 `radial-gradient` 背景与 paper 色融合
3. **分隔线**：现有的 `.home-hero::after` 分隔线保留，作为两屏之间的视觉分割

整体滚动体验：
```
首屏（背景图） → 自然淡出到 paper 色 → LandingHero（渐变背景） → SheIs 搜索 → 人物样本
```

---

## 十、实施步骤

| 步骤 | 操作 | 预计改动 |
|------|------|----------|
| 1 | 将 `首页背景图.png` 复制到 `public/` 目录 | 文件操作 |
| 2 | 创建 `src/components/LandingSplash.vue` | 新建组件 |
| 3 | 在 `src/styles.css` 末尾添加首屏样式 | 新增约 100 行 CSS |
| 4 | 修改 `src/pages/HomePage.vue`，在 `<LandingHero />` 前插入 `<LandingSplash />` | 新增 1 行 template + 1 行 import |
| 5 | 本地运行 `npm run dev` 验证效果 | — |
| 6 | 验证响应式（桌面/平板/手机） | — |

**不涉及：**
- 不修改 TopNav
- 不修改 router
- 不修改后端
- 不删除或修改任何现有组件
- 不改动 LandingHero 的现有样式

---

## 十一、色彩与品牌一致性验证

| 元素 | 使用色 | 色值 | 项目已有？ |
|------|--------|------|------------|
| 主标题 "行" accent | var(--coral) | #fd79a8 | ✅ 现有 LandingHero 一致 |
| 副标题 | var(--lavender) | #6c5ce7 | ✅ 品牌主色 |
| Slogan | var(--coral) | #fd79a8 | ✅ 现有 ask-button 同色 |
| CTA 按钮背景 | var(--lavender) | #6c5ce7 | ✅ 现有 primary-button 同色系 |
| 描述文字 | rgba(45,52,54,.72) | — | ✅ 现有 .lead 同色 |
| 导入小字 | rgba(45,52,54,.58) | — | ✅ 现有 .meta 同色 |

**结论：** 所有颜色均来自项目已有的 CSS 变量，零新增色值，品牌一致性 100%。
