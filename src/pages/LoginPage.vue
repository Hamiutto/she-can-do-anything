<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import SiteDisclaimer from '../components/SiteDisclaimer.vue'
import { useAuth } from '../composables/useAuth'

const router = useRouter()
const route = useRoute()
const { login, register, state } = useAuth()

const isLoginMode = ref(true)
const email = ref('')
const password = ref('')
const nickname = ref('')
const errorMsg = ref('')
const submitting = ref(false)
const agreed = ref(false)

async function handleSubmit() {
  if (!agreed.value) {
    errorMsg.value = '请先阅读并同意用户协议和隐私政策'
    return
  }
  errorMsg.value = ''
  submitting.value = true

  try {
    if (isLoginMode.value) {
      await login(email.value.trim(), password.value)
    } else {
      await register(email.value.trim(), password.value, nickname.value.trim() || null)
    }

    // Redirect to original destination or profile
    const redirect = route.query.redirect || '/profile'
    router.push(redirect)
  } catch (err) {
    errorMsg.value = typeof err === 'string' ? err : '操作失败，请稍后重试'
  } finally {
    submitting.value = false
  }
}

function toggleMode() {
  isLoginMode.value = !isLoginMode.value
  errorMsg.value = ''
  email.value = ''
  password.value = ''
  nickname.value = ''
  agreed.value = false
}
</script>

<template>
  <div class="login-page">
    <div class="login-card">
      <div class="login-brand">SHE IS <span>____</span></div>

      <h2 class="login-title">{{ isLoginMode ? '登录' : '注册' }}</h2>

      <form @submit.prevent="handleSubmit" class="login-form">
        <div class="form-group">
          <label class="form-label" for="login-email">邮箱</label>
          <input
            id="login-email"
            v-model="email"
            class="form-input"
            type="email"
            placeholder="your@email.com"
            required
            autocomplete="email"
          />
        </div>

        <div class="form-group">
          <label class="form-label" for="login-password">密码</label>
          <input
            id="login-password"
            v-model="password"
            class="form-input"
            type="password"
            :placeholder="isLoginMode ? '输入密码' : '至少 6 位'"
            required
            minlength="6"
            autocomplete="current-password"
          />
        </div>

        <div v-if="!isLoginMode" class="form-group">
          <label class="form-label" for="login-nickname">昵称（可选）</label>
          <input
            id="login-nickname"
            v-model="nickname"
            class="form-input"
            type="text"
            placeholder="怎么称呼你？"
            maxlength="30"
            autocomplete="nickname"
          />
        </div>

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

        <p v-if="errorMsg" class="error-msg">{{ errorMsg }}</p>

        <button
          class="primary-button login-submit"
          type="submit"
          :disabled="!agreed || submitting || state.loading"
        >
          {{ submitting || state.loading ? '处理中…' : (isLoginMode ? '登录' : '注册') }}
        </button>
      </form>

      <div class="login-toggle">
        <button class="toggle-link" type="button" @click="toggleMode">
          {{ isLoginMode ? '还没有账号？注册' : '已有账号？登录' }}
        </button>
      </div>

      <div class="login-back">
        <RouterLink class="back-link" to="/">← 返回首页</RouterLink>
      </div>
    </div>
    <SiteDisclaimer class="login-disclaimer" />
  </div>
</template>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.login-card {
  width: 100%;
  max-width: 420px;
  background: rgba(255, 255, 255, 0.88);
  border: 1px solid rgba(255, 255, 255, 0.92);
  border-radius: 28px;
  padding: 40px 32px 32px;
  box-shadow: var(--soft-shadow);
}

.login-brand {
  text-align: center;
  font-family: var(--serif);
  font-size: 1.6rem;
  font-weight: 700;
  color: var(--ink);
  margin-bottom: 28px;
}

.login-brand span {
  color: var(--lavender);
}

.login-title {
  text-align: center;
  font-family: var(--serif);
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--lavender);
  margin: 0 0 24px;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--ink);
}

.form-input {
  padding: 10px 14px;
  border: 1px solid var(--line);
  border-radius: 10px;
  font-size: 0.95rem;
  font-family: inherit;
  background: rgba(255, 255, 255, 0.82);
  color: var(--ink);
  outline: none;
  transition: border-color 0.2s;
}

.form-input:focus {
  border-color: var(--lavender);
  box-shadow: 0 0 0 4px rgba(108, 92, 231, 0.08);
}

.error-msg {
  color: var(--coral, #fd79a8);
  font-size: 0.85rem;
  margin: 0;
  text-align: center;
}

.login-submit {
  width: 100%;
  margin-top: 4px;
  padding: 12px;
  font-size: 1rem;
}

.login-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.login-toggle {
  text-align: center;
  margin-top: 16px;
}

.toggle-link {
  background: none;
  border: none;
  color: var(--lavender);
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  padding: 8px;
}

.toggle-link:hover {
  text-decoration: underline;
}

.login-back {
  text-align: center;
  margin-top: 12px;
}

.back-link {
  color: rgba(45, 52, 54, 0.5);
  font-size: 0.85rem;
}

.back-link:hover {
  color: var(--lavender);
}

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

.login-disclaimer {
  width: 100%;
  max-width: 960px;
}
</style>
