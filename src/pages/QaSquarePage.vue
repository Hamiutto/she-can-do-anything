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
        <article class="qa-card qa-card--interactive" @click="goThanks">
          <strong>我想感谢</strong>
          <p>爱出者爱返，福往者福来。</p>
        </article>
      </div>
    </div>

    <section class="qa-letter-section" :class="{ 'is-expanded': isLetterExpanded }">
      <div class="qa-letter-heading">
        <span class="qa-letter-kicker">She can do anything</span>
        <h2>写给 women 的心里话</h2>
      </div>

      <div class="qa-letter-quotes">
        <p v-for="quote in letterQuotes" :key="quote">“{{ quote }}”</p>
      </div>

      <div class="qa-letter-copy">
        <div class="qa-letter-body">
          <section v-for="block in letterBlocks" :key="block.title || block.body" class="qa-letter-block">
            <strong v-if="block.title">{{ block.title }}</strong>
            <p>{{ block.body }}</p>
          </section>
        </div>
        <div v-if="!isLetterExpanded" class="qa-letter-fade" aria-hidden="true"></div>
      </div>

      <button
        class="soft-button qa-letter-toggle"
        type="button"
        :aria-expanded="isLetterExpanded"
        @click="isLetterExpanded = !isLetterExpanded"
      >
        {{ isLetterExpanded ? '收起心里话' : '展开阅读全文' }}
      </button>
    </section>

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
const isLetterExpanded = ref(false)

const letterQuotes = [
  '不要因为怕输而说不想赢……',
  '人生的价值排序，应该是我觉得、我喜欢、我想要、我乐意……',
  '愿你按自己的意愿过一生……',
]

const letterBlocks = [
  {
    title: '当女性站上舞台',
    body: '当女性拥有更多的话语权和掌控权，她就不会只是想表达她……'
  },
  {
    title: '是谁规定？',
    body: '你必须要很努力，才能和男生一样显得毫不费力。这些“规定”，不应该是规训我们的有色眼镜，更应该是我们很强的证明。'
  },
  {
    title: '是谁调查？',
    body: '35了？结婚了吗？有孩子吗？这些调查，不应该是卡住我们前行的枷锁，更应该是我们过来人的勋章。'
  },
  {
    title: '是谁爱问？',
    body: '某女性，你如何平衡你的事业与家庭？你如何做到上得厅堂下得厨房？这些问题，不应该是某女性，更应该是全人类。'
  },
  {
    title: '人生，真的非常艰难……',
    body: '有些人只是活下去，就拼尽了全力。有些人，奋斗18年，只为翻过那座压住自己的大山……有些人，努力29年，只为在职场上得到一句肯定……有些人，努力36年，只为有一个属于自己的家……有些人，斗争了一辈子，只为在家族有一点话语权……'
  },
  {
    title: '在人生游戏中',
    body: '我们闯关、破局、跌倒、爬起……我们困惑、迷茫、焦虑、不安……人生决策权，不应该交给《答案之书》，不应该去问塔罗星座，不应该听世俗意义上的答案……'
  },
  {
    title: '不要因为怕输而说不想赢……',
    body: '不要焦虑事业、健康、家庭、颜值……不要陷进贤良淑德自我牺牲自我感动的“评价”……'
  },
  {
    title: '人生的价值排序',
    body: '不应该是别人说、他们说、领导说、父母说……应该是我觉得、我喜欢、我想要、我乐意……'
  },
  {
    title: '什么是答案？',
    body: '是我来过、我活过、我临终前觉得不虚此行的笃定……'
  },
  {
    title: 'She can do anything',
    body: '在这里，我们（women）共创美好活法的一万种可能。'
  },
  {
    title: '真实的交流',
    body: '越是AI信息冲击的时代，人和人之间真实的交流就越显珍贵。越是新媒体发展冲击的时代，一个真实的活人在你面前和你一对一才更真实。'
  },
  {
    title: '这里',
    body: '这里既是你展示自我的大舞台，又是助你解决问题的避风港。'
  },
  {
    title: '世界这么大',
    body: '你想要好奇的生活一定有人在活。人生路漫长，你眼下的困惑也一定会找到解答。'
  },
  {
    title: '女子便是好……',
    body: '女性就是力量……愿你按自己的意愿过一生……希望世界再大、路在遥远漫长，women都有勇气出发……'
  },
]

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

function goThanks() {
  router.push('/thanks')
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

.qa-letter-section {
  position: relative;
  width: min(100%, 980px);
  margin: 18px auto 0;
  padding: clamp(26px, 4vw, 42px);
  border: 1px solid rgba(255, 255, 255, 0.84);
  border-radius: 28px;
  background:
    linear-gradient(135deg, rgba(255, 255, 255, 0.78), rgba(253, 246, 240, 0.58)),
    linear-gradient(90deg, rgba(108, 92, 231, 0.08), transparent 28%, rgba(253, 121, 168, 0.08));
  box-shadow: 0 22px 58px rgba(85, 74, 126, 0.12);
  overflow: hidden;
}

.qa-letter-section::before {
  content: "";
  position: absolute;
  inset: 16px;
  border: 1px dashed rgba(108, 92, 231, 0.12);
  border-radius: 22px;
  pointer-events: none;
}

.qa-letter-heading,
.qa-letter-quotes,
.qa-letter-copy,
.qa-letter-toggle {
  position: relative;
  z-index: 1;
}

.qa-letter-kicker {
  display: inline-flex;
  margin-bottom: 12px;
  padding: 7px 12px;
  border-radius: 999px;
  background: rgba(108, 92, 231, 0.1);
  color: var(--lavender, #6c5ce7);
  font-size: 0.82rem;
  font-weight: 800;
}

.qa-letter-heading h2 {
  margin: 0;
  font-family: var(--serif);
  font-size: clamp(30px, 4vw, 44px);
  line-height: 1.18;
}

.qa-letter-quotes {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin: 22px 0 18px;
}

.qa-letter-quotes p {
  margin: 0;
  min-height: 96px;
  border: 1px solid rgba(255, 255, 255, 0.82);
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.66);
  padding: 18px;
  color: rgba(45, 52, 54, 0.82);
  font-family: var(--serif);
  font-size: clamp(18px, 2vw, 22px);
  line-height: 1.62;
  box-shadow: 0 14px 34px rgba(85, 74, 126, 0.08);
}

.qa-letter-copy {
  position: relative;
}

.qa-letter-body {
  display: grid;
  gap: 16px;
  max-width: 800px;
  color: rgba(45, 52, 54, 0.76);
  transition: max-height 0.32s ease;
}

.qa-letter-section:not(.is-expanded) .qa-letter-body {
  max-height: 260px;
  overflow: hidden;
}

.qa-letter-block strong {
  display: block;
  margin-bottom: 6px;
  color: var(--ink, #2d3436);
  font-family: var(--serif);
  font-size: 19px;
}

.qa-letter-block p {
  margin: 0;
  font-size: 16px;
  line-height: 2;
}

.qa-letter-fade {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  height: 92px;
  background: linear-gradient(transparent, rgba(253, 246, 240, 0.94));
  pointer-events: none;
}

.qa-letter-toggle {
  margin-top: 22px;
  font-weight: 800;
}

@media (max-width: 780px) {
  .qa-letter-quotes {
    grid-template-columns: 1fr;
  }

  .qa-letter-quotes p {
    min-height: auto;
  }

  .qa-letter-section:not(.is-expanded) .qa-letter-body {
    max-height: 340px;
  }
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
