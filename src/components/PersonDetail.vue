<script setup>
import { ref } from 'vue'
import { categoryStyle, tagPool } from '../data/tags'

defineProps({
  person: Object
})
const emit = defineEmits(['back', 'ask'])
const isThanksOpen = ref(false)

function miniTagStyle(label) {
  const category = tagPool.find((tag) => tag.label === label)?.category
  return categoryStyle[category] || '--tag-color: var(--lavender)'
}
</script>

<template>
  <section v-if="person" class="detail-view is-open" aria-live="polite">
    <div class="detail-paper">
      <button class="back-button" type="button" @click="emit('back')">← 返回人物列表</button>
      <div class="detail-hero">
        <div class="detail-avatar">{{ person.avatar }}</div>
        <h2>{{ person.name }}</h2>
        <div class="meta">{{ person.role }} · {{ person.city }} · {{ person.age }}岁 · {{ person.industry }} · {{ person.mbti }} · {{ person.zodiac }}</div>
        <p class="tagline">“{{ person.tagline }}”</p>
        <div class="mini-tags detail-tags">
          <span v-for="tag in [...person.tags, ...person.hobbyTags]" :key="tag" class="mini-tag" :style="miniTagStyle(tag)">{{ tag }}</span>
        </div>
      </div>
      <section class="story-section">
        <h3>我的故事</h3>
        <p>{{ person.story }}</p>
      </section>
      <section class="story-section">
        <h3>我能帮你</h3>
        <div class="mini-tags">
          <span v-for="tag in person.canHelp" :key="tag" class="mini-tag" style="--tag-color: var(--orange)">{{ tag }}</span>
        </div>
      </section>
      <section class="story-section">
        <h3>帮助记录</h3>
        <div class="thanks-box">
          <strong>帮过 {{ person.helpedCount }} 人 · 收到 {{ person.thanksCount }} 封感谢信</strong>
          <button class="soft-button thanks-toggle" type="button" @click="isThanksOpen = !isThanksOpen">展开感谢信</button>
          <div class="thanks-list" :class="{ 'is-open': isThanksOpen }">
            <p>“谢谢你把经验说得这么具体，我突然觉得自己不是一个人在摸索。”</p>
            <p>“这条回答让我把下一步写下来了，也敢开始和身边的人沟通。”</p>
          </div>
        </div>
      </section>
      <div class="ask-button-wrap">
        <button class="ask-button" type="button" @click="emit('ask', person)">向她提问</button>
      </div>
    </div>
  </section>
</template>
