<template>
  <canvas
    ref="canvasEl"
    class="particle-canvas"
    @mousemove="handleMouseMove"
    @mouseout="handleMouseOut"
    @click="handleClick"
  />
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { useParticleSystem } from '../composables/useParticleSystem'

const props = defineProps({
  questions: {
    type: Array,
    required: true,
  },
})

const emit = defineEmits(['particle-click', 'canvas-click'])

const canvasEl = ref(null)
const ps = useParticleSystem()
let canvasElement = null

// Sync questions to the particle system's internal pool
watch(
  () => props.questions,
  (newQuestions) => {
    if (newQuestions && newQuestions.length > 0) {
      ps.setQuestions(newQuestions)
    }
  },
  { deep: true }
)

onMounted(() => {
  canvasElement = canvasEl.value
  if (!canvasElement) return
  ps.init(canvasElement, props.questions)
  if (props.questions.length > 0) {
    ps.setQuestions(props.questions)
  }
  ps.start()
})

onUnmounted(() => {
  ps.cleanup()
})

function handleMouseMove(event) {
  if (!canvasElement) return
  ps.setMouse(event.clientX, event.clientY)
}

function handleMouseOut() {
  ps.clearMouse()
}

function handleClick(event) {
  const result = ps.handleClick(event.clientX, event.clientY)
  if (result && result.questionData) {
    emit('particle-click', {
      x: event.clientX,
      y: event.clientY,
      data: result,
    })
  } else {
    emit('canvas-click', { x: event.clientX, y: event.clientY })
  }
}
</script>

<style scoped>
.particle-canvas {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: block;
  cursor: crosshair;
  z-index: 1;
  pointer-events: auto;
  background: #F5F0E8;
}
</style>
