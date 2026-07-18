<script setup>
import { computed, ref, watch } from 'vue'

const props = defineProps({
  person: Object
})
const emit = defineEmits(['close', 'sent'])

const question = ref('')
const isSending = ref(false)
const isOpen = computed(() => Boolean(props.person))

watch(isOpen, (open) => {
  if (open) {
    question.value = ''
    isSending.value = false
  }
})

function send() {
  isSending.value = true
  window.setTimeout(() => {
    isSending.value = false
    emit('close')
    emit('sent')
    question.value = ''
  }, 650)
}
</script>

<template>
  <div class="modal-backdrop" :class="{ 'is-open': isOpen }" role="dialog" aria-modal="true" aria-labelledby="askTitle" @click.self="emit('close')">
    <div class="letter-modal">
      <button class="modal-close" type="button" aria-label="关闭" @click="emit('close')">×</button>
      <h2 id="askTitle">向 {{ person?.name || '她' }} 提问</h2>
      <textarea v-model="question" maxlength="500" placeholder="写下你想问的问题，比如：你当时怎么判断自己适合转行？"></textarea>
      <div class="char-count"><span>{{ question.length }}</span>/500 字</div>
      <strong>展示方式</strong>
      <div class="radio-row">
        <label><input type="radio" name="privacy" checked> 公开，其他人也能看到回答</label>
        <label><input type="radio" name="privacy"> 私密，仅你和她可见</label>
      </div>
      <button class="primary-button" type="button" :disabled="isSending" @click="send">{{ isSending ? '已发送' : '发送提问' }}</button>
    </div>
  </div>
</template>
