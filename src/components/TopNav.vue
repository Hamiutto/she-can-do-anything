<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import NotificationDropdown from './NotificationDropdown.vue'
import { useAuth } from '../composables/useAuth'

const emit = defineEmits(['toast'])
const route = useRoute()
const router = useRouter()
const { state: authState, logout } = useAuth()
const isNoticeOpen = ref(false)
const isUserMenuOpen = ref(false)
const unreadNotificationCount = ref(0)

const activeKey = computed(() => {
  if (route.path === '/five-times') return 'five-times'
  if (route.path === '/life-templates') return 'life-templates'
  if (route.path === '/qa-square' || route.path === '/thanks') return 'qa-square'
  if (route.path === '/team') return 'team'
  return 'sheis'
})

const userInitial = computed(() => {
  const name = authState.user?.nickname || '?'
  return name.charAt(0).toUpperCase()
})

async function goSheIs() {
  if (route.path !== '/') {
    await router.push({ path: '/', hash: '#sheis' })
    return
  }
  document.getElementById('sheis')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function goHome() {
  router.push('/')
}

async function handleLogout() {
  await logout()
  isUserMenuOpen.value = false
  emit('toast', '已退出登录')
  router.push('/')
}
</script>

<template>
  <header class="topbar">
    <button class="brand" type="button" @click="goHome">她行SHE CAN<span>____</span></button>
    <nav class="main-nav" aria-label="主导航">
      <button class="nav-link" :class="{ 'is-active': activeKey === 'sheis' }" type="button" @click="goSheIs">She can</button>
      <RouterLink class="nav-link" :class="{ 'is-active': activeKey === 'five-times' }" to="/five-times">五种时间</RouterLink>
      <RouterLink class="nav-link" :class="{ 'is-active': activeKey === 'life-templates' }" to="/life-templates">人生样本</RouterLink>
      <RouterLink class="nav-link" :class="{ 'is-active': activeKey === 'qa-square' }" to="/qa-square">问问她</RouterLink>
      <RouterLink class="nav-link" :class="{ 'is-active': activeKey === 'team' }" to="/team">团队思考</RouterLink>
    </nav>
    <div class="nav-actions">
      <button class="icon-button notice-button" type="button" aria-label="消息提醒" @click="isNoticeOpen = !isNoticeOpen">
        <span class="notice-icon">♡</span>
        <span class="notice-text">消息提醒</span>
        <span v-if="unreadNotificationCount > 0" class="badge-dot">{{ unreadNotificationCount }}</span>
      </button>

      <!-- Not logged in -->
      <button v-if="!authState.isLoggedIn" class="pill-button" type="button" @click="router.push('/login')">
        登录
      </button>

      <!-- Logged in: user menu -->
      <div v-else class="user-menu-wrap">
        <button class="user-menu-trigger" type="button" @click="isUserMenuOpen = !isUserMenuOpen">
          <span class="user-menu-avatar">{{ userInitial }}</span>
          <span class="user-menu-name">{{ authState.user?.nickname || '用户' }}</span>
        </button>
        <div v-if="isUserMenuOpen" class="user-menu-dropdown">
          <button class="user-menu-item" type="button" @click="router.push('/profile'); isUserMenuOpen = false">
            我的资料
          </button>
          <button class="user-menu-item user-menu-logout" type="button" @click="handleLogout">
            退出登录
          </button>
        </div>
      </div>

      <NotificationDropdown
        :open="isNoticeOpen"
        :user-name="authState.user?.nickname || '匿名用户'"
        @unread-change="unreadNotificationCount = $event"
      />
    </div>
  </header>
</template>

<style scoped>
.user-menu-wrap {
  position: relative;
}

.user-menu-trigger {
  display: flex;
  align-items: center;
  gap: 8px;
  border: 1px solid var(--line);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.72);
  padding: 4px 14px 4px 4px;
  cursor: pointer;
  transition: box-shadow 0.2s;
}

.user-menu-trigger:hover {
  box-shadow: 0 8px 20px rgba(85, 74, 126, 0.1);
}

.user-menu-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(145deg, rgba(108, 92, 231, 0.18), rgba(253, 121, 168, 0.20));
  color: var(--lavender);
  font-family: var(--serif);
  font-size: 14px;
  font-weight: 700;
  display: grid;
  place-items: center;
}

.user-menu-name {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--ink);
}

.user-menu-dropdown {
  position: absolute;
  right: 0;
  top: calc(100% + 8px);
  width: 140px;
  background: rgba(255, 255, 255, 0.96);
  border: 1px solid var(--line);
  border-radius: 14px;
  box-shadow: var(--deep-shadow);
  overflow: hidden;
  z-index: 100;
}

.user-menu-item {
  display: block;
  width: 100%;
  padding: 12px 16px;
  background: none;
  border: none;
  text-align: left;
  font-size: 0.9rem;
  color: var(--ink);
  cursor: pointer;
  transition: background 0.15s;
}

.user-menu-item:hover {
  background: rgba(108, 92, 231, 0.06);
}

.user-menu-logout {
  border-top: 1px solid var(--line);
  color: var(--coral);
}
</style>
