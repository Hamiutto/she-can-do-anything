<script setup>
import { computed, ref, watch } from 'vue'
import { getNotifications, markNotificationRead } from '../api/index.js'

const props = defineProps({
  open: Boolean,
  userName: {
    type: String,
    default: '匿名用户'
  }
})

const emit = defineEmits(['unread-change'])

const notifications = ref([])
const isLoading = ref(false)
const errorMsg = ref('')

const unreadCount = computed(() => notifications.value.filter((item) => !item.is_read).length)

watch(
  unreadCount,
  (count) => {
    emit('unread-change', count)
  },
  { immediate: true }
)

watch(
  () => [props.open, props.userName],
  async ([open, userName]) => {
    if (!open) return

    isLoading.value = true
    errorMsg.value = ''

    try {
      notifications.value = await getNotifications(userName)
    } catch (err) {
      notifications.value = []
      errorMsg.value = err.response?.data?.error || err.response?.data?.message || '通知加载失败'
    } finally {
      isLoading.value = false
    }
  },
  { immediate: true }
)

async function openNotification(item) {
  if (!item || item.is_read) return

  try {
    await markNotificationRead(item.id)
    item.is_read = 1
  } catch (err) {
    errorMsg.value = err.response?.data?.error || err.response?.data?.message || '标记已读失败'
  }
}
</script>

<template>
  <div class="notification-panel" :class="{ 'is-open': open }">
    <div v-if="isLoading" class="notice-item notice-item--state">
      <strong>正在加载通知</strong>
      <p>请稍等一下。</p>
    </div>

    <div v-else-if="errorMsg" class="notice-item notice-item--state">
      <strong>通知读取失败</strong>
      <p>{{ errorMsg }}</p>
    </div>

    <template v-else-if="notifications.length">
      <button
        v-for="item in notifications"
        :key="item.id"
        type="button"
        class="notice-item notice-item--button"
        :class="{ 'is-read': item.is_read }"
        @click="openNotification(item)"
      >
        <strong>{{ item.title }}</strong>
        <p>{{ item.message }}</p>
        <small>{{ item.created_at }}</small>
      </button>
    </template>

    <div v-else class="notice-item notice-item--state">
      <strong>暂无通知</strong>
      <p>新回复、感谢和提醒会出现在这里。</p>
    </div>
  </div>
</template>

<style scoped>
.notice-item--button {
  width: 100%;
  text-align: left;
  appearance: none;
  border: 1px solid transparent;
}

.notice-item--button:hover {
  border-color: rgba(108, 92, 231, .18);
}

.notice-item--button.is-read {
  opacity: .72;
}

.notice-item--state {
  cursor: default;
}
</style>
