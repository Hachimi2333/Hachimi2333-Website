<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { XIcon } from '@lucide/vue'

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

const MIN_SCALE = 0.5
const MAX_SCALE = 5
const ZOOM_STEP = 0.15

function resetTransform() {
  scale.value = 1
  translateX.value = 0
  translateY.value = 0
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && props.visible) emit('close')
}

function onBackdropClick(event: MouseEvent) {
  if (event.target === event.currentTarget) emit('close')
}

// --- Mouse wheel zoom ---
function onWheel(event: WheelEvent) {
  const delta = event.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP
  const newScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale.value + delta))

  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
  const centerX = rect.width / 2
  const centerY = rect.height / 2
  const mouseX = event.clientX - rect.left
  const mouseY = event.clientY - rect.top

  const ratio = newScale / scale.value
  translateX.value = mouseX - ratio * (mouseX - translateX.value - centerX) - centerX
  translateY.value = mouseY - ratio * (mouseY - translateY.value - centerY) - centerY

  scale.value = newScale
}

// --- Mouse drag ---
function onDragStart(event: MouseEvent) {
  isDragging.value = true
  dragStart.value = { x: event.clientX, y: event.clientY }
  lastTranslate.value = { x: translateX.value, y: translateY.value }
}

function onDragMove(event: MouseEvent) {
  if (!isDragging.value) return
  translateX.value = lastTranslate.value.x + (event.clientX - dragStart.value.x)
  translateY.value = lastTranslate.value.y + (event.clientY - dragStart.value.y)
}

function onDragEnd() {
  isDragging.value = false
}

// --- Touch ---
function getTouchDistance(touches: TouchList) {
  return Math.hypot(
    touches[0].clientX - touches[1].clientX,
    touches[0].clientY - touches[1].clientY,
  )
}

function getTouchCenter(touches: TouchList, rect: DOMRect) {
  return {
    x: (touches[0].clientX + touches[1].clientX) / 2 - rect.left,
    y: (touches[0].clientY + touches[1].clientY) / 2 - rect.top,
  }
}

function onTouchStart(event: TouchEvent) {
  if (event.touches.length === 2) {
    initialPinchDistance.value = getTouchDistance(event.touches)
    initialScale.value = scale.value
  } else if (event.touches.length === 1) {
    isTouchDragging.value = true
    touchStart.value = { x: event.touches[0].clientX, y: event.touches[0].clientY }
    lastTouchTranslate.value = { x: translateX.value, y: translateY.value }
  }
}

function onTouchMove(event: TouchEvent) {
  if (event.touches.length === 2 && initialPinchDistance.value > 0) {
    const distance = getTouchDistance(event.touches)
    const newScale = Math.min(
      MAX_SCALE,
      Math.max(MIN_SCALE, initialScale.value * (distance / initialPinchDistance.value)),
    )

    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
    const center = getTouchCenter(event.touches, rect)
    const ratio = newScale / scale.value

    translateX.value =
      center.x - ratio * (center.x - translateX.value - rect.width / 2) - rect.width / 2
    translateY.value =
      center.y - ratio * (center.y - translateY.value - rect.height / 2) - rect.height / 2

    scale.value = newScale
  } else if (event.touches.length === 1 && isTouchDragging.value) {
    translateX.value = lastTouchTranslate.value.x + (event.touches[0].clientX - touchStart.value.x)
    translateY.value = lastTouchTranslate.value.y + (event.touches[0].clientY - touchStart.value.y)
  }
}

function onTouchEnd(event: TouchEvent) {
  if (event.touches.length < 2) initialPinchDistance.value = 0
  if (event.touches.length === 0) isTouchDragging.value = false
}

watch(
  () => props.visible,
  (visible) => {
    if (typeof document === 'undefined') return
    document.body.style.overflow = visible ? 'hidden' : ''
    if (visible) resetTransform()
  },
)

onMounted(() => document.addEventListener('keydown', onKeydown))

onUnmounted(() => {
  document.removeEventListener('keydown', onKeydown)
  document.body.style.overflow = ''
})
</script>

<template>
  <!--
    Rendered in place rather than through `<Teleport to="body">`.

    SSR cannot write teleported children into the target element -- it records
    them separately and leaves `<!--teleport start/end-->` placeholders behind --
    so the client has to re-create the target anchors during hydration and
    hydrate the teleport's slot against whatever nodes follow the app container.
    Nothing above this component creates a containing block (no transform, no
    filter, no z-index on `main`), so `position: fixed` behaves identically.
  -->
  <Transition name="lightbox">
    <div
      v-if="visible"
      role="dialog"
      aria-modal="true"
      aria-label="图片预览"
      class="fixed inset-0 z-100 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      @click="onBackdropClick"
      @wheel.prevent="onWheel"
      @touchstart="onTouchStart"
      @touchmove.prevent="onTouchMove"
      @touchend="onTouchEnd"
    >
      <button
        type="button"
        class="absolute top-4 right-4 z-10 flex size-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
        aria-label="关闭预览"
        @click="emit('close')"
        @touchstart.stop
      >
        <XIcon />
      </button>
      <img
        :src="src"
        :alt="alt ?? ''"
        :style="{
          transform: `translate(${translateX}px, ${translateY}px) scale(${scale})`,
          cursor: isDragging ? 'grabbing' : 'grab',
          transition: isDragging ? 'none' : 'transform 0.15s ease',
        }"
        class="max-h-[90vh] max-w-[90vw] touch-none rounded-lg object-contain shadow-2xl select-none"
        draggable="false"
        @mousedown.prevent="onDragStart"
        @mousemove="onDragMove"
        @mouseup="onDragEnd"
        @mouseleave="onDragEnd"
      />
    </div>
  </Transition>
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
