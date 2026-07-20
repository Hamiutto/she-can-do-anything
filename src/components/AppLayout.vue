<script setup>
import TopNav from './TopNav.vue'
import SiteDisclaimer from './SiteDisclaimer.vue'
</script>

<template>
  <main class="app-shell">
    <TopNav @toast="$emit('toast', $event)" />
    <slot />
    <SiteDisclaimer />
  </main>
</template>
