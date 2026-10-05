<script setup lang="ts">
import { FileQuestionIcon } from '@lucide/vue'
import { Button } from '@/components/ui/button'
import PageContainer from '@/components/layout/PageContainer.vue'
</script>

<template>
  <PageContainer>
    <div class="flex flex-col items-center gap-5 py-20 text-center">
      <FileQuestionIcon class="size-10 text-muted-foreground/40" />

      <div class="flex flex-col gap-1">
        <h1 class="text-xl font-semibold">页面未找到</h1>
        <p class="text-sm text-muted-foreground">你访问的页面不存在，或者已经被移除了</p>
      </div>

      <div class="flex flex-wrap justify-center gap-2">
        <Button as-child>
          <router-link to="/">返回首页</router-link>
        </Button>
        <Button variant="outline" as-child>
          <router-link to="/posts">浏览博客</router-link>
        </Button>
      </div>
    </div>
  </PageContainer>
</template>
