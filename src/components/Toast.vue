<script setup>
import { watch } from 'vue'

const props = defineProps({
  message: String
})
const emit = defineEmits(['hidden'])

watch(
  () => props.message,
  (message) => {
    if (!message) return
    window.clearTimeout(watch.timer)
    watch.timer = window.setTimeout(() => emit('hidden'), 2200)
  }
)
</script>

<template>
  <div class="toast" :class="{ 'is-visible': message }">{{ message }}</div>
</template>
