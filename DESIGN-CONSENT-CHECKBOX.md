# 登录/注册页 — 知情同意选项方案

> 日期：2026-07-19

---

## 1. 需求

在登录/注册表单底部添加一个"知情同意"勾选选项，用户必须勾选后才能点击"登录"或"注册"按钮提交。

---

## 2. 修改方案

### 2.1 变更文件

仅需修改 `src/pages/LoginPage.vue`。

### 2.2 交互逻辑

- 新增 `agreed` 状态（`ref(false)`），默认未勾选
- 提交按钮的 `disabled` 条件增加 `!agreed`
- 仅在**注册模式**下显示勾选框（登录模式可选，建议也显示）
- 切换登录/注册模式时重置 `agreed = false`

### 2.3 文案设计

```
☐ 我已阅读并同意《用户协议》和《隐私政策》，知晓我的邮箱和密码将被安全存储。
```

文案样式：
- 小字号（0.78rem），低透明度文字
- 复选框 + 可点击的协议链接（占位，后续对接实际页面）
- 未勾选时提交按钮禁用，悬停显示提示

### 2.4 弹窗原型

```
┌──────────────────────────────────────┐
│              SHE IS ____             │
│                                      │
│              登录 / 注册              │
│                                      │
│  邮箱                                │
│  [                              ]   │
│                                      │
│  密码                                │
│  [                              ]   │
│                                      │
│  ☐ 我已阅读并同意《用户协议》          │
│    和《隐私政策》，知晓我的邮箱和      │
│    密码将被安全存储。                  │
│                                      │
│  [  登录  ]  ← 未勾选时禁用灰显        │
│                                      │
│  还没有账号？注册                      │
│  ← 返回首页                           │
└──────────────────────────────────────┘
```

### 2.5 代码变更

#### Script 部分

```diff
 const errorMsg = ref('')
 const submitting = ref(false)
+const agreed = ref(false)

 async function handleSubmit() {
+  if (!agreed.value) {
+    errorMsg.value = '请先阅读并同意用户协议和隐私政策'
+    return
+  }
   errorMsg.value = ''
   submitting.value = true
   // ...
 }

 function toggleMode() {
   isLoginMode.value = !isLoginMode.value
   errorMsg.value = ''
   email.value = ''
   password.value = ''
   nickname.value = ''
+  agreed.value = false
 }
```

#### Template 部分

在密码输入框之后、错误提示之前插入：

```html
<div class="form-group consent-group">
  <label class="consent-label">
    <input v-model="agreed" type="checkbox" />
    <span>
      我已阅读并同意
      <a class="consent-link" href="#" @click.prevent>《用户协议》</a>
      和
      <a class="consent-link" href="#" @click.prevent>《隐私政策》</a>
      ，知晓我的邮箱和密码将被安全存储。
    </span>
  </label>
</div>
```

提交按钮增加 `!agreed` 禁用条件：

```diff
-:disabled="submitting || state.loading"
+:disabled="!agreed || submitting || state.loading"
```

#### CSS 部分

```css
.consent-group {
  margin-top: 4px;
}

.consent-label {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 0.78rem;
  color: rgba(45, 52, 54, 0.55);
  line-height: 1.6;
  cursor: pointer;
}

.consent-label input[type="checkbox"] {
  margin-top: 3px;
  flex-shrink: 0;
  accent-color: var(--lavender, #6c5ce7);
  width: 14px;
  height: 14px;
}

.consent-link {
  color: var(--lavender, #6c5ce7);
  text-decoration: underline;
  font-weight: 600;
}

.consent-link:hover {
  color: var(--ink, #2d3436);
}
```

---

## 3. 影响评估

| 影响 | 说明 |
|------|------|
| 文件变更 | 仅 `LoginPage.vue`，1 个文件 |
| 现有功能 | 不受影响，仅增加必填勾选约束 |
| 用户体验 | 注册/登录前需多一步勾选，符合合规要求 |
| 后端 | 无需修改 |

---

## 4. 后续扩展

- 协议链接可对接实际页面或弹窗
- 可增加独立的《隐私政策》页面路由
- 登录模式可简化为仅提示"登录即表示同意"
