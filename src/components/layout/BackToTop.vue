<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { ChevronUp } from 'lucide-vue-next'

const show = ref(false)

function handleScroll() {
  show.value = window.scrollY > 300
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<template>
  <Transition name="back-to-top">
    <button
      v-show="show"
      class="fixed bottom-8 right-[max(1rem,calc((100vw-896px)/2-4rem))] z-50 flex items-center justify-center w-12 h-12 rounded-xl bg-background border border-border shadow-md hover:bg-accent transition-colors duration-200"
      @click="scrollToTop"
      aria-label="回到顶部"
    >
      <ChevronUp class="w-6 h-6 text-foreground" />
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
