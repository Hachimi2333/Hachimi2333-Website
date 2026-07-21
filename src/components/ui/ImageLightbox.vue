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

// Touch state
const initialPinchDistance = ref(0)
const initialScale = ref(1)
const touchStart = ref({ x: 0, y: 0 })
const lastTouchTranslate = ref({ x: 0, y: 0 })
const isTouchDragging = ref(false)
const touchCount = ref(0)

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

// --- Mouse wheel zoom ---
function onWheel(e: WheelEvent) {
  e.preventDefault()
  const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP
  const newScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale.value + delta))

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

// --- Mouse drag ---
function onDragStart(e: MouseEvent) {
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

// --- Touch events ---
function getTouchDistance(t: TouchList) {
  const dx = t[0].clientX - t[1].clientX
  const dy = t[0].clientY - t[1].clientY
  return Math.hypot(dx, dy)
}

function getTouchCenter(t: TouchList, rect: DOMRect) {
  const cx = (t[0].clientX + t[1].clientX) / 2
  const cy = (t[0].clientY + t[1].clientY) / 2
  return { x: cx - rect.left, y: cy - rect.top }
}

function onTouchStart(e: TouchEvent) {
  e.preventDefault()
  touchCount.value = e.touches.length

  if (e.touches.length === 2) {
    // Pinch start
    initialPinchDistance.value = getTouchDistance(e.touches)
    initialScale.value = scale.value
  } else if (e.touches.length === 1) {
    // Single finger drag
    isTouchDragging.value = true
    touchStart.value = { x: e.touches[0].clientX, y: e.touches[0].clientY }
    lastTouchTranslate.value = { x: translateX.value, y: translateY.value }
  }
}

function onTouchMove(e: TouchEvent) {
  e.preventDefault()

  if (e.touches.length === 2) {
    // Pinch zoom
    const dist = getTouchDistance(e.touches)
    const newScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, initialScale.value * (dist / initialPinchDistance.value)))

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    const center = getTouchCenter(e.touches, rect)
    const containerCenterX = rect.width / 2
    const containerCenterY = rect.height / 2

    const ratio = newScale / scale.value
    translateX.value = center.x - ratio * (center.x - translateX.value - containerCenterX) - containerCenterX
    translateY.value = center.y - ratio * (center.y - translateY.value - containerCenterY) - containerCenterY

    scale.value = newScale
  } else if (e.touches.length === 1 && isTouchDragging.value) {
    // Single finger drag
    translateX.value = lastTouchTranslate.value.x + (e.touches[0].clientX - touchStart.value.x)
    translateY.value = lastTouchTranslate.value.y + (e.touches[0].clientY - touchStart.value.y)
  }
}

function onTouchEnd(e: TouchEvent) {
  if (e.touches.length < 2) {
    initialPinchDistance.value = 0
  }
  if (e.touches.length === 0) {
    isTouchDragging.value = false
    touchCount.value = 0
  }
}

// --- Lifecycle ---
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
        @touchstart="onTouchStart"
        @touchmove.prevent="onTouchMove"
        @touchend="onTouchEnd"
      >
        <button
          class="absolute top-4 right-4 flex items-center justify-center size-10 rounded-none bg-white/10 text-white hover:bg-white/20 transition-colors z-10"
          @click="emit('close')"
        >
          <X />
        </button>
        <img
          :src="src"
          :alt="alt || ''"
          :style="{
            transform: `translate(${translateX}px, ${translateY}px) scale(${scale})`,
            cursor: isDragging ? 'grabbing' : 'grab',
            transition: isDragging ? 'none' : 'transform 0.15s ease',
          }"
          class="max-w-[90vw] max-h-[90vh] object-contain rounded-none shadow-2xl select-none touch-none"
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
