<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Wrench, Construction, Image } from 'lucide-vue-next'

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
    description: '纯白背景 · 居中图标 · Iconify / 上传图片 · 导出 PNG / WebP · 1920x600',
    status: 'available',
    route: '/tools/cover-generator',
  },
])

const statusMap: Record<ToolItem['status'], { label: string; class: string }> = {
  'available': { label: '可用', class: 'bg-green-500' },
  'development': { label: '开发中', class: 'bg-yellow-500' },
  'coming-soon': { label: '即将推出', class: 'bg-gray-400' },
}

const iconMap: Record<string, typeof Image> = {
  '文章封面生成器': Image,
}
</script>

<template>
  <div class="container mx-auto max-w-4xl px-4 py-8">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold tracking-tight mb-2">工具</h1>
    </div>

    <!-- Tools Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <Card
        v-for="tool in tools"
        :key="tool.name"
        :class="[
          'group transition-all duration-200',
          tool.route ? 'cursor-pointer hover:shadow-md hover:border-primary/50' : ''
        ]"
        @click="tool.route && router.push(tool.route)"
      >
        <CardHeader>
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <component :is="iconMap[tool.name] || Wrench" class="h-5 w-5 text-muted-foreground" />
              <CardTitle class="text-base">{{ tool.name }}</CardTitle>
            </div>
            <span
              :class="statusMap[tool.status].class"
              class="inline-block w-2 h-2 rounded-full"
              :title="statusMap[tool.status].label"
            ></span>
          </div>
          <CardDescription>{{ tool.description }}</CardDescription>
        </CardHeader>
        <CardContent>
          <div class="flex items-center gap-2 text-xs text-muted-foreground">
            <Construction class="h-3.5 w-3.5" />
            <span>{{ statusMap[tool.status].label }}</span>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Placeholder for future tool expansion -->
    <div class="mt-12 text-center text-muted-foreground">
      <Wrench class="h-12 w-12 mx-auto mb-4 opacity-20" />
      <p>更多工具正在路上...</p>
    </div>
  </div>
</template>
