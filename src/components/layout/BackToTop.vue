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
      class="fixed right-4 bottom-8 z-100 flex size-10 items-center justify-center rounded-md border border-border bg-background shadow-sm transition-colors hover:bg-accent sm:right-8"
      aria-label="回到顶部"
      @click="scrollToTop"
    >
      <ChevronUpIcon class="size-5 text-foreground" />
    </button>
  </Transition>
</template>

<style scoped>
.back-to-top-enter-active,
.back-to-top-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.back-to-top-enter-from,
.back-to-top-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
</style>
