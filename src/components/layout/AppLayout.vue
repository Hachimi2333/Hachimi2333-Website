<script setup lang="ts">
import AppHeader from './AppHeader.vue'
import AppFooter from './AppFooter.vue'
import BackToTop from './BackToTop.vue'
</script>

<template>
  <div class="flex min-h-svh flex-col bg-background">
    <AppHeader />
    <main class="flex-1">
      <router-view />
    </main>
    <AppFooter />
    <BackToTop />
  </div>
</template>
