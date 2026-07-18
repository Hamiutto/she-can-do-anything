<script setup>
import { timeTags } from '../data/tags'

defineEmits(['select'])
</script>

<template>
  <div class="quick-row">
    <button
      v-for="tag in timeTags"
      :key="tag"
      class="soft-button time-entry"
      type="button"
      @click="$emit('select', tag)"
    >
      {{ tag }}
    </button>
  </div>
</template>
