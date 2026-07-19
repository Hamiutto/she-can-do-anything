<script setup>
import { computed, ref, watch } from 'vue'
import { submitQuestion } from '../api/index.js'

const props = defineProps({
  person: Object
})
const emit = defineEmits(['close', 'sent'])

const question = ref('')
const isSending = ref(false)
const errorMsg = ref('')
const isOpen = computed(() => Boolean(props.person))
const personName = computed(() => props.person?.name || '她')

watch(isOpen, (open) => {
  if (open) {
    question.value = ''
    isSending.value = false
    errorMsg.value = ''
  }
})

async function send() {
  const content = question.value.trim()
  if (!content) return

  isSending.value = true
  errorMsg.value = ''

  try {
    await submitQuestion({
      content: `向${personName.value}提问：${content}`,
      author: '匿名用户',
      time_type: 'fun'
    })
    emit('sent')
    emit('close')
    question.value = ''
  } catch (err) {
    errorMsg.value = err.response?.data?.error || err.response?.data?.message || '发送失败，请稍后重试'
  } finally {
    isSending.value = false
  }
}
</script>

<template>
  <div class="modal-backdrop" :class="{ 'is-open': isOpen }" role="dialog" aria-modal="true" aria-labelledby="askTitle" @click.self="emit('close')">
    <div class="letter-modal">
      <button class="modal-close" type="button" aria-label="关闭" @click="emit('close')">×</button>
      <h2 id="askTitle">向 {{ personName }} 提问</h2>
      <textarea v-model="question" maxlength="500" placeholder="写下你想问的问题，比如：你当时怎么判断自己适合转行？"></textarea>
      <div class="char-count"><span>{{ question.length }}</span>/500 字</div>
      <p v-if="errorMsg" class="error-msg">{{ errorMsg }}</p>
      <strong>展示方式</strong>
      <div class="radio-row">
        <label><input type="radio" name="privacy" checked> 公开，其他人也能看到回答</label>
        <label><input type="radio" name="privacy"> 私密，仅你和她可见</label>
      </div>
      <button class="primary-button" type="button" :disabled="isSending || !question.trim()" @click="send">{{ isSending ? '发送中...' : '发送提问' }}</button>
    </div>
  </div>
</template>

<style scoped>
.error-msg {
  margin: 8px 0 12px;
  color: var(--coral, #fd79a8);
  font-size: 0.88rem;
  line-height: 1.6;
}
</style>
