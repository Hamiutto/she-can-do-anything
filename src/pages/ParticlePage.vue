<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import ParticleCanvas from '../components/ParticleCanvas.vue'
import QuestionModal from '../components/QuestionModal.vue'

const router = useRouter()

const questions = ref([])
const selectedQuestion = ref(null)
const showModal = ref(false)
const modalPosition = ref({ x: 0, y: 0 })
const isLoading = ref(true)
const toastMsg = ref('')

onMounted(async () => {
  try {
    const { data } = await axios.get('/api/questions')
    questions.value = data
  } catch {
    questions.value = []
  } finally {
    isLoading.value = false
  }
})

function showToast(msg) {
  toastMsg.value = msg
  setTimeout(() => { toastMsg.value = '' }, 2500)
}

function onParticleClick(event) {
  const q = event?.data?.questionData
  if (q) {
    selectedQuestion.value = q
    modalPosition.value = { x: event.x, y: event.y }
    showModal.value = true
  }
}

function onCanvasClick(event) {
  if (questions.value.length === 0) {
    showToast('暂无可回答的问题，请先在问答广场提个问题')
    return
  }
  const idx = Math.floor(Math.random() * questions.value.length)
  selectedQuestion.value = questions.value[idx]
  modalPosition.value = { x: event.x, y: event.y }
  showModal.value = true
}

function onSubmitAnswer(answerText) {
  if (!selectedQuestion.value) return
  axios.post(`/api/questions/${selectedQuestion.value.id}/answer`, {
    content: answerText,
    author: '匿名用户',
  })
    .then(() => {
      questions.value = questions.value.filter(q => q.id !== selectedQuestion.value.id)
      closeModal()
    })
    .catch(err => {
      showToast(err.response?.data?.error || err.response?.data?.message || '回答提交失败，请稍后重试')
    })
}

function closeModal() {
  showModal.value = false
  selectedQuestion.value = null
}

function goBack() {
  router.push('/qa-square')
}
</script>

<template>
  <div class="particle-page">
    <p class="guide-text">
      点击粒子，回答一个真实的问题
      <span class="guide-sub">或在空白处点击，发现新问题</span>
    </p>

    <ParticleCanvas
      :questions="questions"
      @particle-click="onParticleClick"
      @canvas-click="onCanvasClick"
    />

    <QuestionModal
      v-if="showModal && selectedQuestion"
      :question="selectedQuestion"
      :position="modalPosition"
      @answer="onSubmitAnswer"
      @skip="closeModal"
      @close="closeModal"
    />

    <div class="bottom-bar">
      <button class="soft-button" type="button" @click="goBack">
        ← 返回问答广场
      </button>
    </div>

    <!-- Toast -->
    <Transition name="toast-fade">
      <div v-if="toastMsg" class="toast">{{ toastMsg }}</div>
    </Transition>
  </div>
</template>

<style scoped>
.particle-page {
  position: relative;
  width: 100vw;
  left: 50%;
  right: 50%;
  margin-left: -50vw;
  margin-right: -50vw;
  min-height: 100vh;
}

.guide-text {
  position: fixed;
  top: 70px;
  left: 0;
  right: 0;
  text-align: center;
  font-family: var(--serif);
  font-size: clamp(16px, 2.4vw, 22px);
  color: rgba(45, 52, 54, 0.35);
  pointer-events: none;
  z-index: 3;
  line-height: 1.8;
}

.guide-sub {
  display: block;
  font-size: 0.85em;
  opacity: 0.7;
  margin-top: 4px;
}

.bottom-bar {
  position: fixed;
  bottom: 24px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  z-index: 10;
}

.toast {
  position: fixed;
  bottom: 80px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--ink, #2d3436);
  color: #fff;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 0.9rem;
  z-index: 100;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  white-space: nowrap;
}

.toast-fade-enter-active,
.toast-fade-leave-active {
  transition: opacity 0.3s, transform 0.3s;
}

.toast-fade-enter-from,
.toast-fade-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(8px);
}
</style>
