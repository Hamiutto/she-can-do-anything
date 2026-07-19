<script setup>
import { onMounted, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { getProfile, updateProfile } from '../api/auth'
import { useAuth } from '../composables/useAuth'

const router = useRouter()
const { state: authState } = useAuth()

const loading = ref(true)
const saving = ref(false)
const toastMsg = ref('')

// Profile form data
const form = ref({
  nickname: '',
  city: '',
  age: null,
  education: '',
  industry: '',
  marriage: '',
  tagline: '',
  lifeStory: '',
  canHelp: '',
  expertise: '',
  referrer: '',
  timeTags: [],
  hobbies: [],
  mbti: '',
})

const hobbyInput = ref('')

const timeTypeOptions = [
  { value: 'survival', emoji: '💪', label: '生存' },
  { value: 'earning', emoji: '💰', label: '赚钱' },
  { value: 'beauty', emoji: '💄', label: '好看' },
  { value: 'fun', emoji: '🎮', label: '好玩' },
  { value: 'flow', emoji: '🎵', label: '心流' },
]

const educationOptions = ['高中', '专科', '本科', '硕士', '博士', '其他']
const marriageOptions = ['未婚', '已婚', '离异', '丧偶']

const mbtiOptions = [
  'INTJ', 'INTP', 'ENTJ', 'ENTP',
  'INFJ', 'INFP', 'ENFJ', 'ENFP',
  'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ',
  'ISTP', 'ISFP', 'ESTP', 'ESFP',
]

onMounted(async () => {
  try {
    const { user } = await getProfile()
    if (user) {
      form.value.nickname = user.nickname || ''
      form.value.city = user.city || ''
      form.value.age = user.age || null
      form.value.education = user.education || ''
      form.value.industry = user.industry || ''
      form.value.marriage = user.marriage || ''
      form.value.tagline = user.tagline || ''
      form.value.lifeStory = user.lifeStory || ''
      form.value.canHelp = user.canHelp || ''
      form.value.expertise = user.expertise || ''
      form.value.referrer = user.referrer || ''
      form.value.timeTags = Array.isArray(user.timeTags) ? [...user.timeTags] : []
      form.value.hobbies = Array.isArray(user.hobbies) ? [...user.hobbies] : []
      form.value.mbti = user.mbti || ''
      authState.user = user
    }
  } catch {
    // Profile not found — keep empty form
  } finally {
    loading.value = false
  }
})

function toggleTimeTag(value) {
  const idx = form.value.timeTags.indexOf(value)
  if (idx === -1) {
    form.value.timeTags.push(value)
  } else {
    form.value.timeTags.splice(idx, 1)
  }
}

function addHobby() {
  const h = hobbyInput.value.trim()
  if (h && !form.value.hobbies.includes(h)) {
    form.value.hobbies.push(h)
  }
  hobbyInput.value = ''
}

function removeHobby(h) {
  form.value.hobbies = form.value.hobbies.filter((x) => x !== h)
}

async function handleSave() {
  saving.value = true
  try {
    const { user } = await updateProfile(form.value)
    authState.user = user
    if (user.nickname) authState.nickname = user.nickname
    showToast('资料已保存')
  } catch (err) {
    const msg = err.response?.data?.error || err.response?.data?.message || '保存失败，请稍后重试'
    showToast(msg)
  } finally {
    saving.value = false
  }
}

function showToast(msg) {
  toastMsg.value = msg
  setTimeout(() => { toastMsg.value = '' }, 2500)
}
</script>

<template>
  <section class="page-section section">
    <div class="page-card profile-card">
      <h2>我的人生样本卡</h2>
      <p class="lead">写下你的人生轨迹，让更多人看见你的真实模样。</p>

      <div v-if="loading" class="loading-state">加载中…</div>

      <form v-else @submit.prevent="handleSave" class="profile-form">
        <!-- Basic Info -->
        <fieldset class="profile-section">
          <legend>基本信息</legend>
          <div class="field-row">
            <label class="field-label">昵称 *</label>
            <input v-model="form.nickname" class="form-input" type="text" placeholder="你的昵称" required maxlength="30" />
          </div>
          <div class="field-grid">
            <div class="field-row">
              <label class="field-label">城市</label>
              <input v-model="form.city" class="form-input" type="text" placeholder="所在城市" />
            </div>
            <div class="field-row">
              <label class="field-label">年龄</label>
              <input v-model.number="form.age" class="form-input" type="number" placeholder="年龄" min="1" max="120" />
            </div>
          </div>
          <div class="field-grid">
            <div class="field-row">
              <label class="field-label">学历</label>
              <select v-model="form.education" class="form-input">
                <option value="">请选择</option>
                <option v-for="e in educationOptions" :key="e" :value="e">{{ e }}</option>
              </select>
            </div>
            <div class="field-row">
              <label class="field-label">行业</label>
              <input v-model="form.industry" class="form-input" type="text" placeholder="所在行业" />
            </div>
          </div>
          <div class="field-row">
            <label class="field-label">婚育</label>
            <select v-model="form.marriage" class="form-input">
              <option value="">请选择</option>
              <option v-for="m in marriageOptions" :key="m" :value="m">{{ m }}</option>
            </select>
          </div>
        </fieldset>

        <!-- Self Introduction -->
        <fieldset class="profile-section">
          <legend>自我介绍</legend>
          <div class="field-row">
            <label class="field-label">一句话介绍</label>
            <input v-model="form.tagline" class="form-input" type="text" placeholder="用一句话描述自己" maxlength="50" />
            <div class="char-count">{{ form.tagline.length }}/50</div>
          </div>
          <div class="field-row">
            <label class="field-label">人生故事</label>
            <textarea v-model="form.lifeStory" class="form-textarea" placeholder="分享你的故事……" maxlength="2000" rows="4"></textarea>
            <div class="char-count">{{ form.lifeStory.length }}/2000</div>
          </div>
        </fieldset>

        <!-- Skills & Help -->
        <fieldset class="profile-section">
          <legend>能力 & 擅长</legend>
          <div class="field-row">
            <label class="field-label">你能在哪方面帮助人</label>
            <textarea v-model="form.canHelp" class="form-textarea" placeholder="你擅长提供帮助的方面……" maxlength="500" rows="2"></textarea>
          </div>
          <div class="field-row">
            <label class="field-label">擅长领域</label>
            <input v-model="form.expertise" class="form-input" type="text" placeholder="你的专业领域" />
          </div>
        </fieldset>

        <!-- Tags & Preferences -->
        <fieldset class="profile-section">
          <legend>标签 & 偏好</legend>

          <div class="field-row">
            <label class="field-label">时间标签</label>
            <div class="time-tag-group">
              <button
                v-for="t in timeTypeOptions"
                :key="t.value"
                type="button"
                :class="['time-tag-btn', { active: form.timeTags.includes(t.value) }]"
                @click="toggleTimeTag(t.value)"
              >
                {{ t.emoji }}{{ t.label }}
              </button>
            </div>
          </div>

          <div class="field-row">
            <label class="field-label">MBTI</label>
            <select v-model="form.mbti" class="form-input">
              <option value="">请选择</option>
              <option v-for="m in mbtiOptions" :key="m" :value="m">{{ m }}</option>
            </select>
          </div>

          <div class="field-row">
            <label class="field-label">爱好</label>
            <div class="hobby-group">
              <div class="hobby-list">
                <span v-for="h in form.hobbies" :key="h" class="hobby-tag">
                  {{ h }}
                  <button type="button" class="hobby-remove" @click="removeHobby(h)">&times;</button>
                </span>
              </div>
              <div class="hobby-input-row">
                <input v-model="hobbyInput" class="form-input" type="text" placeholder="输入爱好后回车添加" @keyup.enter="addHobby" />
              </div>
            </div>
          </div>

          <div class="field-row">
            <label class="field-label">推荐人</label>
            <input v-model="form.referrer" class="form-input" type="text" placeholder="谁推荐了你" />
          </div>
        </fieldset>

        <button class="primary-button save-btn" type="submit" :disabled="saving">
          {{ saving ? '保存中…' : '保存' }}
        </button>
      </form>
    </div>

    <!-- Toast -->
    <Transition name="toast-fade">
      <div v-if="toastMsg" class="toast">{{ toastMsg }}</div>
    </Transition>
  </section>
</template>

<style scoped>
.profile-card {
  max-width: 720px;
  margin: 0 auto;
}

.profile-form {
  margin-top: 24px;
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.profile-section {
  border: 1px solid var(--line);
  border-radius: 16px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.5);
}

.profile-section legend {
  font-family: var(--serif);
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--lavender);
  padding: 0 8px;
}

.field-row {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 14px;
}

.field-row:last-child {
  margin-bottom: 0;
}

.field-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 14px;
}

.field-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--ink);
}

.form-textarea {
  padding: 10px 14px;
  border: 1px solid var(--line);
  border-radius: 10px;
  font-size: 0.95rem;
  font-family: inherit;
  background: rgba(255, 255, 255, 0.82);
  color: var(--ink);
  outline: none;
  resize: vertical;
  min-height: 60px;
  transition: border-color 0.2s;
}

.form-textarea:focus {
  border-color: var(--lavender);
  box-shadow: 0 0 0 4px rgba(108, 92, 231, 0.08);
}

.char-count {
  text-align: right;
  font-size: 0.75rem;
  color: #999;
}

/* Time tags */
.time-tag-group {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.time-tag-btn {
  padding: 6px 14px;
  border: 1px solid var(--line);
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.82);
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.2s;
  color: var(--ink);
}

.time-tag-btn:hover {
  border-color: var(--lavender);
}

.time-tag-btn.active {
  background: var(--lavender);
  color: #fff;
  border-color: var(--lavender);
}

/* Hobbies */
.hobby-list {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 8px;
}

.hobby-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 14px;
  background: rgba(108, 92, 231, 0.1);
  color: var(--lavender);
  font-size: 0.85rem;
  font-weight: 600;
}

.hobby-remove {
  background: none;
  border: none;
  color: var(--lavender);
  cursor: pointer;
  font-size: 1rem;
  padding: 0 2px;
  line-height: 1;
  opacity: 0.6;
}

.hobby-remove:hover {
  opacity: 1;
}

.hobby-input-row {
  display: flex;
}

.loading-state {
  text-align: center;
  padding: 40px;
  color: rgba(45, 52, 54, 0.5);
  font-size: 1rem;
}

.save-btn {
  align-self: center;
  min-width: 160px;
}

.save-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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

.toast-fade-enter-active,
.toast-fade-leave-active {
  transition: opacity 0.3s, transform 0.3s;
}

.toast-fade-enter-from,
.toast-fade-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(8px);
}

@media (max-width: 640px) {
  .field-grid {
    grid-template-columns: 1fr;
  }
}
</style>
