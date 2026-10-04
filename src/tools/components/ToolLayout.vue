<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ArrowLeftIcon, TagIcon } from '@lucide/vue'
import { Button } from '@/components/ui/button'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

defineProps<{
  title: string
  version: string
}>()

const router = useRouter()
</script>

<template>
  <div class="container mx-auto max-w-4xl px-4 py-8">
    <Breadcrumb class="mb-6">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink as-child>
            <router-link to="/">首页</router-link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink as-child>
            <router-link to="/tools">工具</router-link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>{{ title }}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>

    <header class="mb-6">
      <h1 class="text-3xl font-bold tracking-tight">{{ title }}</h1>
      <div class="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
        <TagIcon class="size-4" />
        <span>{{ version }}</span>
      </div>
    </header>

    <slot />

    <div class="mt-6">
      <Button variant="ghost" @click="router.push('/tools')">
        <ArrowLeftIcon data-icon="inline-start" />
        返回工具列表
      </Button>
    </div>
  </div>
</template>
