<script setup lang="ts">
import AppHeader from './AppHeader.vue'
import AppFooter from './AppFooter.vue'
import BackToTop from './BackToTop.vue'
</script>

<template>
  <div class="flex min-h-svh flex-col bg-background">
    <AppHeader />
    <main class="flex flex-1 flex-col">
      <router-view />
    </main>
    <AppFooter />
    <BackToTop />
  </div>
</template>
