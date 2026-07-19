<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

function scrollToSearch() {
  document.getElementById('sheis')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
</script>

<template>
  <section class="home-hero" id="home">
    <div class="home-copy">
      <span class="eyebrow">在这里，我们（women）共创美好活法的无限可能</span>
      <h1>她<span class="accent">行</span></h1>
      <div class="hero-brand">She can do anything</div>
      <p class="lead">在真实女性经验里，发现更多人生活法。<br>这里不是你的标准答案库，更像是一个包容、柔软、具体、可以助你往四面八方行走的女性经验地图。</p>
      <div class="hero-actions">
        <button class="primary-button" type="button" @click="scrollToSearch">开始探索</button>
        <button class="soft-button" type="button" @click="router.push('/five-times')">五种时间</button>
      </div>
    </div>
    <div class="stage-card creator-stage-wrap" aria-label="AI Creator Stage">
      <div class="creator-stage">
        <h2>好奇宇宙</h2>
        <p>从一个问题，生成一条真实女性经验路径</p>
        <div class="stage-line">
          <span class="stage-dot"></span>
          <div>
            <strong>开始提问</strong>
            <small>写下你的处境：转行、育儿、GAP、赚钱、心流</small>
          </div>
          <span>story</span>
        </div>
        <div class="stage-line">
          <span class="stage-dot"></span>
          <div>
            <strong>链接她</strong>
            <small>AI 连接相似经历、城市、标签和人生阶段</small>
          </div>
          <span>care</span>
        </div>
        <div class="stage-line">
          <span class="stage-dot"></span>
          <div>
            <strong>总有回应</strong>
            <small>看到现实中的她，也可以写一封问题信</small>
          </div>
          <span>answer</span>
        </div>
      </div>
    </div>
  </section>
</template>
