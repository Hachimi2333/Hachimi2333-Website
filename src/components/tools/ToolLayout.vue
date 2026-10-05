<script setup lang="ts">
import { ArrowLeftIcon } from '@lucide/vue'
import { Badge } from '@/components/ui/badge'
import PageContainer from '@/components/layout/PageContainer.vue'

defineProps<{
  title: string
  version: string
}>()
</script>

<template>
  <PageContainer>
    <router-link
      to="/tools"
      class="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
    >
      <ArrowLeftIcon class="size-4" />
      返回工具
    </router-link>

    <header class="mt-6 mb-8 flex flex-wrap items-center gap-3">
      <h1 class="text-2xl font-bold tracking-tight sm:text-3xl">{{ title }}</h1>
      <Badge variant="outline">{{ version }}</Badge>
    </header>

    <slot />
  </PageContainer>
</template>
