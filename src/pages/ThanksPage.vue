<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { thanksData, addThank } from '../data/thanks.js'
import { bubbleSlots } from '../data/tags.js'
import { useAuth } from '../composables/useAuth'

const router = useRouter()
const { state: authState } = useAuth()

const activeStart = ref(0)
const fading = ref(false)
const showModal = ref(false)
const thankText = ref('')
const errorMsg = ref('')
let timer = 0

const activeThanks = computed(() => {
  const list = thanksData.value
  if (!list.length) return []
  return bubbleSlots.map((slot, index) => ({
    ...list[(activeStart.value + index) % list.length],
    ...slot,
  }))
})

function cycle() {
  fading.value = true
  window.setTimeout(() => {
    activeStart.value = (activeStart.value + 3) % thanksData.value.length
    fading.value = false
  }, 520)
}

onMounted(() => {
  timer = window.setInterval(cycle, 4200)
})

onBeforeUnmount(() => {
  window.clearInterval(timer)
})

function openModal() {
  showModal.value = true
  thankText.value = ''
  errorMsg.value = ''
}

function closeModal() {
  showModal.value = false
}

function submitThank() {
  if (!thankText.value.trim()) {
    errorMsg.value = '感谢内容不能为空'
    return
  }
  const user = authState.user?.nickname || ''
  addThank(user, thankText.value.trim())
  thankText.value = ''
  errorMsg.value = ''
  showModal.value = false
}

function goBack() {
  router.push('/qa-square')
}
</script>

<template>
  <section class="page-section section is-active">
    <div class="page-card thanks-card">
      <h2>感谢墙</h2>
      <p class="lead">爱出者爱返，福往者福来。</p>

      <div class="thanks-field">
        <div
          v-for="(item, index) in activeThanks"
          :key="item.id + '-' + index"
          class="thanks-bubble"
          :class="{ 'is-fading': fading && index < 3 }"
          :style="{ left: item.x + '%', top: item.y + '%' }"
        >
          <span class="bubble-user">@{{ item.user }}</span>
          <p class="bubble-text">{{ item.text }}</p>
        </div>
      </div>

      <div class="thanks-actions">
        <button class="primary-button" type="button" @click="openModal">
          写一条感谢
        </button>
        <button class="soft-button" type="button" @click="goBack">
          ← 返回问问她
        </button>
      </div>
    </div>

    <!-- Thank you submission modal -->
    <Teleport to="body">
      <Transition name="slide-up">
        <div v-if="showModal" class="qa-modal" @click.self="closeModal">
          <div class="qa-modal-dialog">
            <button class="modal-close" @click="closeModal" aria-label="关闭">&times;</button>
            <h3 class="modal-title">写一条感谢</h3>

            <label class="form-label">你的昵称</label>
            <input
              :value="authState.user?.nickname || ''"
              class="form-input"
              type="text"
              placeholder="默认为匿名用户"
              readonly
            />

            <label class="form-label">感谢的话</label>
            <textarea
              v-model="thankText"
              class="form-textarea"
              placeholder="写下你想对她说……"
              maxlength="300"
              rows="4"
            ></textarea>
            <div class="char-count">{{ thankText.length }}/300</div>

            <p v-if="errorMsg" class="error-msg">{{ errorMsg }}</p>

            <button
              class="primary-button submit-btn"
              :disabled="!thankText.trim()"
              @click="submitThank"
            >
              发送感谢
            </button>
          </div>
        </div>
      </Transition>
    </Teleport>
  </section>
</template>

<style scoped>
.thanks-card {
  max-width: 980px;
  margin: 0 auto;
}

.thanks-field {
  position: relative;
  height: 420px;
  margin: 24px 0;
}

.thanks-bubble {
  position: absolute;
  border: 1px solid rgba(255, 255, 255, 0.70);
  border-radius: 16px;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.82);
  box-shadow: 0 12px 26px rgba(85, 74, 126, 0.11);
  animation: floaty 4.8s ease-in-out infinite;
  max-width: 220px;
  transform: translate(-50%, -50%);
  transition: opacity 0.3s, transform 0.3s;
}

.thanks-bubble.is-fading {
  opacity: 0;
  transform: translate(-50%, -50%) scale(0.95);
}

.bubble-user {
  display: block;
  font-size: 0.75rem;
  color: var(--lavender, #6c5ce7);
  font-weight: 700;
  margin-bottom: 4px;
}

.bubble-text {
  margin: 0;
  font-size: 0.85rem;
  color: rgba(45, 52, 54, 0.78);
  line-height: 1.6;
}

@keyframes floaty {
  0%, 100% { margin-top: 0; }
  50% { margin-top: -10px; }
}

.thanks-actions {
  display: flex;
  gap: 14px;
  justify-content: center;
  margin-top: 18px;
}

/* Modal — reuse QaSquarePage styles */
.qa-modal {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: auto;
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
</style>
