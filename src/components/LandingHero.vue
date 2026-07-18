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
      <span class="eyebrow">CODING LADY · 女性 AI 创造者黑客松</span>
      <h1>她来<span class="accent">创造</span></h1>
      <div class="hero-brand">SHE IS <span>____</span></div>
      <p class="lead">在真实女性经验里，找到属于自己的时间与人生样本。这里不是标准答案库，而是一座柔软、具体、可以继续生长的女性经验地图。</p>
      <div class="hero-actions">
        <button class="primary-button" type="button" @click="scrollToSearch">开始探索</button>
        <button class="soft-button" type="button" @click="router.push('/five-times')">查看五种时间</button>
      </div>
    </div>
    <div class="stage-card creator-stage-wrap" aria-label="AI Creator Stage">
      <div class="creator-stage">
        <h2>AI CREATOR STAGE</h2>
        <p>从一个问题，生成一条真实女性经验路径</p>
        <div class="stage-line">
          <span class="stage-dot"></span>
          <div>
            <strong>提问 Prompt</strong>
            <small>写下你的处境：转行、育儿、GAP、赚钱、心流</small>
          </div>
          <span>story</span>
        </div>
        <div class="stage-line">
          <span class="stage-dot"></span>
          <div>
            <strong>匹配 Match</strong>
            <small>AI 连接相似经历、城市、标签和人生阶段</small>
          </div>
          <span>care</span>
        </div>
        <div class="stage-line">
          <span class="stage-dot"></span>
          <div>
            <strong>回应 Answer</strong>
            <small>看到现实中的她，也可以写一封问题信</small>
          </div>
          <span>answer</span>
        </div>
      </div>
    </div>
  </section>
</template>
