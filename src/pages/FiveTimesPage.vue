<script setup>
const times = [
  {
    title: '生存时间',
    short: '生存',
    en: 'Survival Time',
    body: '为了生存而必须付出的时间，常由外部力量驱动，伴随被动感、约束感和不得不做的情绪体验。'
  },
  {
    title: '赚钱时间',
    short: '赚钱',
    en: 'Value Time',
    body: '为创造价值而投入的时间，核心是提升竞争力、形成明确产出，并逐渐建立可回报的能力资产。'
  },
  {
    title: '好看时间',
    short: '好看',
    en: 'Wellness Time',
    body: '为维持和提升好看而投入的时间，包括外在修饰、身体状态、内在健康和生命力管理。'
  },
  {
    title: '好玩时间',
    short: '好玩',
    en: 'Joy Time',
    body: '为体验乐趣、探索新奇、获得放松而投入的时间，特点是自由、无功利目的，也能带来愉悦感。'
  },
  {
    title: '心流时间',
    short: '心流',
    en: 'Flow Time',
    body: '为获得心流体验而投入的时间，通常高度专注、忘记时间流逝，投入感与成就感并存。'
  }
]
</script>

<template>
  <section class="page-section section is-active five-times-page">
    <div class="page-card five-times-card">
      <span class="eyebrow">SHE IS ____</span>
      <h2>五种时间 收获复利人生</h2>
      <p class="lead">把时间看成可以被感知、分配和复利的生命资产。这里先保留五种时间的定义雏形，后续会继续补充测试与人物样本推荐。</p>
      <div class="time-grid time-definition-grid">
        <article v-for="time in times" :key="time.title" class="time-card time-definition-card">
          <div class="time-icon">{{ time.short }}</div>
          <strong>{{ time.title }}</strong>
          <span>{{ time.en }}</span>
          <p>{{ time.body }}</p>
        </article>
      </div>
    </div>
  </section>
</template>
