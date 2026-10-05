<script setup lang="ts">
import { ArrowRightIcon } from '@lucide/vue'
import { Badge } from '@/components/ui/badge'
import PageContainer from '@/components/layout/PageContainer.vue'
import PageHeader from '@/components/layout/PageHeader.vue'
import { tools } from '@/lib/tools'
</script>

<template>
  <PageContainer>
    <PageHeader title="工具" description="在浏览器里直接运行的小工具。" />

    <div class="mt-8 grid gap-3 sm:grid-cols-2">
      <router-link
        v-for="tool in tools"
        :key="tool.id"
        :to="tool.route"
        class="group flex flex-col gap-4 rounded-xl border border-border/60 p-5 transition-colors hover:bg-muted/50"
      >
        <div class="flex items-start justify-between gap-3">
          <span class="flex size-9 items-center justify-center rounded-lg bg-muted">
            <component :is="tool.icon" class="size-4 text-muted-foreground" />
          </span>
          <Badge variant="outline">{{ tool.version }}</Badge>
        </div>

        <div class="flex flex-col gap-1">
          <span class="flex items-center gap-1.5 text-sm font-medium">
            {{ tool.name }}
            <ArrowRightIcon
              class="size-3.5 opacity-0 transition-opacity group-hover:opacity-100"
            />
          </span>
          <span class="text-xs leading-relaxed text-muted-foreground">
            {{ tool.description }}
          </span>
        </div>
      </router-link>
    </div>
  </PageContainer>
</template>
