<template>
  <section class="page-section section is-active">
    <div class="page-card">
      <h2>问答广场</h2>
      <p class="lead">提问、回答、感谢，都在这里。</p>
      <div class="qa-grid">
        <article class="qa-card qa-card--interactive" @click="openModal">
          <strong>公开提问</strong>
          <p>关于转行、育儿、GAP 和自我成长的问题，点击提交你的问题。</p>
        </article>
        <article class="qa-card qa-card--interactive" @click="goAnswer">
          <strong>回答问题</strong>
          <p>分享你的真实经历，不追求完美模板。</p>
        </article>
        <article class="qa-card">
          <strong>感谢信</strong>
          <p>当一次回应真的帮到一个人，感谢会被温柔地记录下来。</p>
        </article>
      </div>
    </div>

    <!-- Question submission modal -->
    <div v-if="showModal" class="modal-backdrop" @click.self="closeModal">
      <div class="modal-dialog">
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
          class="primary-button submit-btn"
          :disabled="isSubmitting || !question.trim()"
          @click="submitQuestion"
        >
          {{ isSubmitting ? '提交中…' : '提交问题' }}
        </button>
      </div>
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

const router = useRouter()

// Modal state
const showModal = ref(false)
const nickname = ref('')
const question = ref('')
const timeType = ref('心流')
const isSubmitting = ref(false)
const errorMsg = ref('')

// Toast state
const showToast = ref(false)
const toastMsg = ref('')

const timeTypes = [
  { emoji: '💪', label: '生存', value: '生存' },
  { emoji: '💰', label: '赚钱', value: '赚钱' },
  { emoji: '💄', label: '好看', value: '好看' },
  { emoji: '🎮', label: '好玩', value: '好玩' },
  { emoji: '🎵', label: '心流', value: '心流' },
]

function openModal() {
  showModal.value = true
  nickname.value = ''
  question.value = ''
  timeType.value = '心流'
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
    await axios.post('/api/questions', {
      content: question.value.trim(),
      author: nickname.value.trim() || '匿名用户',
      time_type: timeType.value,
    })
    showToast.value = true
    toastMsg.value = '问题已提交成功！'
    setTimeout(() => {
      showToast.value = false
      closeModal()
    }, 1500)
  } catch (err) {
    errorMsg.value = err.response?.data?.message || '提交失败，请稍后重试'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(45, 52, 54, 0.24);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-dialog {
  background: var(--paper, #fff);
  color: var(--ink, #2d3436);
  border-radius: 16px;
  padding: 32px 28px 28px;
  width: 90%;
  max-width: 480px;
  position: relative;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12);
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
</style>
