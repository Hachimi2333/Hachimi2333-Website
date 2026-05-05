<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { Search, Download, RotateCcw, Palette, Maximize2 } from 'lucide-vue-next'

const canvasRef = ref<HTMLCanvasElement | null>(null)

const searchQuery = ref('')
const searchResults = ref<string[]>([])
const searchStatus = ref('')
const searchLoading = ref(false)

const currentIcon = ref('')
const currentIconSvg = ref('')
const iconColor = ref('#ffffff')
const bgColor = ref('#1890ff')
const iconScale = ref(0.65)

async function fetchIconSvg(iconName: string): Promise<string> {
  const [provider, name] = iconName.split(':')
  const url = `https://api.iconify.design/${provider}/${name}.svg`
  const res = await fetch(url)
  if (!res.ok) throw new Error('图标不存在')
  return await res.text()
}

function applyColorToSvg(svgString: string, color: string): string {
  if (!color || !svgString) return svgString
  try {
    const parser = new DOMParser()
    const svgDoc = parser.parseFromString(svgString, 'image/svg+xml')
    const svgElement = svgDoc.documentElement
    if (svgElement.tagName !== 'svg') return svgString

    function setFillRecursive(element: Element) {
      if (element.tagName === 'defs' || element.tagName === 'style' || element.tagName === 'script') return
      const fill = element.getAttribute('fill')
      if (fill !== null && fill !== 'none') element.setAttribute('fill', color)
      for (let i = 0; i < element.children.length; i++) setFillRecursive(element.children[i])
    }
    setFillRecursive(svgElement)

    const allElements = svgElement.querySelectorAll('*')
    allElements.forEach(el => {
      if (el.tagName !== 'defs' && el.tagName !== 'style' && el.tagName !== 'script') {
        const fill = el.getAttribute('fill')
        if (fill !== null && fill !== 'none') el.setAttribute('fill', color)
      }
    })

    const serializer = new XMLSerializer()
    return serializer.serializeToString(svgElement)
  } catch {
    return svgString
  }
}

function getCtx() {
  const canvas = canvasRef.value
  if (!canvas) return null
  return canvas.getContext('2d')
}

function drawCanvas() {
  const ctx = getCtx()
  const canvas = canvasRef.value
  if (!ctx || !canvas) return
  if (!currentIconSvg.value) {
    ctx.fillStyle = '#e5e7eb'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    return
  }

  ctx.fillStyle = bgColor.value
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  const svgToRender = applyColorToSvg(currentIconSvg.value, iconColor.value)
  const img = new Image()
  const svgBlob = new Blob([svgToRender], { type: 'image/svg+xml' })
  const url = URL.createObjectURL(svgBlob)

  img.onload = () => {
    const size = canvas.width * iconScale.value
    const x = (canvas.width - size) / 2
    const y = (canvas.height - size) / 2
    ctx.drawImage(img, x, y, size, size)
    URL.revokeObjectURL(url)
  }
  img.onerror = () => URL.revokeObjectURL(url)
  img.src = url
}

async function loadIcon(iconName: string) {
  if (!iconName) return
  searchStatus.value = '加载中...'
  try {
    currentIconSvg.value = await fetchIconSvg(iconName)
    currentIcon.value = iconName
    searchStatus.value = `已加载: ${iconName}`
    nextTick(() => drawCanvas())
  } catch {
    searchStatus.value = '加载失败'
    currentIconSvg.value = ''
  }
}

async function searchIcons(query: string) {
  if (!query.trim()) {
    searchResults.value = []
    return
  }
  searchLoading.value = true
  searchStatus.value = '搜索中...'

  try {
    const res = await fetch(`https://api.iconify.design/search?query=${encodeURIComponent(query)}&limit=30`)
    const data = await res.json()
    const icons = data.icons || []
    searchResults.value = icons
    searchStatus.value = icons.length === 0 ? '无结果' : `找到 ${icons.length} 个图标`
  } catch {
    searchStatus.value = '搜索出错'
    searchResults.value = []
  } finally {
    searchLoading.value = false
  }
}

function onSearch() {
  const query = searchQuery.value.trim()
  if (query.includes(':') && !query.includes(' ')) {
    loadIcon(query)
    searchIcons(query)
  } else {
    searchIcons(query)
  }
}

function selectIcon(iconName: string) {
  searchQuery.value = iconName
  loadIcon(iconName)
}

function resetAll() {
  currentIcon.value = ''
  currentIconSvg.value = ''
  searchResults.value = []
  searchStatus.value = ''
  searchQuery.value = ''
  iconColor.value = '#ffffff'
  bgColor.value = '#1890ff'
  iconScale.value = 0.65
  nextTick(() => drawCanvas())
}

function getSearchIconUrl(iconName: string): string {
  return `https://api.iconify.design/${iconName}.svg`
}

function exportPNG() {
  const canvas = canvasRef.value
  if (!canvas || !currentIconSvg.value) {
    alert('请先选择一个图标')
    return
  }
  canvas.toBlob((blob) => {
    if (!blob) return
    const link = document.createElement('a')
    link.download = 'app-icon-1024x1024.png'
    link.href = URL.createObjectURL(blob)
    link.click()
    URL.revokeObjectURL(link.href)
  }, 'image/png', 1)
}

onMounted(() => {
  drawCanvas()
})
</script>

<template>
  <div class="container mx-auto max-w-4xl px-4 py-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold tracking-tight">App 图标生成器</h1>
    </div>

    <div class="space-y-6">
      <!-- Preview -->
      <Card>
        <CardContent class="flex justify-center p-4 sm:p-6 pb-0">
          <div class="aspect-square w-full max-w-[320px] bg-white rounded-xl overflow-hidden border">
            <canvas
              ref="canvasRef"
              width="1024"
              height="1024"
              class="w-full h-full"
            />
          </div>
        </CardContent>
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 px-4 sm:px-6 py-3 text-sm text-muted-foreground">
          <span class="tabular-nums shrink-0">1024 × 1024 px</span>
          <div class="flex items-center gap-2">
            <Button size="sm" variant="outline" @click="exportPNG">
              <Download class="h-3.5 w-3.5 mr-1" />
              导出 PNG
            </Button>
            <Button variant="ghost" size="icon" class="h-8 w-8 shrink-0" @click="resetAll" title="重置">
              <RotateCcw class="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </Card>

      <!-- Controls -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Icon Source -->
        <Card>
          <CardHeader>
            <CardTitle class="text-base flex items-center gap-2">
              <Search class="h-4 w-4 text-muted-foreground" />
              图标来源
            </CardTitle>
          </CardHeader>
          <CardContent class="space-y-4">
            <div
              v-if="currentIcon"
              class="flex items-center gap-2 text-sm bg-muted/40 rounded-lg px-3 py-2"
            >
              <span class="text-muted-foreground shrink-0">当前:</span>
              <span class="truncate">{{ currentIcon }}</span>
              <Button
                variant="ghost"
                size="icon"
                class="h-6 w-6 shrink-0 ml-auto"
                @click="resetAll"
                title="清除"
              >
                <span class="text-muted-foreground text-sm leading-none">&times;</span>
              </Button>
            </div>

            <div class="flex gap-2">
              <Input
                v-model="searchQuery"
                placeholder="例如: material-symbols:home, mdi:star..."
                class="h-9"
                @keyup.enter="onSearch"
              />
              <Button size="sm" @click="onSearch" :disabled="searchLoading">
                <Search class="h-4 w-4" />
              </Button>
            </div>

            <p
              v-if="searchStatus"
              class="text-xs"
              :class="searchStatus.includes('失败') || searchStatus.includes('出错') ? 'text-destructive' : 'text-muted-foreground'"
            >
              {{ searchStatus }}
            </p>

            <div
              v-if="searchResults.length > 0"
              class="grid grid-cols-8 gap-1 max-h-48 overflow-y-auto p-1.5 bg-muted/30 rounded-lg"
            >
              <button
                v-for="iconName in searchResults"
                :key="iconName"
                :class="cn(
                  'aspect-square flex items-center justify-center rounded-md border p-0.5 transition-all',
                  currentIcon === iconName
                    ? 'border-primary bg-primary/10 ring-1 ring-primary'
                    : 'border-transparent hover:border-border hover:bg-accent'
                )"
                :title="iconName"
                @click="selectIcon(iconName)"
              >
                <img :src="getSearchIconUrl(iconName)" :alt="iconName" class="w-4.5 h-4.5 object-contain" loading="lazy" />
              </button>
            </div>
            <p v-else-if="searchQuery && !searchLoading" class="text-xs text-muted-foreground text-center py-1">
              输入关键词并搜索
            </p>
          </CardContent>
        </Card>

        <!-- Settings -->
        <Card>
          <CardHeader>
            <CardTitle class="text-base flex items-center gap-2">
              <Maximize2 class="h-4 w-4 text-muted-foreground" />
              显示设置
            </CardTitle>
          </CardHeader>
          <CardContent class="space-y-5">
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <span class="text-sm">图标大小</span>
                <span class="text-sm tabular-nums text-muted-foreground">{{ Math.round(iconScale * 100) }}%</span>
              </div>
              <input
                type="range"
                min="0.2"
                max="0.9"
                step="0.05"
                :value="iconScale"
                @input="iconScale = +($event.target as HTMLInputElement).value; nextTick(() => drawCanvas())"
                class="w-full h-1.5 bg-secondary rounded-full appearance-none cursor-pointer accent-primary"
              />
              <div class="flex justify-between text-xs text-muted-foreground">
                <span>20%</span>
                <span>90%</span>
              </div>
            </div>

            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <span class="text-sm flex items-center gap-1.5">
                  <Palette class="h-3.5 w-3.5 text-muted-foreground" />
                  图标颜色
                </span>
                <input
                  type="color"
                  v-model="iconColor"
                  class="w-7 h-7 rounded-full border border-input cursor-pointer p-0.5"
                  @input="nextTick(() => drawCanvas())"
                />
              </div>
            </div>

            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <span class="text-sm flex items-center gap-1.5">
                  <span class="w-3.5 h-3.5 rounded-full border border-input shrink-0" :style="{ background: bgColor }" />
                  背景颜色
                </span>
                <input
                  type="color"
                  v-model="bgColor"
                  class="w-7 h-7 rounded-full border border-input cursor-pointer p-0.5"
                  @input="nextTick(() => drawCanvas())"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
</template>
