<script setup>
import { computed, nextTick, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import PersonDetail from '../components/PersonDetail.vue'
import PersonGrid from '../components/PersonGrid.vue'
import { people } from '../data/people'
import { matchesSearchQuery, parseSearchQuery, sortPeople } from '../utils/peopleFilters'

const emit = defineEmits(['toast', 'ask-person'])
const route = useRoute()
const selectedPerson = ref(null)
const sortMode = ref('match')
const currentPage = ref(1)
const pageSize = 9

const initialSearch = (() => {
  const keyword = String(route.query.keyword || '').trim()
  if (keyword) return keyword

  const tag = String(route.query.tag || '').trim()
  if (tag) return tag

  return String(route.query.tags || '').trim()
})()

const searchDraft = ref(initialSearch)
const searchQuery = ref(initialSearch)
const searchTokens = computed(() => parseSearchQuery(searchQuery.value))

const filteredPeople = computed(() => {
  let list = people

  if (searchTokens.value.length) {
    list = list.filter((person) => matchesSearchQuery(person, searchTokens.value))
  }

  return sortPeople(list, sortMode.value, searchTokens.value)
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredPeople.value.length / pageSize)))
const safePage = computed(() => Math.min(currentPage.value, totalPages.value))

const paginatedPeople = computed(() => {
  const start = (safePage.value - 1) * pageSize
  return filteredPeople.value.slice(start, start + pageSize)
})

const summaryText = computed(() => {
  const count = filteredPeople.value.length
  if (searchTokens.value.length) {
    return `找到 ${count} 位样本，第 ${safePage.value} / ${totalPages.value} 页`
  }
  return `当前展示全部 ${count} 位样本，第 ${safePage.value} / ${totalPages.value} 页`
})

function applySearch() {
  searchQuery.value = searchDraft.value.trim()
  currentPage.value = 1
}

function clearSearch() {
  searchDraft.value = ''
  searchQuery.value = ''
  currentPage.value = 1
}

async function openPerson(person) {
  selectedPerson.value = person
  await nextTick()
  document.querySelector('.detail-view')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function goPage(page) {
  currentPage.value = Math.max(1, Math.min(page, totalPages.value))
}

watch([searchQuery, sortMode], () => {
  currentPage.value = 1
  selectedPerson.value = null
})

watch(currentPage, () => {
  selectedPerson.value = null
})

watch(filteredPeople, () => {
  if (currentPage.value > totalPages.value) {
    currentPage.value = totalPages.value
  }
})
</script>

<template>
  <section class="page-section section is-active">
    <div class="page-card template-page-card">
      <div class="section-title template-title">
        <div>
          <h2>人生模板</h2>
          <p>从真实人物样本中，看见不同人生路径。</p>
        </div>
      </div>

      <div class="template-toolbar">
        <form class="template-search" @submit.prevent="applySearch">
          <div class="template-search-field">
            <input
              v-model="searchDraft"
              type="search"
              placeholder="搜索昵称、城市、行业、MBTI、标签、故事..."
              aria-label="搜索人生模板"
            >
            <button
              v-if="searchDraft || searchQuery"
              class="template-search-clear"
              type="button"
              aria-label="清空搜索"
              @click="clearSearch"
            >
              ×
            </button>
          </div>

          <button class="template-search-submit" type="submit">搜索</button>
        </form>

        <div class="template-toolbar-actions">
          <label class="template-sort">
            <span>排序</span>
            <div class="template-sort-select">
              <select v-model="sortMode" aria-label="排序方式">
                <option value="match">按匹配度</option>
                <option value="complete">按资料完整度</option>
                <option value="helped">按帮助人数</option>
              </select>
            </div>
          </label>
          <div class="template-summary">{{ summaryText }}</div>
        </div>
      </div>

      <PersonGrid :people="paginatedPeople" @open="openPerson" @toast="emit('toast', $event)" />

      <div v-if="!filteredPeople.length" class="empty-state is-visible">
        暂时没有匹配样本，换个关键词试试。
      </div>

      <div v-else-if="totalPages > 1" class="pagination">
        <button class="pagination-step" type="button" :disabled="safePage === 1" @click="goPage(safePage - 1)">
          ‹
        </button>
        <button
          v-for="page in totalPages"
          :key="page"
          class="pagination-button"
          :class="{ 'is-active': safePage === page }"
          type="button"
          @click="goPage(page)"
        >
          {{ page }}
        </button>
        <button class="pagination-step" type="button" :disabled="safePage === totalPages" @click="goPage(safePage + 1)">
          ›
        </button>
      </div>
    </div>

    <PersonDetail
      :person="selectedPerson"
      @back="selectedPerson = null"
      @ask="emit('ask-person', $event)"
    />
  </section>
</template>
