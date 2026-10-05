<script setup lang="ts">
import { ref, watch } from 'vue'
import { useWindowScroll } from '@vueuse/core'
import { ChevronUpIcon } from '@lucide/vue'

const { y } = useWindowScroll()
const show = ref(false)

watch(y, (value) => {
  show.value = value > 300
})

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>

<template>
  <Transition name="back-to-top">
    <button
      v-show="show"
      type="button"
      class="fixed right-4 bottom-6 z-40 flex size-9 items-center justify-center rounded-full border border-border bg-background/90 text-muted-foreground shadow-sm backdrop-blur transition-colors hover:bg-accent hover:text-foreground sm:right-6"
      aria-label="回到顶部"
      @click="scrollToTop"
    >
      <ChevronUpIcon class="size-4" />
    </button>
  </Transition>
</template>

<style scoped>
.back-to-top-enter-active,
.back-to-top-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}
.back-to-top-enter-from,
.back-to-top-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
</style>
