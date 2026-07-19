<script setup>
import { onMounted, ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getPublicProfile } from '../api/auth'

const route = useRoute()
const router = useRouter()

const user = ref(null)
const loading = ref(true)
const notFound = ref(false)

const timeTypeConfig = {
  survival: { emoji: '💪', label: '生存' },
  earning: { emoji: '💰', label: '赚钱' },
  beauty: { emoji: '💄', label: '好看' },
  fun: { emoji: '🎮', label: '好玩' },
  flow: { emoji: '🎵', label: '心流' },
}

const userInitial = computed(() => {
  const name = user.value?.nickname || '?'
  return name.charAt(0).toUpperCase()
})

onMounted(async () => {
  try {
    const { user: u } = await getPublicProfile(route.params.userId)
    user.value = u
  } catch {
    notFound.value = true
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <section class="page-section section">
    <div v-if="loading" class="page-card" style="text-align:center;padding:60px;">
      加载中…
    </div>

    <div v-else-if="notFound" class="page-card" style="text-align:center;padding:60px;">
      <p>用户不存在</p>
      <button class="soft-button" @click="router.push('/')">返回首页</button>
    </div>

    <div v-else class="page-card public-profile-card">
      <!-- Header -->
      <div class="profile-header">
        <div class="profile-avatar">{{ userInitial }}</div>
        <div class="profile-info">
          <h2 class="profile-name">{{ user.nickname || '匿名用户' }}</h2>
          <div class="profile-meta">
            <span v-if="user.city">{{ user.city }}</span>
            <span v-if="user.age">{{ user.age }}岁</span>
            <span v-if="user.education">{{ user.education }}</span>
          </div>
          <div class="profile-meta">
            <span v-if="user.industry">{{ user.industry }}</span>
            <span v-if="user.marriage">{{ user.marriage }}</span>
          </div>
        </div>
      </div>

      <!-- Tagline -->
      <p v-if="user.tagline" class="profile-tagline">"{{ user.tagline }}"</p>

      <!-- Life Story -->
      <div v-if="user.lifeStory" class="profile-section-block">
        <h3>人生故事</h3>
        <p class="profile-story">{{ user.lifeStory }}</p>
      </div>

      <!-- Skills -->
      <div v-if="user.canHelp || user.expertise" class="profile-section-block">
        <h3>能力 & 擅长</h3>
        <p v-if="user.canHelp"><strong>能提供帮助：</strong>{{ user.canHelp }}</p>
        <p v-if="user.expertise"><strong>擅长领域：</strong>{{ user.expertise }}</p>
      </div>

      <!-- Tags -->
      <div class="profile-section-block">
        <div v-if="user.timeLabels && user.timeLabels.length" class="profile-tags">
          <span v-for="t in user.timeLabels" :key="t" class="time-badge">
            {{ timeTypeConfig[t]?.emoji }}{{ timeTypeConfig[t]?.label }}
          </span>
        </div>
        <div v-if="user.hobbies && user.hobbies.length" class="profile-hobbies">
          <strong>爱好：</strong>{{ user.hobbies.join('、') }}
        </div>
        <div v-if="user.mbti" class="profile-mbti">
          <strong>MBTI：</strong>{{ user.mbti }}
        </div>
      </div>

      <!-- Referrer -->
      <div v-if="user.referrer" class="profile-section-block">
        <strong>推荐人：</strong>{{ user.referrer }}
      </div>

      <button class="soft-button back-btn" @click="router.back()">
        ← 返回
      </button>
    </div>
  </section>
</template>

<style scoped>
.public-profile-card {
  max-width: 640px;
  margin: 0 auto;
}

.profile-header {
  display: flex;
  gap: 20px;
  align-items: center;
  margin-bottom: 20px;
}

.profile-avatar {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: linear-gradient(145deg, rgba(108, 92, 231, 0.18), rgba(253, 121, 168, 0.20));
  color: var(--lavender);
  font-family: var(--serif);
  font-size: 28px;
  font-weight: 700;
  display: grid;
  place-items: center;
  flex-shrink: 0;
  box-shadow: 0 10px 26px rgba(108, 92, 231, 0.14);
}

.profile-name {
  font-family: var(--serif);
  font-size: 1.5rem;
  margin: 0 0 6px;
  color: var(--ink);
}

.profile-meta {
  display: flex;
  gap: 8px;
  font-size: 0.85rem;
  color: rgba(45, 52, 54, 0.55);
}

.profile-meta span + span::before {
  content: '·';
  margin-right: 8px;
}

.profile-tagline {
  font-family: var(--serif);
  font-size: 1.1rem;
  color: rgba(45, 52, 54, 0.65);
  font-style: italic;
  margin: 0 0 24px;
  padding: 12px 0;
  border-top: 1px solid var(--line);
  border-bottom: 1px solid var(--line);
}

.profile-section-block {
  margin-bottom: 20px;
}

.profile-section-block h3 {
  font-family: var(--serif);
  font-size: 1.1rem;
  color: var(--lavender);
  margin: 0 0 10px;
}

.profile-story {
  color: rgba(45, 52, 54, 0.74);
  line-height: 2;
  font-size: 0.95rem;
  white-space: pre-wrap;
}

.profile-section-block p {
  margin: 6px 0;
  color: rgba(45, 52, 54, 0.7);
  line-height: 1.7;
}

.profile-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 10px;
}

.time-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 12px;
  border-radius: 14px;
  background: rgba(108, 92, 231, 0.1);
  color: var(--lavender);
  font-size: 0.85rem;
  font-weight: 600;
}

.profile-hobbies,
.profile-mbti {
  font-size: 0.9rem;
  color: rgba(45, 52, 54, 0.7);
  margin-top: 8px;
}

.back-btn {
  margin-top: 16px;
}
</style>
