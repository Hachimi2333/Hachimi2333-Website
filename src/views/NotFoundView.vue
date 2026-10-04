<script setup lang="ts">
import { useRouter } from 'vue-router'
import { FileQuestionIcon } from '@lucide/vue'
import { Button } from '@/components/ui/button'
import PageBreadcrumb from '@/components/layout/PageBreadcrumb.vue'

const router = useRouter()
</script>

<template>
  <div class="container mx-auto max-w-4xl px-4 py-8">
    <PageBreadcrumb :items="[{ label: '首页', to: '/' }, { label: '页面未找到' }]" />

    <div class="flex flex-col items-center gap-4 py-24 text-center">
      <FileQuestionIcon class="size-12 text-muted-foreground/40" />
      <h1 class="text-2xl font-bold">页面未找到</h1>
      <p class="text-muted-foreground">你访问的页面不存在或已被移除</p>
      <Button class="mt-2" @click="router.push('/')">返回首页</Button>
    </div>
  </div>
</template>
