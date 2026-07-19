<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import NotificationDropdown from './NotificationDropdown.vue'

const emit = defineEmits(['toast'])
const route = useRoute()
const router = useRouter()
const isNoticeOpen = ref(false)
const unreadNotificationCount = ref(0)

const activeKey = computed(() => {
  if (route.path === '/five-times') return 'five-times'
  if (route.path === '/life-templates') return 'life-templates'
  if (route.path === '/qa-square') return 'qa-square'
  return 'sheis'
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
</script>

<template>
  <header class="topbar">
    <button class="brand" type="button" @click="goHome">SHE IS <span>____</span></button>
    <nav class="main-nav" aria-label="主导航">
      <button class="nav-link" :class="{ 'is-active': activeKey === 'sheis' }" type="button" @click="goSheIs">She is</button>
      <RouterLink class="nav-link" :class="{ 'is-active': activeKey === 'five-times' }" to="/five-times">五种时间</RouterLink>
      <RouterLink class="nav-link" :class="{ 'is-active': activeKey === 'life-templates' }" to="/life-templates">人生模板</RouterLink>
      <RouterLink class="nav-link" :class="{ 'is-active': activeKey === 'qa-square' }" to="/qa-square">问答广场</RouterLink>
    </nav>
    <div class="nav-actions">
      <button class="icon-button" type="button" aria-label="消息提醒" @click="isNoticeOpen = !isNoticeOpen">
        ♡
        <span v-if="unreadNotificationCount > 0" class="badge-dot">{{ unreadNotificationCount }}</span>
      </button>
      <button class="pill-button" type="button" @click="emit('toast', '这里会进入登录流程，Vue 版先用提示模拟。')">登录</button>
      <NotificationDropdown
        :open="isNoticeOpen"
        user-name="匿名用户"
        @unread-change="unreadNotificationCount = $event"
      />
    </div>
  </header>
</template>
