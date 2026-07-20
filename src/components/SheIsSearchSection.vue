<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import DynamicTagCloud from './DynamicTagCloud.vue'
import TimeEntryChips from './TimeEntryChips.vue'

const emit = defineEmits(['tags-change'])
const router = useRouter()
const keyword = ref('')
const selectedTags = ref([])
const typingWords = ['正在重启的', '自由探索的', '认真赚钱的', '跳舞发光的', '进入心流的']
const typingIndex = ref(0)
let typingTimer = 0

onMounted(() => {
  typingTimer = window.setInterval(() => {
    typingIndex.value = (typingIndex.value + 1) % typingWords.length
  }, 1800)
})

onBeforeUnmount(() => {
  window.clearInterval(typingTimer)
})

function goFiveTimes() {
  router.push('/five-times')
}

function goByTag(tag) {
  if (selectedTags.value.includes(tag)) {
    selectedTags.value = selectedTags.value.filter((item) => item !== tag)
  } else {
    selectedTags.value = [...selectedTags.value, tag]
  }
  emit('tags-change', selectedTags.value)
}

function removeTag(tag) {
  selectedTags.value = selectedTags.value.filter((item) => item !== tag)
  emit('tags-change', selectedTags.value)
}

function search() {
  const value = keyword.value.trim()
  if (value) {
    router.push({ path: '/life-templates', query: { keyword: value } })
    return
  }
  if (selectedTags.value.length) {
    router.push({ path: '/life-templates', query: { tags: selectedTags.value.join(',') } })
  }
}
</script>

<template>
  <section class="hero" id="sheis">
    <div class="hero-copy">
      <span class="eyebrow">SHE CAN ____</span>
      <h2>问问那个<br><span class="typing-word">{{ typingWords[typingIndex] }}</span> 她</h2>
      <p class="lead">选择你感兴趣的关键词:<br>例：职业、城市、爱好、困惑，都可能牵出一段真实经验，找到解答。</p>
      <TimeEntryChips @select="goFiveTimes" />
    </div>
    <div class="search-stage">
      <div class="search-card">
        <h2>你在找什么样的她？</h2>
        <div class="search-box">
          <input v-model="keyword" type="search" placeholder="点击或输入标签，如：跳舞、ENFP、转行、成都" @keydown.enter="search">
          <button class="search-icon" type="button" aria-label="搜索" @click="search">⌕</button>
        </div>
        <div class="or-line">或者点一个正在漂浮的标签</div>
        <DynamicTagCloud :keyword="keyword" :selected-tags="selectedTags" @select="goByTag" />
        <div class="selected-panel">
          <p class="selected-label">点击标签：</p>
          <div class="selected-tags">
            <span v-if="!selectedTags.length" class="meta">还没有标签被选中，先点击你好奇的关键词。</span>
            <button
              v-for="tag in selectedTags"
              v-else
              :key="tag"
              class="selected-chip"
              type="button"
              @click="removeTag(tag)"
            >
              {{ tag }} ×
            </button>
          </div>
        </div>
        <div class="search-actions">
          <button class="primary-button" type="button" @click="search">探索多样活法</button>
        </div>
      </div>
    </div>
  </section>
</template>
