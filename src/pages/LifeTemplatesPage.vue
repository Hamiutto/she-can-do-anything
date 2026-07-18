<script setup>
import { computed, nextTick, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import PersonDetail from '../components/PersonDetail.vue'
import PersonGrid from '../components/PersonGrid.vue'
import { people } from '../data/people'
import { matchesKeyword, matchesTag, sortPeople } from '../utils/peopleFilters'

const emit = defineEmits(['toast', 'ask-person'])
const route = useRoute()
const selectedPerson = ref(null)
const sortMode = ref('match')

const tag = computed(() => String(route.query.tag || '').trim())
const tags = computed(() => String(route.query.tags || '').split(',').map((item) => item.trim()).filter(Boolean))
const keyword = computed(() => String(route.query.keyword || '').trim())
const queryLabel = computed(() => {
  if (tags.value.length) return `当前搜索：${tags.value.join('、')}`
  if (tag.value) return `当前搜索：${tag.value}`
  if (keyword.value) return `当前搜索：${keyword.value}`
  return ''
})

const filteredPeople = computed(() => {
  let list = people
  if (tags.value.length) list = list.filter((person) => tags.value.some((item) => matchesTag(person, item)))
  if (tag.value) list = list.filter((person) => matchesTag(person, tag.value))
  if (keyword.value) list = list.filter((person) => matchesKeyword(person, keyword.value))
  if (tags.value.length && sortMode.value === 'match') {
    return list
      .map((person) => ({
        ...person,
        score: tags.value.filter((item) => matchesTag(person, item)).length
      }))
      .sort((a, b) => b.score - a.score || b.completeness - a.completeness)
      .slice(0, 6)
  }
  return sortPeople(list, sortMode.value, tag.value || keyword.value || tags.value[0] || '').slice(0, 6)
})

async function openPerson(person) {
  selectedPerson.value = person
  await nextTick()
  document.querySelector('.detail-view')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

watch(() => route.fullPath, () => {
  selectedPerson.value = null
})
</script>

<template>
  <section class="page-section section is-active">
    <div class="page-card">
      <div class="section-title">
        <div>
          <h2>人生模板</h2>
          <p>从真实人物样本中，看见不同人生路径。</p>
        </div>
        <div class="filters">
          <select v-model="sortMode" aria-label="排序方式">
            <option value="match">按匹配度</option>
            <option value="complete">按资料完整度</option>
            <option value="helped">按帮助人数</option>
          </select>
        </div>
      </div>
      <div class="query-banner" :class="{ 'is-visible': queryLabel }">{{ queryLabel }}</div>
      <PersonGrid :people="filteredPeople" @open="openPerson" @toast="emit('toast', $event)" />
      <div class="empty-state" :class="{ 'is-visible': !filteredPeople.length }">暂时没有匹配样本，先看看其他真实的她。</div>
    </div>
  </section>
  <PersonDetail
    :person="selectedPerson"
    @back="selectedPerson = null"
    @ask="emit('ask-person', $event)"
  />
</template>
