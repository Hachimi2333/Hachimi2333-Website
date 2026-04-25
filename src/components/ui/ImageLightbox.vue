<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { X } from 'lucide-vue-next'

const props = defineProps<{
  visible: boolean
  src: string
  alt?: string
}>()

const emit = defineEmits<{
  close: []
}>()

const scale = ref(1)
const translateX = ref(0)
const translateY = ref(0)
const isDragging = ref(false)
const dragStart = ref({ x: 0, y: 0 })
const lastTranslate = ref({ x: 0, y: 0 })

const MIN_SCALE = 0.5
const MAX_SCALE = 5
const ZOOM_STEP = 0.15

function resetTransform() {
  scale.value = 1
  translateX.value = 0
  translateY.value = 0
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && props.visible) {
    emit('close')
  }
}

function onBackdropClick(e: MouseEvent) {
  if (e.target === e.currentTarget) {
    emit('close')
  }
}

function onWheel(e: WheelEvent) {
  e.preventDefault()
  const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP
  const newScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale.value + delta))

  // Zoom toward cursor position
  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
  const centerX = rect.width / 2
  const centerY = rect.height / 2
  const mouseX = e.clientX - rect.left
  const mouseY = e.clientY - rect.top

  const ratio = newScale / scale.value
  translateX.value = mouseX - ratio * (mouseX - translateX.value - centerX) - centerX
  translateY.value = mouseY - ratio * (mouseY - translateY.value - centerY) - centerY

  scale.value = newScale
}

function onDragStart(e: MouseEvent) {
  if (scale.value <= 1) return
  isDragging.value = true
  dragStart.value = { x: e.clientX, y: e.clientY }
  lastTranslate.value = { x: translateX.value, y: translateY.value }
}

function onDragMove(e: MouseEvent) {
  if (!isDragging.value) return
  translateX.value = lastTranslate.value.x + (e.clientX - dragStart.value.x)
  translateY.value = lastTranslate.value.y + (e.clientY - dragStart.value.y)
}

function onDragEnd() {
  isDragging.value = false
}

watch(() => props.visible, (val) => {
  document.body.style.overflow = val ? 'hidden' : ''
  if (val) resetTransform()
})

onMounted(() => {
  document.addEventListener('keydown', onKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', onKeydown)
  document.body.style.overflow = ''
})
</script>

<template>
  <Teleport to="body">
    <Transition name="lightbox">
      <div
        v-if="visible"
        class="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm"
        @click="onBackdropClick"
        @wheel.prevent="onWheel"
      >
        <button
          class="absolute top-4 right-4 flex items-center justify-center w-10 h-10 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors z-10"
          @click="emit('close')"
        >
          <X class="w-5 h-5" />
        </button>
        <img
          :src="src"
          :alt="alt || ''"
          :style="{
            transform: `translate(${translateX}px, ${translateY}px) scale(${scale})`,
            cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'zoom-in',
            transition: isDragging ? 'none' : 'transform 0.15s ease',
          }"
          class="max-w-[90vw] max-h-[90vh] object-contain rounded-lg shadow-2xl select-none"
          draggable="false"
          @mousedown.prevent="onDragStart"
          @mousemove="onDragMove"
          @mouseup="onDragEnd"
          @mouseleave="onDragEnd"
        />
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.lightbox-enter-active,
.lightbox-leave-active {
  transition: opacity 0.2s ease;
}
.lightbox-enter-from,
.lightbox-leave-to {
  opacity: 0;
}
</style>
