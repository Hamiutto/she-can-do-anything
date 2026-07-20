<script setup>
function scrollToContent() {
  document.getElementById('home')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
</script>

<template>
  <section class="landing-splash" id="splash">
    <div class="splash-content">
      <!-- 导入小字 -->
      <p class="splash-eyebrows">
        越是AI信息冲击时代，人和人之间真实的交流就越显珍贵<br>
        越是新媒体发展冲击的时代，一个真实的活人在你面前和你一对一才更真实
      </p>

      <!-- 主标题 -->
      <h1 class="splash-title">她<span class="accent">行</span></h1>

      <!-- 副标题 -->
      <div class="splash-subtitle">She can do anything</div>

      <!-- Slogan -->
      <p class="splash-slogan">在这里，我们（women）共创美好活法的无限可能</p>

      <!-- 描述小字 -->
      <p class="splash-desc">
        这里既是你展示自我的大舞台，又是助你解决问题的避风港<br>
        世界这么大，你想要好奇的生活一定有人在活<br>
        人生路漫长，你眼下的困惑也一定会找到解答
      </p>

      <!-- CTA 按钮 -->
      <button class="splash-cta" type="button" @click="scrollToContent">
        开始浏览
      </button>

      <!-- 滚动提示 -->
      <span class="scroll-hint">⌄</span>
    </div>
  </section>
</template>
