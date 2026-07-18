<script setup>
import { ref } from 'vue'
import AppLayout from './components/AppLayout.vue'
import Toast from './components/Toast.vue'
import AskQuestionModal from './components/AskQuestionModal.vue'

const toastMessage = ref('')
const modalPerson = ref(null)

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
  <AppLayout @toast="showToast">
    <RouterView @toast="showToast" @ask-person="openAskModal" />
  </AppLayout>
  <AskQuestionModal
    :person="modalPerson"
    @close="closeAskModal"
    @sent="handleQuestionSent"
  />
  <Toast :message="toastMessage" @hidden="toastMessage = ''" />
</template>
