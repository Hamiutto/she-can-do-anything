<script setup>
defineProps({
  open: Boolean
})
</script>

<template>
  <div class="notification-panel" :class="{ 'is-open': open }">
    <div class="notice-item">
      <strong>你的提问有新动态</strong>
      <p>一位真实的她回复了关于转行节奏的问题。</p>
      <small>刚刚</small>
    </div>
    <div class="notice-item">
      <strong>感谢信已送达</strong>
      <p>你写下的感谢被收入公开信墙。</p>
      <small>今天 10:26</small>
    </div>
    <div class="notice-item">
      <strong>五种时间测试即将开放</strong>
      <p>后续会根据你的选择推荐更贴近的人生样本。</p>
      <small>明天</small>
    </div>
  </div>
</template>
