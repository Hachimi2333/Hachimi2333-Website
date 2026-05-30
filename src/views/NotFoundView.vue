<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Home } from 'lucide-vue-next'
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<template>
  <div class="flex-1 flex items-center justify-center">
    <div class="text-center space-y-6 px-4">
      <p class="text-8xl font-bold text-muted-foreground/30 select-none">404</p>
      <p class="text-lg font-medium">页面不存在</p>
      <div class="flex justify-center">
        <Button @click="router.push('/')">
          <Home class="mr-2 h-4 w-4" />
          返回首页
        </Button>
      </div>
    </div>
  </div>
</template>
