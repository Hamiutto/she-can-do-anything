<script setup>
import { computed, ref } from 'vue'
import { categoryStyle, tagPool } from '../data/tags'

const props = defineProps({
  person: {
    type: Object,
    required: true
  }
})
const emit = defineEmits(['open', 'toast'])
const saved = ref(false)

const displayTags = computed(() => [...props.person.timeLabels || props.person.tags, ...props.person.hobbyTags].slice(0, 5))

function miniTagStyle(label) {
  const category = tagPool.find((tag) => tag.label === label)?.category
  return categoryStyle[category] || '--tag-color: var(--lavender)'
}

function toggleSave() {
  saved.value = !saved.value
  emit('toast', saved.value ? '已收藏，之后可以继续关注她。' : '已取消收藏。')
}
</script>

<template>
  <article class="person-card">
    <button class="save-button" :class="{ 'is-saved': saved }" type="button" :aria-label="`收藏 ${person.name}`" @click.stop="toggleSave">
      {{ saved ? '★' : '♡' }}
    </button>
    <div class="person-head">
      <div class="avatar">{{ person.avatar }}</div>
      <div>
        <h3>{{ person.name }}</h3>
        <div class="meta">{{ person.role }} · {{ person.city }} · {{ person.age }}岁 · {{ person.industry }} · {{ person.mbti }} · {{ person.zodiac }}</div>
      </div>
    </div>
    <div class="tagline">“{{ person.tagline }}”</div>
    <div class="mini-tags">
      <span v-for="tag in displayTags" :key="tag" class="mini-tag" :style="miniTagStyle(tag)">{{ tag }}</span>
    </div>
    <div class="card-stats">
      <span>帮过 {{ person.helpedCount }} 人</span>
      <span>收到 {{ person.thanksCount }} 封感谢信</span>
      <span>完整度 {{ person.completeness }}%</span>
    </div>
    <button class="card-link" type="button" @click="emit('open', person)">查看她的故事 →</button>
  </article>
</template>
