<script setup lang="ts">
import { useRoute } from 'vue-router'
import AppHeader from './AppHeader.vue'
import AppFooter from './AppFooter.vue'
import BackToTop from './BackToTop.vue'

const route = useRoute()
</script>

<template>
  <div
    class="flex flex-col"
    :class="route.path === '/' ? 'h-svh overflow-hidden' : 'min-h-screen'"
  >
    <AppHeader v-if="route.path !== '/'" />
    <main class="flex flex-1 flex-col">
      <router-view />
    </main>
    <AppFooter />
    <BackToTop />
  </div>
</template>
