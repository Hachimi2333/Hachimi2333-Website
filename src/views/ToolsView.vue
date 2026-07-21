<script setup lang="ts">
import { useRouter } from 'vue-router'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import PageBreadcrumb from '@/components/layout/PageBreadcrumb.vue'
import { Badge } from '@/components/ui/badge'
import { tools } from '@/tools/manifest'

const router = useRouter()
</script>

<template>
  <div class="container mx-auto max-w-4xl px-4 py-8">
    <PageBreadcrumb :items="[{ label: '首页', to: '/' }, { label: '工具' }]" />

    <div class="mb-6">
      <h1 class="text-3xl font-bold tracking-tight">工具</h1>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <Card
        v-for="tool in tools"
        :key="tool.id"
        class="group transition-colors cursor-pointer hover:bg-accent/50"
        @click="router.push(tool.route)"
      >
        <CardHeader>
          <div class="flex items-start justify-between">
            <div class="flex items-center gap-3">
              <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-none bg-muted">
                <component :is="tool.icon" class="h-5 w-5 text-muted-foreground" />
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
