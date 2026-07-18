<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { bubbleSlots, tagPool } from '../data/tags'

const props = defineProps({
  keyword: {
    type: String,
    default: ''
  },
  selectedTags: {
    type: Array,
    default: () => []
  }
})
const emit = defineEmits(['select'])

const activeStart = ref(0)
const fading = ref(false)
let timer = 0

const activeTags = computed(() => (
  bubbleSlots.map((slot, index) => ({
    ...tagPool[(activeStart.value + index) % tagPool.length],
    ...slot
  }))
))

function cycle() {
  fading.value = true
  window.setTimeout(() => {
    activeStart.value = (activeStart.value + 4) % tagPool.length
    fading.value = false
  }, 520)
}

onMounted(() => {
  timer = window.setInterval(cycle, 4200)
})

onBeforeUnmount(() => {
  window.clearInterval(timer)
})
</script>

<template>
  <div class="bubble-field">
    <button
      v-for="(tag, index) in activeTags"
      :key="`${tag.label}-${index}`"
      class="tag-bubble"
      :class="{
        'is-fading': fading && index < 4,
        'is-match': keyword && tag.label.toLowerCase().includes(keyword.toLowerCase()),
        'is-selected': selectedTags.includes(tag.label)
      }"
      type="button"
      :data-category="tag.category"
      :style="{ left: `${tag.x}%`, top: `${tag.y}%` }"
      @click="emit('select', tag.label)"
    >
      {{ tag.label }}
    </button>
  </div>
</template>
