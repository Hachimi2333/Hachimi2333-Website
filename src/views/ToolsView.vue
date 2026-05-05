<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Card, CardContent } from '@/components/ui/card'
import { Wrench, Image, AppWindow } from 'lucide-vue-next'

const router = useRouter()

interface ToolItem {
  name: string
  description: string
  status: 'coming-soon' | 'development' | 'available'
  route?: string
}

const tools = ref<ToolItem[]>([
  {
    name: '文章封面生成器',
    description: '生成文章封面图，支持 Iconify 图标搜索与本地图片上传',
    status: 'available',
    route: '/tools/cover-generator',
  },
  {
    name: 'App 图标生成器',
    description: '制作 App 图标，支持自定义颜色与导出 PNG',
    status: 'available',
    route: '/tools/app-icon-generator',
  },
])

const iconMap: Record<string, typeof Image> = {
  'App 图标生成器': AppWindow,
  '文章封面生成器': Image,
}
</script>

<template>
  <div class="container mx-auto max-w-4xl px-4 py-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold tracking-tight">工具</h1>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <Card
        v-for="tool in tools"
        :key="tool.name"
        :class="tool.route ? 'cursor-pointer hover:shadow-sm transition-shadow' : ''"
        @click="tool.route && router.push(tool.route)"
      >
        <CardContent class="p-5">
          <div class="flex items-center gap-2.5 mb-2">
            <component :is="iconMap[tool.name] || Wrench" class="h-4 w-4 text-muted-foreground shrink-0" />
            <h3 class="font-medium truncate">{{ tool.name }}</h3>
          </div>
          <p class="text-sm text-muted-foreground line-clamp-2">{{ tool.description }}</p>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
