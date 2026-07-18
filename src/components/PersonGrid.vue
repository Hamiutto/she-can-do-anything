<script setup>
import PersonCard from './PersonCard.vue'

defineProps({
  people: {
    type: Array,
    required: true
  }
})
defineEmits(['open', 'toast'])
</script>

<template>
  <div class="people-grid">
    <PersonCard
      v-for="person in people"
      :key="person.id"
      :person="person"
      @open="$emit('open', $event)"
      @toast="$emit('toast', $event)"
    />
  </div>
</template>
