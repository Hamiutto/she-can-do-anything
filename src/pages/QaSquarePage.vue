<template>
  <section class="page-section section is-active">
    <div class="page-card">
      <h2>问问她</h2>
      <p class="lead">你的困惑、你的解答、你的感谢、你发出的一点光亮，都在这里。</p>
      <div class="qa-grid">
        <article class="qa-card qa-card--interactive" @click="openModal">
          <strong>我想问问</strong>
          <p>关于你想知道的一切、辞职、婚姻、生育，看看过来人怎么说？</p>
        </article>
        <article class="qa-card qa-card--interactive" @click="goAnswer">
          <strong>我来解答</strong>
          <p>你的真实经历和感悟，是别人成长的阶梯和一扇窗。</p>
        </article>
        <article class="qa-card">
          <strong>我想感谢</strong>
          <p>爱出者爱返，福往者福来。</p>
        </article>
      </div>
    </div>

    <!-- Question submission modal (no gray backdrop) -->
    <Teleport to="body">
      <Transition name="slide-up">
        <div v-if="showModal" class="qa-modal" @click.self="closeModal">
          <div class="qa-modal-dialog">
            <button class="modal-close" @click="closeModal" aria-label="关闭">&times;</button>
            <h3 class="modal-title">公开提问</h3>

            <label class="form-label">昵称（可选）</label>
            <input
              v-model="nickname"
              class="form-input"
              type="text"
              placeholder="默认为匿名用户"
              maxlength="50"
            />

            <label class="form-label">你的问题</label>
            <textarea
              v-model="question"
              class="form-textarea"
              placeholder="写下你想问的问题……"
              maxlength="500"
              rows="4"
            ></textarea>
            <div class="char-count">{{ question.length }}/500</div>

            <label class="form-label">时间类型</label>
            <div class="time-type-group">
              <button
                v-for="t in timeTypes"
                :key="t.value"
                :class="['time-type-btn', { active: timeType === t.value }]"
                @click="timeType = t.value"
                type="button"
              >
                {{ t.emoji }}{{ t.label }}
              </button>
            </div>

            <p v-if="errorMsg" class="error-msg">{{ errorMsg }}</p>

            <button
              ref="submitBtnRef"
              class="primary-button submit-btn"
              :disabled="isSubmitting || !question.trim()"
              @click="submitQuestion"
            >
              {{ isSubmitting ? '提交中…' : '提交问题' }}
            </button>

            <p v-if="!authState.isLoggedIn" class="login-hint">
              登录后问题将关联你的账号，
              <RouterLink class="hint-link" to="/login">去登录</RouterLink>
            </p>
          </div>
        </div>
      </Transition>
    </Teleport>

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

    <!-- Toast notification -->
    <transition name="toast">
      <div v-if="showToast" class="toast">{{ toastMsg }}</div>
    </transition>
  </section>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { useAuth } from '../composables/useAuth'

const router = useRouter()
const { state: authState } = useAuth()

// Modal state
const showModal = ref(false)
const nickname = ref('')
const question = ref('')
const timeType = ref('flow')
const isSubmitting = ref(false)
const errorMsg = ref('')
const submitBtnRef = ref(null)

// Toast state
const showToast = ref(false)
const toastMsg = ref('')

// Shatter burst particles
const burstParticles = ref([])
let particleId = 0

function triggerBurst(x, y) {
  const particles = []
  const color = '#6c5ce7'
  for (let i = 0; i < 12; i++) {
    const angle = (Math.PI * 2 / 12) * i + (Math.random() - 0.5) * 0.3
    const speed = 60 + Math.random() * 80
    particles.push({
      id: particleId++,
      x, y,
      tx: Math.cos(angle) * speed,
      ty: Math.sin(angle) * speed,
      color,
    })
  }
  burstParticles.value = particles
  setTimeout(() => { burstParticles.value = [] }, 650)
}

const timeTypes = [
  { emoji: '💪', label: '生存', value: 'survival' },
  { emoji: '💰', label: '赚钱', value: 'earning' },
  { emoji: '💄', label: '好看', value: 'beauty' },
  { emoji: '🎮', label: '好玩', value: 'fun' },
  { emoji: '🎵', label: '心流', value: 'flow' },
]

function openModal() {
  showModal.value = true
  nickname.value = authState.user?.nickname || ''
  question.value = ''
  timeType.value = 'flow'
  errorMsg.value = ''
}

function closeModal() {
  showModal.value = false
}

function goAnswer() {
  router.push('/particle')
}

async function submitQuestion() {
  if (!question.value.trim()) return
  isSubmitting.value = true
  errorMsg.value = ''

  try {
    const headers = {}
    if (authState.token) {
      headers.Authorization = `Bearer ${authState.token}`
    }
    await axios.post('/api/questions', {
      content: question.value.trim(),
      author: nickname.value.trim() || (authState.user?.nickname) || '匿名用户',
      time_type: timeType.value,
    }, { headers })

    // Trigger shatter burst effect at submit button position
    const btn = submitBtnRef.value
    if (btn) {
      const rect = btn.getBoundingClientRect()
      triggerBurst(rect.left + rect.width / 2, rect.top + rect.height / 2)
    }

    showToast.value = true
    toastMsg.value = '问题已提交成功！✨'
    setTimeout(() => {
      showToast.value = false
      closeModal()
    }, 1500)
  } catch (err) {
    errorMsg.value = err.response?.data?.error || err.response?.data?.message || '提交失败，请稍后重试'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
/* Modal overlay — no gray backdrop */
.qa-modal {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: auto;
  /* no background → page stays visible */
}

.qa-modal-dialog {
  background: var(--paper, #fff);
  color: var(--ink, #2d3436);
  border-radius: 20px;
  padding: 32px 28px 28px;
  width: 90%;
  max-width: 480px;
  position: relative;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.18);
  border: 1px solid rgba(255, 255, 255, 0.9);
}

/* Slide-up transition */
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

.modal-close {
  position: absolute;
  top: 12px;
  right: 16px;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--ink, #2d3436);
  opacity: 0.5;
  transition: opacity 0.2s;
}

.modal-close:hover {
  opacity: 1;
}

.modal-title {
  margin: 0 0 20px;
  font-size: 1.25rem;
  color: var(--lavender, #8b7ec8);
}

.form-label {
  display: block;
  font-size: 0.85rem;
  font-weight: 600;
  margin-bottom: 6px;
  color: var(--ink, #2d3436);
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 0.95rem;
  font-family: inherit;
  background: var(--paper, #fff);
  color: var(--ink, #2d3436);
  box-sizing: border-box;
  transition: border-color 0.2s;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: var(--lavender, #8b7ec8);
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

.char-count {
  text-align: right;
  font-size: 0.75rem;
  color: #999;
  margin-top: 4px;
  margin-bottom: 16px;
}

.time-type-group {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 20px;
}

.time-type-btn {
  padding: 6px 12px;
  border: 1px solid #ddd;
  border-radius: 20px;
  background: var(--paper, #fff);
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.2s;
  color: var(--ink, #2d3436);
}

.time-type-btn:hover {
  border-color: var(--lavender, #8b7ec8);
}

.time-type-btn.active {
  background: var(--lavender, #8b7ec8);
  color: #fff;
  border-color: var(--lavender, #8b7ec8);
}

.error-msg {
  color: var(--coral, #e17055);
  font-size: 0.85rem;
  margin-bottom: 12px;
}

.submit-btn {
  width: 100%;
  margin-top: 8px;
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.qa-card--interactive {
  cursor: pointer;
  transition: transform 0.15s, box-shadow 0.15s;
}

.qa-card--interactive:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.toast {
  position: fixed;
  bottom: 32px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--ink, #2d3436);
  color: #fff;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 0.9rem;
  z-index: 1100;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.toast-enter-active,
.toast-leave-active {
  transition: opacity 0.3s, transform 0.3s;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(8px);
}

.login-hint {
  text-align: center;
  margin-top: 12px;
  font-size: 0.82rem;
  color: rgba(45, 52, 54, 0.45);
}

.hint-link {
  color: var(--lavender, #8b7ec8);
  font-weight: 600;
  text-decoration: underline;
}

.hint-link:hover {
  color: var(--ink, #2d3436);
}

/* Shatter burst particles */
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
</style>
