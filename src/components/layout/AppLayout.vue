<script setup lang="ts">
import { useRoute } from 'vue-router'
import AppHeader from './AppHeader.vue'
import AppFooter from './AppFooter.vue'
import BackToTop from './BackToTop.vue'

const route = useRoute()
</script>

<template>
  <div :class="route.path === '/' ? 'h-svh overflow-hidden' : 'min-h-screen'" class="flex flex-col">
    <AppHeader v-if="route.path !== '/'" />
    <main class="flex-1 flex flex-col">
      <router-view v-slot="{ Component, route }">
        <Transition name="fade" mode="out-in">
          <component :is="Component" :key="route.path" />
        </Transition>
      </router-view>
    </main>
    <AppFooter />
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
