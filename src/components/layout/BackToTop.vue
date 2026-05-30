<script setup lang="ts">
import { ref, watch } from 'vue'
import { useWindowScroll } from '@vueuse/core'
import { ChevronUp } from 'lucide-vue-next'

const { y } = useWindowScroll()
const show = ref(false)

watch(y, (val) => {
  show.value = val > 300
})

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>

<template>
  <Transition name="back-to-top">
    <button
      v-show="show"
      class="fixed bottom-8 right-4 sm:right-8 z-50 flex items-center justify-center w-10 h-10 rounded-lg bg-background border border-border shadow-sm hover:bg-accent transition-colors"
      @click="scrollToTop"
      aria-label="回到顶部"
    >
      <ChevronUp class="w-5 h-5 text-foreground" />
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
