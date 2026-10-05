<script setup lang="ts">
defineProps<{
  title: string
  description?: string
}>()
</script>

<template>
  <header class="flex flex-col gap-2">
    <h1 class="text-2xl font-bold tracking-tight sm:text-3xl">
      {{ title }}
    </h1>
    <p v-if="description" class="text-sm text-muted-foreground sm:text-base">
      {{ description }}
    </p>
  </header>
</template>
