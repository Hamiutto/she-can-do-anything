<template>
  <footer class="site-disclaimer" aria-label="网站免责声明">
    <div class="site-disclaimer-inner">
      <p class="site-disclaimer-title">2026 SHE IS ____ · 她行美美与共强女战队 · 真实女性经验成长地图</p>
      <p class="site-disclaimer-copy">
        隐私保护：仅收集手机号/邮箱用于登录；年龄、婚育、职业等内容均选填；敏感信息单独弹窗同意。
      </p>
      <p class="site-disclaimer-links">团队思考 · 隐私政策</p>
      <p class="site-disclaimer-note">
        本页面展示内容为「她行·美美与共强女战队」原创参赛方案，仅供本次大赛评审交流使用。最终解释权归主办方所有。如有疑问，请联系团队队长。
      </p>
    </div>
  </footer>
</template>

<style scoped>
.site-disclaimer {
  margin-top: 28px;
  padding: 22px 4px 8px;
  border-top: 1px solid rgba(45, 52, 54, 0.08);
}

.site-disclaimer-inner {
  max-width: 960px;
  margin: 0 auto;
  text-align: center;
  color: rgba(45, 52, 54, 0.72);
}

.site-disclaimer-inner p {
  margin: 0;
  line-height: 1.75;
}

.site-disclaimer-title {
  font-size: 0.94rem;
  font-weight: 600;
  color: rgba(45, 52, 54, 0.82);
}

.site-disclaimer-copy,
.site-disclaimer-note {
  font-size: 0.84rem;
}

.site-disclaimer-links {
  margin: 10px 0 8px;
  font-size: 0.86rem;
  color: rgba(45, 52, 54, 0.72);
  font-weight: 600;
}

@media (max-width: 640px) {
  .site-disclaimer {
    padding-inline: 0;
  }

  .site-disclaimer-title {
    font-size: 0.88rem;
  }

  .site-disclaimer-copy,
  .site-disclaimer-note {
    font-size: 0.8rem;
  }
}
</style>
