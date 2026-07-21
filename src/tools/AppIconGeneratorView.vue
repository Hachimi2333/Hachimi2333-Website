<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { InputGroup, InputGroupInput, InputGroupAddon, InputGroupButton } from '@/components/ui/input-group'
import { Slider } from '@/components/ui/slider'
import { ColorPicker } from '@/components/ui/color-picker'
import { cn } from '@/lib/utils'
import { searchIcons, fetchIconSvg, applyColorToSvg, getSearchIconUrl } from '@/lib/iconify'
import { Search, Download, RotateCcw, Palette, Maximize2, Loader2 } from 'lucide-vue-next'
import ToolLayout from '@/tools/components/ToolLayout.vue'
import { getToolById } from '@/tools/manifest'

const tool = getToolById('app-icon-generator')!

const canvasRef = ref<HTMLCanvasElement | null>(null)

const searchQuery = ref('')
const searchResults = ref<string[]>([])
const searchStatus = ref('')
const searchLoading = ref(false)
const iconLoading = ref(false)

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
  iconLoading.value = true
  try {
    currentIconSvg.value = await fetchIconSvg(iconName)
    currentIcon.value = iconName
    searchStatus.value = `已加载: ${iconName}`
    nextTick(() => drawCanvas())
  } catch {
    searchStatus.value = '加载失败'
    currentIconSvg.value = ''
  } finally {
    iconLoading.value = false
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
  iconLoading.value = false
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
  <ToolLayout :title="tool.name" :version="tool.version">
    <div class="space-y-6">
      <!-- Preview -->
      <Card class="py-0">
        <div class="flex items-center justify-center bg-muted border-b p-6">
          <div class="aspect-square w-full max-w-[320px] bg-white rounded-none overflow-hidden border shadow-sm">
            <canvas
              ref="canvasRef"
              width="1024"
              height="1024"
              class="w-full h-full"
            />
          </div>
        </div>
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 px-4 sm:px-6 py-3 text-sm text-muted-foreground border-t">
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
            <CardDescription>搜索 Iconify 图标库</CardDescription>
          </CardHeader>
          <CardContent class="space-y-4">
            <div
              v-if="currentIcon"
              class="flex items-center gap-2 text-sm bg-muted/40 rounded-none px-3 py-2"
            >
              <Loader2 v-if="iconLoading" class="size-3.5 animate-spin text-muted-foreground shrink-0" />
              <span class="text-muted-foreground shrink-0">当前:</span>
              <span class="truncate">{{ currentIcon }}</span>
              <Button
                variant="ghost"
                size="icon-sm"
                class="ml-auto"
                @click="resetAll"
                title="清除"
              >
                <span class="text-muted-foreground text-sm leading-none">&times;</span>
              </Button>
            </div>

            <InputGroup>
              <InputGroupInput
                v-model="searchQuery"
                placeholder="例如: material-symbols:home, mdi:star..."
                @keyup.enter="onSearch"
              />
              <InputGroupAddon align="inline-end">
                <InputGroupButton size="icon-sm" @click="onSearch" :disabled="searchLoading">
                  <Search />
                </InputGroupButton>
              </InputGroupAddon>
            </InputGroup>

            <p
              v-if="searchStatus"
              class="text-xs"
              :class="searchStatus.includes('失败') || searchStatus.includes('出错') ? 'text-destructive' : 'text-muted-foreground'"
            >
              {{ searchStatus }}
            </p>

            <div
              v-if="searchResults.length > 0"
              class="grid grid-cols-8 gap-1 max-h-48 overflow-y-auto p-1.5 bg-muted/30 rounded-none"
            >
              <button
                v-for="iconName in searchResults"
                :key="iconName"
                :class="cn(
                  'aspect-square flex items-center justify-center rounded-none border p-0.5 transition-all',
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
            <CardDescription>调整图标大小与颜色</CardDescription>
          </CardHeader>
          <CardContent class="space-y-5">
            <!-- Icon Scale -->
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <span class="text-sm">图标大小</span>
                <span class="text-sm tabular-nums text-muted-foreground">{{ Math.round(iconScale * 100) }}%</span>
              </div>
              <Slider
                :model-value="[iconScale]"
                :min="0.2"
                :max="0.9"
                :step="0.05"
                @update:model-value="iconScale = $event?.[0] ?? iconScale; nextTick(() => drawCanvas())"
              />
              <div class="flex justify-between text-xs text-muted-foreground">
                <span>20%</span>
                <span>90%</span>
              </div>
            </div>

            <!-- Icon Color -->
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <span class="text-sm flex items-center gap-1.5">
                  <Palette class="h-3.5 w-3.5 text-muted-foreground" />
                  图标颜色
                </span>
                <ColorPicker
                  :model-value="iconColor"
                  @update:model-value="iconColor = $event; nextTick(() => drawCanvas())"
                />
              </div>
            </div>

            <!-- Background Color -->
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <span class="text-sm flex items-center gap-1.5">
                  <span class="w-3.5 h-3.5 rounded-none border border-input shrink-0" :style="{ background: bgColor }" />
                  背景颜色
                </span>
                <ColorPicker
                  :model-value="bgColor"
                  @update:model-value="bgColor = $event; nextTick(() => drawCanvas())"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </ToolLayout>
</template>
