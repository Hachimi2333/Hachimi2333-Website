<script setup lang="ts">
import { useRouter } from 'vue-router'
import { Button } from '@/components/ui/button'
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from '@/components/ui/breadcrumb'
import { ArrowLeft, Tag } from 'lucide-vue-next'

defineProps<{
  title: string
  version: string
}>()

const router = useRouter()
</script>

<template>
  <div class="container mx-auto max-w-4xl px-4 py-8">
    <!-- Breadcrumb -->
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

    <!-- Header -->
    <header class="mb-6">
      <h1 class="text-3xl font-bold tracking-tight">{{ title }}</h1>
      <div class="flex items-center gap-1.5 mt-2 text-sm text-muted-foreground">
        <Tag class="h-4 w-4" />
        <span>{{ version }}</span>
      </div>
    </header>

    <!-- Content -->
    <slot />

    <!-- Back -->
    <div class="mt-6">
      <Button variant="ghost" @click="router.push('/tools')">
        <ArrowLeft data-icon="inline-start" />
        返回工具列表
      </Button>
    </div>
  </div>
</template>
