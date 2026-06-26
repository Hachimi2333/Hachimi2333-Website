import type { Component } from 'vue'
import { Image, AppWindow } from 'lucide-vue-next'

export interface ToolMeta {
  id: string
  name: string
  description: string
  icon: Component
  route: string
  version: string
}

export const tools: ToolMeta[] = [
  {
    id: 'cover-generator',
    name: '文章封面生成器',
    description: '生成文章封面图，支持 Iconify 图标搜索与本地图片上传',
    icon: Image,
    route: '/tools/cover-generator',
    version: 'v1.2.0',
  },
  {
    id: 'app-icon-generator',
    name: 'App 图标生成器',
    description: '制作 App 图标，支持自定义颜色与导出 PNG',
    icon: AppWindow,
    route: '/tools/app-icon-generator',
    version: 'v1.1.0',
  },
]

export function getToolById(id: string): ToolMeta | undefined {
  return tools.find((t) => t.id === id)
}

export function getToolByRoute(route: string): ToolMeta | undefined {
  return tools.find((t) => t.route === route)
}
