<script setup>
import { ref } from 'vue'
import { teamMembers, inspirationCards } from '../data/team.js'

const tabs = [
  { key: 'team', label: '👥 团队阵容' },
  { key: 'value', label: '💰 商业价值' },
  { key: 'inspiration', label: '💡 灵感来源' },
]
const activeTab = ref('team')
</script>

<template>
  <section class="page-section section is-active">
    <div class="page-card team-page-card">
      <h2>我们是谁，为什么做这件事</h2>
      <p class="lead">5 个人，一个共同目标：让女性的真实经验被看见、被链接、被回应。下面三个入口，帮你快速认识我们。</p>

      <!-- Tab bar -->
      <div class="team-tabs">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          :class="['team-tab', { active: activeTab === tab.key }]"
          type="button"
          @click="activeTab = tab.key"
        >
          {{ tab.label }}
        </button>
      </div>

      <!-- Team Members -->
      <div v-show="activeTab === 'team'" class="team-content">
        <div class="team-heading">
          <h3>一支全角色战队，每个人都能独当一面</h3>
          <p class="text-muted">创意、商业、内容、产品、技术，五种能力闭环。点开任意一位，看清她的擅长与优势。</p>
        </div>
        <div class="team-grid">
          <div v-for="member in teamMembers" :key="member.name" class="member-card">
            <div class="member-avatar">{{ member.name.charAt(0) }}</div>
            <h4>{{ member.name }}</h4>
            <div class="member-role">{{ member.role }}</div>
            <p class="member-tagline">"{{ member.tagline }}"</p>
            <div class="member-block">
              <div class="member-block-title">核心能力</div>
              <div class="member-skills">
                <span v-for="skill in member.skills" :key="skill" class="member-skill">{{ skill }}</span>
              </div>
            </div>
            <p class="member-story">{{ member.story }}</p>
          </div>
        </div>
      </div>

      <!-- Business Value -->
      <div v-show="activeTab === 'value'" class="team-content">
        <div class="value-formula">
          <div class="formula-title">我们认为的商业模式</div>
          <div class="formula-body">真实女性样本 × AI 同频匹配 × 付费轻咨询 × 回声沉淀 = 一个可持续的女性经验社区</div>
        </div>

        <div class="value-section">
          <div class="value-heading">
            <h3>如果冷启动 1,000 名目标用户，会发生什么？</h3>
          </div>
          <div class="value-grid">
            <div class="value-item">
              <div class="value-num">5%</div>
              <div class="value-label">付费提问转化率</div>
              <h4>50 人付费</h4>
              <p>每 1,000 名浏览用户中，约 5% 愿意为具体困境向过来人付费提问。</p>
            </div>
            <div class="value-item">
              <div class="value-num">¥99</div>
              <div class="value-label">单次轻咨询均价</div>
              <h4>入门档定价</h4>
              <p>低于主流咨询价格，降低女性首次付费决策门槛。</p>
            </div>
            <div class="value-item">
              <div class="value-num">20%</div>
              <div class="value-label">平台服务费</div>
              <h4>首月平台收入</h4>
              <p>50 次 × ¥99 × 20% = <strong>¥990</strong>，验证最小付费闭环。</p>
            </div>
            <div class="value-item">
              <div class="value-num">∞</div>
              <div class="value-label">回声内容复利</div>
              <h4>沉淀可复用资产</h4>
              <p>每个被回答的问题都会变成样本卡，吸引下一个用户。</p>
            </div>
          </div>
        </div>

        <div class="value-section">
          <div class="value-heading">
            <h3>三个阶段，每个阶段都有收入</h3>
            <p class="text-muted">不画大饼，只讲每个阶段能收到的钱和验证的假设。</p>
          </div>
          <div class="value-phases">
            <div class="phase-card">
              <h4>短期 · 0-6 个月</h4>
              <p class="text-muted">上线 21 位真实样本卡，跑通「提问 → 匹配 → 回答」闭环。收入来自单次付费提问：用户付费 ¥99，回答者获得 ¥79，平台抽成 ¥20。</p>
            </div>
            <div class="phase-card">
              <h4>中期 · 6-18 个月</h4>
              <p class="text-muted">推出主题小社群（¥199/月）和企业女性成长内训（¥5,000/场）。用 21 位评委网络做冷启动，降低获客成本。</p>
            </div>
            <div class="phase-card">
              <h4>长期 · 18 个月+</h4>
              <p class="text-muted">形成高净值女性社区。收入来源：品牌共创、内容出版/播客、匿名化趋势数据报告。护城河是真实信任关系。</p>
            </div>
            <div class="phase-card">
              <h4>为什么能跑通？</h4>
              <p class="text-muted">真实经验稀缺、回答者自带流量、平台只撮合不生产。AI 负责匹配，人负责共情，两者各司其职。</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Inspiration -->
      <div v-show="activeTab === 'inspiration'" class="team-content">
        <div class="team-heading">
          <h3>我们的灵感，来自哪里</h3>
          <p class="text-muted">每一个功能都不是凭空想象，而是从真实的人和理论里长出来的。</p>
        </div>
        <div class="inspire-grid">
          <div v-for="card in inspirationCards" :key="card.title" class="inspire-card">
            <div class="inspire-emoji">{{ card.emoji }}</div>
            <h4>{{ card.title }}</h4>
            <p>{{ card.body }}</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.team-page-card {
  max-width: 1080px;
  margin: 0 auto;
}

.team-tabs {
  display: flex;
  justify-content: center;
  gap: 10px;
  flex-wrap: wrap;
  margin: 24px auto 8px;
  padding: 6px;
  max-width: 560px;
  background: rgba(45, 52, 54, 0.06);
  border: 1px solid var(--line);
  border-radius: 999px;
}

.team-tab {
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 0.92rem;
  font-weight: 600;
  color: rgba(45, 52, 54, 0.45);
  padding: 10px 22px;
  border-radius: 999px;
  transition: all 0.2s;
}

.team-tab:hover {
  color: var(--ink, #2d3436);
}

.team-tab.active {
  background: rgba(255, 255, 255, 0.96);
  color: var(--ink, #2d3436);
  box-shadow: 0 2px 10px rgba(85, 74, 126, 0.1);
}

.team-content {
  margin-top: 24px;
}

.team-heading {
  text-align: center;
  margin: 0 auto 28px;
  max-width: 640px;
}

.team-heading h3 {
  margin: 0 0 8px;
  font-size: 1.3rem;
  font-family: var(--serif);
}

.text-muted {
  color: rgba(45, 52, 54, 0.55);
  font-size: 0.9rem;
  line-height: 1.7;
}

/* Team Grid */
.team-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 16px;
}

@media (max-width: 992px) {
  .team-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
}

@media (max-width: 640px) {
  .team-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}

.member-card {
  background: rgba(255, 255, 255, 0.68);
  border: 1px solid rgba(255, 255, 255, 0.82);
  border-radius: 20px;
  padding: 22px;
  transition: transform 0.2s, box-shadow 0.2s;
  display: flex;
  flex-direction: column;
}

.member-card:hover {
  box-shadow: 0 12px 32px rgba(85, 74, 126, 0.12);
  transform: translateY(-3px);
}

.member-avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: linear-gradient(145deg, rgba(108, 92, 231, 0.18), rgba(253, 121, 168, 0.20));
  color: var(--lavender);
  font-family: var(--serif);
  font-size: 1.5rem;
  font-weight: 700;
  display: grid;
  place-items: center;
  margin-bottom: 14px;
  box-shadow: 0 4px 12px rgba(108, 92, 231, 0.12);
}

.member-card h4 {
  font-size: 1.1rem;
  margin: 0 0 4px;
}

.member-role {
  font-size: 0.78rem;
  color: var(--lavender, #6c5ce7);
  font-weight: 600;
  margin-bottom: 12px;
}

.member-tagline {
  font-size: 0.88rem;
  color: rgba(45, 52, 54, 0.72);
  line-height: 1.55;
  margin: 0 0 16px;
  font-style: italic;
}

.member-block {
  margin-bottom: 14px;
}

.member-block-title {
  font-size: 0.7rem;
  letter-spacing: 0.08em;
  color: rgba(45, 52, 54, 0.4);
  font-weight: 700;
  text-transform: uppercase;
  margin-bottom: 8px;
}

.member-skills {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.member-skill {
  font-size: 0.72rem;
  padding: 3px 10px;
  border-radius: 999px;
  background: rgba(45, 52, 54, 0.06);
  color: rgba(45, 52, 54, 0.72);
  border: 1px solid var(--line);
}

.member-story {
  font-size: 0.82rem;
  color: rgba(45, 52, 54, 0.68);
  line-height: 1.65;
  margin: 0;
  padding: 12px;
  background: rgba(45, 52, 54, 0.03);
  border-radius: 10px;
  border-left: 3px solid var(--lavender, #6c5ce7);
}

/* Business Value */
.value-formula {
  text-align: center;
  padding: 20px;
  background: linear-gradient(135deg, rgba(108, 92, 231, 0.06), rgba(253, 121, 168, 0.06));
  border: 1px solid rgba(108, 92, 231, 0.12);
  border-radius: 16px;
}

.formula-title {
  font-size: 0.82rem;
  color: var(--lavender, #6c5ce7);
  font-weight: 600;
  margin-bottom: 8px;
}

.formula-body {
  font-size: 0.95rem;
  color: var(--ink, #2d3436);
  font-weight: 500;
  line-height: 1.7;
}

.value-section {
  margin-top: 36px;
}

.value-heading {
  text-align: center;
  margin: 0 auto 24px;
  max-width: 640px;
}

.value-heading h3 {
  margin: 0 0 8px;
  font-size: 1.3rem;
  font-family: var(--serif);
}

.value-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 18px;
}

@media (max-width: 780px) {
  .value-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}

.value-item {
  text-align: center;
  padding: 20px;
  background: rgba(255, 255, 255, 0.58);
  border: 1px solid rgba(255, 255, 255, 0.82);
  border-radius: 16px;
}

.value-num {
  font-size: 2rem;
  font-weight: 800;
  color: var(--lavender, #6c5ce7);
  margin-bottom: 4px;
}

.value-label {
  font-size: 0.78rem;
  color: rgba(45, 52, 54, 0.45);
  margin-bottom: 12px;
}

.value-item h4 {
  font-size: 1rem;
  margin: 0 0 8px;
}

.value-item p {
  font-size: 0.84rem;
  color: rgba(45, 52, 54, 0.62);
  line-height: 1.6;
  margin: 0;
}

.value-phases {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

@media (max-width: 640px) {
  .value-phases { grid-template-columns: 1fr; }
}

.phase-card {
  padding: 20px;
  background: rgba(255, 255, 255, 0.68);
  border: 1px solid rgba(255, 255, 255, 0.82);
  border-radius: 16px;
}

.phase-card h4 {
  font-size: 1.05rem;
  margin: 0 0 8px;
  color: var(--lavender, #6c5ce7);
}

.phase-card .text-muted {
  margin: 0;
  font-size: 0.86rem;
  line-height: 1.7;
}

/* Inspiration */
.inspire-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
}

@media (max-width: 860px) {
  .inspire-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}

@media (max-width: 540px) {
  .inspire-grid { grid-template-columns: 1fr; }
}

.inspire-card {
  background: rgba(255, 255, 255, 0.68);
  border: 1px solid rgba(255, 255, 255, 0.82);
  border-radius: 16px;
  padding: 24px;
  transition: transform 0.2s, box-shadow 0.2s;
}

.inspire-card:hover {
  box-shadow: 0 12px 32px rgba(85, 74, 126, 0.12);
  transform: translateY(-3px);
}

.inspire-emoji {
  font-size: 2rem;
  margin-bottom: 12px;
}

.inspire-card h4 {
  font-size: 1rem;
  margin: 0 0 8px;
}

.inspire-card p {
  font-size: 0.86rem;
  color: rgba(45, 52, 54, 0.62);
  line-height: 1.6;
  margin: 0;
}
</style>
