<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import LandingHero from '../components/LandingHero.vue'
import PersonDetail from '../components/PersonDetail.vue'
import PersonGrid from '../components/PersonGrid.vue'
import SheIsSearchSection from '../components/SheIsSearchSection.vue'
import { people } from '../data/people'
import { matchesTag, sortPeople } from '../utils/peopleFilters'

const emit = defineEmits(['toast', 'ask-person'])
const route = useRoute()
const sortMode = ref('match')
const rotationStart = ref(0)
const selectedPerson = ref(null)
const selectedTags = ref([])
const swapping = ref(false)
let rotationTimer = 0

const visiblePeople = computed(() => {
  if (selectedTags.value.length) {
    const filtered = people
      .filter((person) => selectedTags.value.some((tag) => matchesTag(person, tag)))
      .map((person) => ({
        ...person,
        score: selectedTags.value.filter((tag) => matchesTag(person, tag)).length
      }))
      .sort((a, b) => b.score - a.score || b.completeness - a.completeness)
    return sortPeople(filtered, sortMode.value, selectedTags.value[0]).slice(0, 6)
  }
  const rotated = Array.from({ length: 6 }, (_, index) => people[(rotationStart.value + index) % people.length])
  return sortMode.value === 'match' ? rotated : sortPeople(rotated, sortMode.value)
})

function rotatePeople() {
  if (selectedTags.value.length) return
  swapping.value = true
  window.setTimeout(() => {
    rotationStart.value = (rotationStart.value + 2) % people.length
    swapping.value = false
  }, 420)
}

function clearFilters() {
  sortMode.value = 'match'
  selectedPerson.value = null
  selectedTags.value = []
  emit('toast', '筛选已清空，继续看动态样本。')
}

async function openPerson(person) {
  selectedPerson.value = person
  await nextTick()
  document.querySelector('.detail-view')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function scrollIfNeeded() {
  if (route.hash === '#sheis') {
    window.setTimeout(() => {
      document.getElementById('sheis')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 80)
  }
}

onMounted(() => {
  rotationTimer = window.setInterval(rotatePeople, 5200)
  scrollIfNeeded()
})

onBeforeUnmount(() => {
  window.clearInterval(rotationTimer)
})

watch(() => route.hash, scrollIfNeeded)
</script>

<template>
  <LandingHero />
  <SheIsSearchSection @tags-change="selectedTags = $event" />
  <section class="section" id="results">
    <div class="section-title">
      <div>
        <h2>找到现实中的她</h2>
        <p>{{ selectedTags.length ? `当前筛选：${selectedTags.join('、')}。命中任一标签即可展示，命中越多越靠前。` : '默认动态展示人物样本，每次最多 6 张。选择标签后，这里会自动刷新为匹配人物。' }}</p>
      </div>
      <div class="filters">
        <select v-model="sortMode" aria-label="排序方式">
          <option value="match">按匹配度</option>
          <option value="complete">按资料完整度</option>
          <option value="helped">按帮助人数</option>
        </select>
        <button class="soft-button" type="button" @click="clearFilters">清空筛选</button>
      </div>
    </div>
    <div :class="{ 'people-swapping': swapping }">
      <PersonGrid :people="visiblePeople" @open="openPerson" @toast="emit('toast', $event)" />
    </div>
  </section>
  <PersonDetail
    :person="selectedPerson"
    @back="selectedPerson = null"
    @ask="emit('ask-person', $event)"
  />
</template>
