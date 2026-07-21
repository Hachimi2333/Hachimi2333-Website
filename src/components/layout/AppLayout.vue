<script setup lang="ts">
import { useRoute } from 'vue-router'
import AppHeader from './AppHeader.vue'
import AppFooter from './AppFooter.vue'
import BackToTop from './BackToTop.vue'

const route = useRoute()

const cols = 30
const rows = 20
const colDelays = Array.from({ length: cols }, () => Math.random() * 4)
</script>

<template>
  <div :class="route.path === '/' ? 'h-svh overflow-hidden' : 'min-h-screen'" class="relative flex flex-col">
    <!-- Rain grid -->
    <div class="squares-bg" aria-hidden="true">
      <div class="sq-row" v-for="row in rows" :key="row">
        <div
          v-for="col in cols"
          :key="`${row}-${col}`"
          class="sq-tile"
          :style="{ animationDelay: `${colDelays[col - 1] + (row - 1) * 0.08}s` }"
        ></div>
      </div>
    </div>

    <AppHeader v-if="route.path !== '/'" class="relative z-10" />
    <main class="relative z-10 flex-1 flex flex-col">
      <router-view v-slot="{ Component, route }">
        <Transition name="fade" mode="out-in">
          <component :is="Component" :key="route.path" />
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

.squares-bg {
  position: fixed;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  z-index: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 4px;
}

.sq-row {
  display: flex;
  gap: 4px;
  flex: 1;
}

.sq-tile {
  flex: 1;
  aspect-ratio: 1;
  background: var(--foreground);
  opacity: 0;
  animation: sq-rain 3s linear infinite;
}

@keyframes sq-rain {
  0%, 100% {
    opacity: 0;
  }
  5% {
    opacity: 0.04;
  }
  15% {
    opacity: 0.02;
  }
  25% {
    opacity: 0;
  }
}
</style>
