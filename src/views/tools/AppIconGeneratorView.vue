<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { searchIcons, fetchIconSvg, applyColorToSvg, getSearchIconUrl } from '@/lib/iconify'
import { Search, Download, RotateCcw, Palette, Maximize2 } from 'lucide-vue-next'

const canvasRef = ref<HTMLCanvasElement | null>(null)

const searchQuery = ref('')
const searchResults = ref<string[]>([])
const searchStatus = ref('')
const searchLoading = ref(false)

const currentIcon = ref('')
const currentIconSvg = ref('')
const iconColor = ref('#ffffff')
const bgColor = ref('#2563eb')
const iconScale = ref(0.65)

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

async function onSearch() {
  const query = searchQuery.value.trim()
  searchLoading.value = true
  searchResults.value = []
  searchStatus.value = ''

  if (query.includes(':') && !query.includes(' ')) {
    await loadIcon(query)
  }

  const result = await searchIcons(query)
  searchResults.value = result.icons
  searchStatus.value = result.status
  searchLoading.value = false
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
  bgColor.value = '#2563eb'
  iconScale.value = 0.65
  nextTick(() => drawCanvas())
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
        <CardContent>
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
              <Download data-icon="inline-start" />
              导出 PNG
            </Button>
            <Button variant="ghost" size="icon" @click="resetAll" title="重置">
              <RotateCcw />
            </Button>
          </div>
        </div>
      </Card>

      <!-- Controls -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Icon Source -->
        <Card>
          <CardHeader>
            <CardTitle class="flex items-center gap-2">
              <Search class="h-4 w-4 text-muted-foreground" />
              图标来源
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              v-if="currentIcon"
              class="flex items-center gap-2 text-sm bg-muted/40 rounded-lg px-3 py-2"
            >
              <span class="text-muted-foreground shrink-0">当前:</span>
              <span class="truncate">{{ currentIcon }}</span>
              <Button
                variant="ghost"
                size="icon"
                class="ml-auto"
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
                @keyup.enter="onSearch"
              />
              <Button size="sm" @click="onSearch" :disabled="searchLoading">
                <Search />
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
            <CardTitle class="flex items-center gap-2">
              <Maximize2 class="h-4 w-4 text-muted-foreground" />
              显示设置
            </CardTitle>
          </CardHeader>
          <CardContent>
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
