<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import AppLayout from './components/AppLayout.vue'
import Toast from './components/Toast.vue'
import AskQuestionModal from './components/AskQuestionModal.vue'
import { useAuth } from './composables/useAuth'

const route = useRoute()
const { restoreSession } = useAuth()

const toastMessage = ref('')
const modalPerson = ref(null)

// Routes that should NOT be wrapped in AppLayout (they have their own layout)
const standaloneRoutes = ['/login']
const useAppLayout = computed(() => !standaloneRoutes.includes(route.path))

onMounted(async () => {
  await restoreSession()
})

function showToast(message) {
  toastMessage.value = message
}

function openAskModal(person) {
  modalPerson.value = person
}

function closeAskModal() {
  modalPerson.value = null
}

function handleQuestionSent() {
  showToast('提问已发送，等她回答。')
}
</script>

<template>
  <template v-if="useAppLayout">
    <AppLayout @toast="showToast">
      <RouterView @toast="showToast" @ask-person="openAskModal" />
    </AppLayout>
  </template>
  <template v-else>
    <RouterView />
  </template>
  <AskQuestionModal
    :person="modalPerson"
    @close="closeAskModal"
    @sent="handleQuestionSent"
  />
  <Toast :message="toastMessage" @hidden="toastMessage = ''" />
</template>
