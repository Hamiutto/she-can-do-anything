<script setup>
import TopNav from './TopNav.vue'
</script>

<template>
  <main class="app-shell">
    <TopNav @toast="$emit('toast', $event)" />
    <slot />
  </main>
</template>
