<script setup lang="ts">
import { useRoute } from 'vue-router'
import AppHeader from './AppHeader.vue'
import AppFooter from './AppFooter.vue'
import BackToTop from './BackToTop.vue'
import SquareRain from './SquareRain.vue'

const route = useRoute()
</script>

<template>
  <div
    class="relative flex flex-col"
    :class="route.path === '/' ? 'h-svh overflow-hidden' : 'min-h-screen'"
  >
    <SquareRain />

    <AppHeader v-if="route.path !== '/'" class="relative z-10" />
    <main class="relative z-20 flex flex-1 flex-col">
      <router-view v-slot="{ Component, route: currentRoute }">
        <Transition name="fade" mode="out-in">
          <component :is="Component" :key="currentRoute.path" />
        </Transition>
      </router-view>
    </main>
    <AppFooter class="relative z-10" />
    <BackToTop />
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
