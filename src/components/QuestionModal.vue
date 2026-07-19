<script setup>
import { computed, ref, watch } from 'vue'

const props = defineProps({
  question: { type: Object, default: null },
  position: { type: Object, default: null } // { x, y }
})
const emit = defineEmits(['answer', 'skip', 'close'])

const isAnswering = ref(false)
const answerText = ref('')
const textareaRef = ref(null)

const isOpen = computed(() => Boolean(props.question))

const authorInitial = computed(() => {
  const name = props.question?.author || '?'
  return name.charAt(0).toUpperCase()
})

const timeTypeConfig = {
  survival: '\u{1F4AA} 生存时间',
  earning: '\u{1F4B0} 赚钱时间',
  beauty: '\u{1F484} 好看时间',
  fun: '\u{1F3AE} 好玩时间',
  flow: '\u{1F3B5} 心流时间'
}

const timeTypeLabel = computed(() => {
  if (!props.question?.time_type) return null
  return timeTypeConfig[props.question.time_type] || props.question.time_type
})

const quickEmojis = ['\u{1F60A}', '\u{1F4A1}', '\u{1F64C}', '\u{2764}\u{FE0F}', '\u{1F44D}', '\u{1F525}', '\u{2728}', '\u{1F4AA}']

const charCount = computed(() => answerText.value.length)

watch(isOpen, (open) => {
  if (open) {
    isAnswering.value = false
    answerText.value = ''
  }
})

function startAnswer() {
  isAnswering.value = true
}

function goBack() {
  isAnswering.value = false
}

function insertEmoji(emoji) {
  answerText.value += emoji
  textareaRef.value?.focus()
}

function autoResize() {
  const el = textareaRef.value
  if (!el) return
  el.style.height = 'auto'
  el.style.height = Math.min(el.scrollHeight, 220) + 'px'
}

function submit() {
  if (!answerText.value.trim()) return
  emit('answer', answerText.value.trim())
  answerText.value = ''
  isAnswering.value = false
}

function modalStyle() {
  if (!props.position) return {}
  const cardW = 480
  const cardH = 400
  const left = Math.max(16, Math.min(props.position.x, window.innerWidth - cardW))
  const top = Math.max(16, Math.min(props.position.y, window.innerHeight - cardH))
  return {
    left: left + 'px',
    top: top + 'px'
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div
        v-if="isOpen"
        class="question-modal-overlay"
        role="dialog"
        aria-modal="true"
        aria-labelledby="questionModalTitle"
        @click.self="emit('close')"
      >
        <div class="question-modal-card" :style="modalStyle()">
          <button
            class="question-modal-close"
            type="button"
            aria-label="关闭"
            @click="emit('close')"
          >&times;</button>

          <!-- State 1: Question display -->
          <template v-if="!isAnswering">
            <div class="question-modal-header">
              <div
                class="question-modal-avatar"
                :style="{
                  background: 'linear-gradient(145deg, rgba(108,92,231,.22), rgba(253,121,168,.22)), #fff'
                }"
              >
                {{ authorInitial }}
              </div>
              <div class="question-modal-author-info">
                <span class="question-modal-author-name">{{ question.author || '匿名用户' }}</span>
                <span v-if="question.created_at" class="question-modal-time">
                  {{ question.created_at }}
                </span>
              </div>
            </div>

            <div v-if="timeTypeLabel" class="question-modal-time-badge">
              {{ timeTypeLabel }}
            </div>

            <p id="questionModalTitle" class="question-modal-text">
              {{ question.content || question.text }}
            </p>

            <div class="question-modal-actions">
              <button class="question-modal-btn question-modal-btn--primary" type="button" @click="startAnswer">
                回答
              </button>
              <button class="question-modal-btn question-modal-btn--soft" type="button" @click="emit('skip')">
                跳过
              </button>
            </div>
          </template>

          <!-- State 2: Answer textarea -->
          <template v-else>
            <h3 class="question-modal-answer-title">写下你的回答</h3>

            <textarea
              ref="textareaRef"
              v-model="answerText"
              class="question-modal-textarea"
              placeholder="分享你的真实经历就好，不需要完美的答案……"
              maxlength="500"
              rows="4"
              @input="autoResize"
            />

            <div class="question-modal-emoji-bar">
              <button
                v-for="emoji in quickEmojis"
                :key="emoji"
                type="button"
                class="question-modal-emoji-btn"
                @click="insertEmoji(emoji)"
              >
                {{ emoji }}
              </button>
            </div>

            <div class="question-modal-char-count">
              <span>{{ charCount }}</span>/500 字
            </div>

            <div class="question-modal-actions">
              <button
                class="question-modal-btn question-modal-btn--primary"
                type="button"
                :disabled="!answerText.trim()"
                @click="submit"
              >
                提交回答
              </button>
              <button class="question-modal-btn question-modal-btn--soft" type="button" @click="goBack">
                返回
              </button>
            </div>
          </template>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.question-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 50;
  background: rgba(45, 52, 54, .20);
  backdrop-filter: blur(12px);
}

.question-modal-card {
  position: absolute;
  width: min(480px, calc(100vw - 32px));
  border-radius: 26px;
  padding: 28px;
  background:
    linear-gradient(135deg, rgba(255, 255, 255, .94), rgba(253, 246, 240, .94));
  border: 1px solid rgba(255, 255, 255, .92);
  box-shadow: var(--deep-shadow);
}

.question-modal-close {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 34px;
  height: 34px;
  border: 1px solid var(--line);
  border-radius: 50%;
  background: rgba(255, 255, 255, .76);
  color: var(--ink);
  font-size: 18px;
  display: grid;
  place-items: center;
  transition: background .2s ease, transform .2s ease;
}

.question-modal-close:hover {
  background: rgba(255, 255, 255, .95);
  transform: scale(1.08);
}

/* Header: avatar + author */
.question-modal-header {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 16px;
}

.question-modal-avatar {
  flex: 0 0 48px;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  color: var(--lavender);
  font-family: var(--serif);
  font-size: 20px;
  font-weight: 700;
  box-shadow: 0 8px 20px rgba(108, 92, 231, .14);
}

.question-modal-author-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.question-modal-author-name {
  font-weight: 700;
  font-size: 16px;
  color: var(--ink);
}

.question-modal-time {
  font-size: 13px;
  color: rgba(45, 52, 54, .52);
}

/* Time type badge */
.question-modal-time-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border-radius: 999px;
  background: rgba(108, 92, 231, .10);
  color: var(--lavender);
  font-size: 13px;
  font-weight: 700;
  margin-bottom: 16px;
}

/* Question text */
.question-modal-text {
  margin: 0 0 24px;
  font-size: 17px;
  line-height: 1.85;
  color: var(--ink);
}

/* Action buttons */
.question-modal-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.question-modal-btn {
  border-radius: 999px;
  padding: 12px 22px;
  font-weight: 800;
  font-size: 15px;
  border: 1px solid var(--line);
  transition: transform .22s ease, box-shadow .22s ease, background .22s ease;
}

.question-modal-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 28px rgba(85, 74, 126, .12);
}

.question-modal-btn--primary {
  border-color: transparent;
  background: var(--mint);
  color: #073d3b;
}

.question-modal-btn--primary:hover {
  background: #00b8a9;
}

.question-modal-btn--primary:disabled {
  opacity: .55;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.question-modal-btn--soft {
  background: rgba(255, 255, 255, .72);
  color: var(--ink);
}

/* Answer state */
.question-modal-answer-title {
  margin: 0 0 16px;
  font-family: var(--serif);
  font-size: 22px;
  color: var(--lavender);
}

.question-modal-textarea {
  width: 100%;
  min-height: 100px;
  max-height: 220px;
  resize: none;
  border: 1px solid var(--line);
  border-radius: 20px;
  background: rgba(255, 255, 255, .78);
  padding: 16px;
  outline: none;
  line-height: 1.8;
  font-size: 16px;
  transition: border-color .2s ease, box-shadow .2s ease;
}

.question-modal-textarea:focus {
  border-color: rgba(108, 92, 231, .48);
  box-shadow: 0 0 0 4px rgba(108, 92, 231, .10);
}

/* Emoji bar */
.question-modal-emoji-bar {
  display: flex;
  gap: 6px;
  margin-top: 12px;
  flex-wrap: wrap;
}

.question-modal-emoji-btn {
  width: 38px;
  height: 38px;
  border: 1px solid var(--line);
  border-radius: 12px;
  background: rgba(255, 255, 255, .64);
  font-size: 18px;
  display: grid;
  place-items: center;
  transition: transform .15s ease, background .15s ease;
}

.question-modal-emoji-btn:hover {
  transform: scale(1.15);
  background: rgba(255, 255, 255, .92);
}

/* Char counter */
.question-modal-char-count {
  margin-top: 10px;
  text-align: right;
  color: rgba(45, 52, 54, .52);
  font-size: 13px;
}

/* Transitions */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity .22s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-active .question-modal-card {
  transition: transform .24s ease;
}

.modal-fade-enter-from .question-modal-card {
  transform: translateY(24px) scale(.97);
}

/* Responsive */
@media (max-width: 640px) {
  .question-modal-card {
    width: calc(100vw - 24px);
    padding: 22px 18px;
    border-radius: 20px;
  }

  .question-modal-actions {
    flex-direction: column;
  }

  .question-modal-btn {
    width: 100%;
    text-align: center;
  }
}
</style>
