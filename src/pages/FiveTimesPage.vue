<script setup>
import { computed, nextTick, ref, watch } from 'vue'
import PersonDetail from '../components/PersonDetail.vue'
import PersonGrid from '../components/PersonGrid.vue'
import { people } from '../data/people'
import { matchesTag, sortPeople } from '../utils/peopleFilters'

const emit = defineEmits(['toast', 'ask-person'])
const timeResultsRef = ref(null)
const selectedTime = ref(null)
const selectedPerson = ref(null)

const times = [
  {
    title: '生存时间',
    short: '生存',
    en: 'Survival Time',
    tag: '生存时间',
    body: '为了生存而必须付出的时间，常由外部力量驱动，伴随被动感、约束感和不得不做的情绪体验。'
  },
  {
    title: '赚钱时间',
    short: '赚钱',
    en: 'Value Time',
    tag: '赚钱时间',
    body: '为了创造价值而投入的时间，核心是提升竞争力、形成明确产出，并逐渐建立可回报的能力资产。'
  },
  {
    title: '好看时间',
    short: '好看',
    en: 'Wellness Time',
    tag: '好看时间',
    body: '为了维持和提升好看而投入的时间，包括外在修饰、身体状态、内在健康和生命力管理。'
  },
  {
    title: '好玩时间',
    short: '好玩',
    en: 'Joy Time',
    tag: '好玩时间',
    body: '为了体验乐趣、探索新奇、获得放松而投入的时间，特点是自由、无功利目的，也能带来愉悦感。'
  },
  {
    title: '心流时间',
    short: '心流',
    en: 'Flow Time',
    tag: '心流时间',
    body: '为了获得心流体验而投入的时间，通常高度专注、忘记时间流逝，投入感与成就感并存。'
  }
]

const selectedTimeInfo = computed(() => times.find((item) => item.tag === selectedTime.value) || null)

const matchingPeople = computed(() => {
  if (!selectedTime.value) return []
  const filtered = people.filter((person) => matchesTag(person, selectedTime.value))
  return sortPeople(filtered, 'match', selectedTime.value)
})

async function selectTime(time) {
  selectedTime.value = time.tag
  selectedPerson.value = null
  await nextTick()
  timeResultsRef.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function clearTime() {
  selectedTime.value = null
  selectedPerson.value = null
}

async function openPerson(person) {
  selectedPerson.value = person
  await nextTick()
  document.querySelector('.detail-view')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

watch(selectedTime, () => {
  selectedPerson.value = null
})
</script>

<template>
  <section class="page-section section is-active five-times-page">
    <div class="page-card five-times-card">
      <span class="eyebrow">SHE IS ____</span>
      <h2>五种时间 收获复利人生</h2>
      <p class="lead">
        把时间看成可以被感知、分配和复利的生命资源。先了解五种时间的定义，再往下看对应的人生样本。
      </p>

      <div class="time-grid time-definition-grid">
        <button
          v-for="time in times"
          :key="time.tag"
          class="time-card time-definition-card time-definition-button"
          :class="{ 'is-active': selectedTime === time.tag }"
          type="button"
          @click="selectTime(time)"
        >
          <div class="time-icon">{{ time.short }}</div>
          <strong>{{ time.title }}</strong>
          <span>{{ time.en }}</span>
          <p>{{ time.body }}</p>
        </button>
      </div>
    </div>

    <section v-if="selectedTime" ref="timeResultsRef" class="page-card time-results">
      <div class="section-title">
        <div>
          <h2>{{ selectedTimeInfo?.title }} 的人生模板</h2>
          <p>当前展示 {{ matchingPeople.length }} 位带有「{{ selectedTimeInfo?.tag }}」标签的样本卡。</p>
        </div>

        <div class="filters">
          <button class="soft-button" type="button" @click="clearTime">清除时间</button>
        </div>
      </div>

      <PersonGrid
        v-if="matchingPeople.length"
        :people="matchingPeople"
        @open="openPerson"
        @toast="emit('toast', $event)"
      />

      <div v-else class="empty-state is-visible">
        暂时没有匹配的样本卡。
      </div>
    </section>

    <PersonDetail
      :person="selectedPerson"
      @back="selectedPerson = null"
      @ask="emit('ask-person', $event)"
    />
  </section>
</template>
