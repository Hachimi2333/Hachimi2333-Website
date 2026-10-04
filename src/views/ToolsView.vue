<script setup lang="ts">
import { useRouter } from 'vue-router'
import { Badge } from '@/components/ui/badge'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import PageBreadcrumb from '@/components/layout/PageBreadcrumb.vue'
import { tools } from '@/tools/manifest'

const router = useRouter()
</script>

<template>
  <div class="container mx-auto max-w-4xl px-4 py-8">
    <PageBreadcrumb :items="[{ label: '首页', to: '/' }, { label: '工具' }]" />

    <div class="mb-6">
      <h1 class="text-3xl font-bold tracking-tight">工具</h1>
    </div>

    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <Card
        v-for="tool in tools"
        :key="tool.id"
        class="cursor-pointer transition-colors hover:bg-accent/50"
        @click="router.push(tool.route)"
      >
        <CardHeader>
          <div class="flex items-start justify-between">
            <div class="flex items-center gap-3">
              <div class="flex size-10 shrink-0 items-center justify-center rounded-md bg-muted">
                <component :is="tool.icon" class="size-5 text-muted-foreground" />
              </div>
              <div>
                <CardTitle class="text-base">{{ tool.name }}</CardTitle>
                <CardDescription class="mt-1">{{ tool.description }}</CardDescription>
              </div>
            </div>
            <Badge variant="outline" class="shrink-0 text-xs">
              {{ tool.version }}
            </Badge>
          </div>
        </CardHeader>
      </Card>
    </div>
  </div>
</template>
