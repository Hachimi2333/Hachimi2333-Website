<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { Search, Upload, Download, RotateCcw, Palette, Maximize2, ChevronDown } from 'lucide-vue-next'

const canvasRef = ref<HTMLCanvasElement | null>(null)

const searchQuery = ref('')
const searchResults = ref<string[]>([])
const searchStatus = ref('')
const searchLoading = ref(false)

const currentIconName = ref('')
const currentIconSvg = ref<string | null>(null)

const uploadedImageData = ref<string | null>(null)
const uploadedFileName = ref('')
const isUsingUploadedImage = computed(() => uploadedImageData.value !== null)

const iconSize = ref(360)
const colorMode = ref<'original' | 'custom'>('original')
const customColor = ref('#3b82f6')
const iconInfoText = ref('未选择图标')
const filename = ref('article-cover')
const exportFormat = ref<'png' | 'webp'>('png')
const showFormatMenu = ref(false)

function toggleFormatMenu(e: Event) {
  e.stopPropagation()
  showFormatMenu.value = !showFormatMenu.value
}

function selectFormat(format: 'png' | 'webp') {
  exportFormat.value = format
  showFormatMenu.value = false
  exportCanvas(format)
}

function closeFormatMenu() {
  showFormatMenu.value = false
}

function getCtx() {
  const canvas = canvasRef.value
  if (!canvas) return null
  return canvas.getContext('2d')
}

function clearCanvas() {
  const ctx = getCtx()
  const canvas = canvasRef.value
  if (!ctx || !canvas) return
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
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
      if (fill !== null && fill !== 'none') {
        element.setAttribute('fill', color)
      }
      for (let i = 0; i < element.children.length; i++) {
        setFillRecursive(element.children[i])
      }
    }
    setFillRecursive(svgElement)

    const allElements = svgElement.querySelectorAll('*')
    allElements.forEach(el => {
      if (el.tagName !== 'defs' && el.tagName !== 'style' && el.tagName !== 'script') {
        const fill = el.getAttribute('fill')
        if (fill !== null && fill !== 'none') {
          el.setAttribute('fill', color)
        }
      }
    })

    const serializer = new XMLSerializer()
    return serializer.serializeToString(svgElement)
  } catch {
    return svgString
  }
}

function drawCanvas() {
  const ctx = getCtx()
  const canvas = canvasRef.value
  if (!ctx || !canvas) return

  clearCanvas()

  if (isUsingUploadedImage.value && uploadedImageData.value) {
    const img = new Image()
    img.onload = () => {
      const targetSize = iconSize.value
      let drawWidth: number, drawHeight: number
      if (img.width >= img.height) {
        drawWidth = targetSize
        drawHeight = (img.height / img.width) * targetSize
      } else {
        drawHeight = targetSize
        drawWidth = (img.width / img.height) * targetSize
      }
      drawWidth = Math.max(1, Math.round(drawWidth))
      drawHeight = Math.max(1, Math.round(drawHeight))
      clearCanvas()
      const x = Math.round((canvas.width - drawWidth) / 2)
      const y = Math.round((canvas.height - drawHeight) / 2)
      ctx.drawImage(img, x, y, drawWidth, drawHeight)
      iconInfoText.value = `上传图片  ${drawWidth}x${drawHeight}px`
    }
    img.src = uploadedImageData.value
    return
  }

  if (!currentIconSvg.value || !currentIconName.value) {
    iconInfoText.value = '未选择图标'
    return
  }

  let svgToRender = currentIconSvg.value
  if (colorMode.value === 'custom') {
    svgToRender = applyColorToSvg(currentIconSvg.value, customColor.value)
  }

  const img = new Image()
  const svgBlob = new Blob([svgToRender], { type: 'image/svg+xml' })
  const url = URL.createObjectURL(svgBlob)

  img.onload = () => {
    let iconWidth = img.naturalWidth
    let iconHeight = img.naturalHeight
    if (!iconWidth || !iconHeight || iconWidth === 0 || iconHeight === 0) {
      iconWidth = 100
      iconHeight = 100
    }
    const targetSize = iconSize.value
    let drawWidth: number, drawHeight: number
    if (iconWidth >= iconHeight) {
      drawWidth = targetSize
      drawHeight = (iconHeight / iconWidth) * targetSize
    } else {
      drawHeight = targetSize
      drawWidth = (iconWidth / iconHeight) * targetSize
    }
    drawWidth = Math.max(1, Math.round(drawWidth))
    drawHeight = Math.max(1, Math.round(drawHeight))
    const x = Math.round((canvas.width - drawWidth) / 2)
    const y = Math.round((canvas.height - drawHeight) / 2)
    ctx.drawImage(img, x, y, drawWidth, drawHeight)
    iconInfoText.value = `${currentIconName.value}  ${drawWidth}x${drawHeight}px`
    URL.revokeObjectURL(url)
  }

  img.onerror = () => {
    iconInfoText.value = '图标加载失败'
    URL.revokeObjectURL(url)
  }

  img.src = url
}

function loadIconByName(iconName: string) {
  if (!iconName) return
  if (isUsingUploadedImage.value) {
    clearUploadedImage()
  }
  searchStatus.value = '加载中...'
  currentIconName.value = iconName

  fetch(`https://api.iconify.design/${iconName}.svg`)
    .then(res => {
      if (!res.ok) throw new Error(`图标不存在 (${res.status})`)
      return res.text()
    })
    .then(svg => {
      currentIconSvg.value = svg
      searchStatus.value = `已加载: ${iconName}`
      nextTick(() => drawCanvas())
    })
    .catch(err => {
      searchStatus.value = `加载失败: ${err.message}`
      currentIconSvg.value = null
      currentIconName.value = ''
      nextTick(() => drawCanvas())
    })
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
    if (icons.length === 0) {
      searchStatus.value = '无结果'
    } else {
      searchStatus.value = `找到 ${icons.length} 个图标`
    }
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
    loadIconByName(query)
    searchIcons(query)
  } else {
    searchIcons(query)
  }
}

function selectIcon(iconName: string) {
  searchQuery.value = iconName
  loadIconByName(iconName)
}

function handleFileUpload(file: File) {
  if (file.size > 5 * 1024 * 1024) {
    alert('文件大小不能超过5MB')
    return
  }
  if (!file.type.startsWith('image/')) {
    alert('请上传图片文件')
    return
  }

  const reader = new FileReader()
  reader.onload = (e) => {
    currentIconName.value = ''
    currentIconSvg.value = null
    uploadedImageData.value = e.target?.result as string
    uploadedFileName.value = file.name
    colorMode.value = 'original'
    nextTick(() => drawCanvas())
  }
  reader.readAsDataURL(file)
}

function clearUploadedImage() {
  uploadedImageData.value = null
  uploadedFileName.value = ''
  const fileInput = document.getElementById('hiddenFileInput') as HTMLInputElement
  if (fileInput) fileInput.value = ''

  if (currentIconSvg.value) {
    nextTick(() => drawCanvas())
  } else {
    nextTick(() => {
      clearCanvas()
      iconInfoText.value = '未选择图标'
    })
  }
}

function onFileDrop(e: DragEvent) {
  e.preventDefault()
  const files = e.dataTransfer?.files
  if (files && files.length > 0) {
    handleFileUpload(files[0])
  }
}

function onFileSelect(e: Event) {
  const target = e.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    handleFileUpload(target.files[0])
  }
}

function resetAll() {
  currentIconName.value = ''
  currentIconSvg.value = null
  clearUploadedImage()
  searchResults.value = []
  searchStatus.value = ''
  searchQuery.value = ''
  iconSize.value = 360
  colorMode.value = 'original'
  customColor.value = '#3b82f6'
  filename.value = 'article-cover'
  exportFormat.value = 'png'
  showFormatMenu.value = false
  nextTick(() => {
    clearCanvas()
    iconInfoText.value = '未选择图标'
  })
}

function exportCanvas(format: 'png' | 'webp') {
  const canvas = canvasRef.value
  if (!canvas) return
  if (!currentIconSvg.value && !uploadedImageData.value) {
    alert('请先选择一个图标或上传图片')
    return
  }

  const mime = format === 'png' ? 'image/png' : 'image/webp'
  let name = filename.value.trim() || 'article-cover'
  name = name.replace(/[^a-z0-9\u4e00-\u9fa5\-_]/gi, '-')

  canvas.toBlob((blob) => {
    if (!blob) return
    const link = document.createElement('a')
    link.download = `${name}.${format}`
    link.href = URL.createObjectURL(blob)
    link.click()
    URL.revokeObjectURL(link.href)
  }, mime, 1)
}

function getSearchIconUrl(iconName: string): string {
  return `https://api.iconify.design/${iconName}.svg`
}

onMounted(() => {
  clearCanvas()
})
</script>

<template>
  <div class="container mx-auto max-w-4xl px-4 py-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold tracking-tight">文章封面生成器</h1>
    </div>

    <div class="space-y-6">
      <!-- Preview -->
      <Card>
        <div class="aspect-[1920/600] w-full bg-white border-b overflow-hidden rounded-t-xl">
          <canvas
            ref="canvasRef"
            width="1920"
            height="600"
            class="w-full h-full cursor-crosshair"
          />
        </div>
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 px-4 sm:px-6 py-3 text-sm text-muted-foreground">
          <span class="tabular-nums shrink-0">1920 × 600 px</span>
          <div class="flex items-center gap-2">
            <div class="relative inline-flex">
              <Button size="sm" class="rounded-r-none" variant="outline" @click="exportCanvas(exportFormat)">
                <Download class="h-3.5 w-3.5 mr-1" />
                下载 {{ exportFormat.toUpperCase() }}
              </Button>
              <Button size="sm" class="rounded-l-none px-1.5" variant="outline" @click="toggleFormatMenu">
                <ChevronDown class="h-3.5 w-3.5" />
              </Button>
              <div
                v-if="showFormatMenu"
                class="absolute right-0 top-full mt-1 bg-popover border rounded-md shadow-md z-10 py-1 min-w-[100px]"
                @click.stop
              >
                <button
                  class="block w-full text-left px-3 py-1.5 text-sm hover:bg-accent"
                  :class="exportFormat === 'png' ? 'font-medium' : ''"
                  @click="selectFormat('png')"
                >PNG</button>
                <button
                  class="block w-full text-left px-3 py-1.5 text-sm hover:bg-accent"
                  :class="exportFormat === 'webp' ? 'font-medium' : ''"
                  @click="selectFormat('webp')"
                >WebP</button>
              </div>
            </div>
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
              v-if="currentIconName || uploadedImageData"
              class="flex items-center gap-2 text-sm bg-muted/40 rounded-lg px-3 py-2"
            >
              <span class="text-muted-foreground shrink-0">当前:</span>
              <span
                class="truncate"
                :class="searchStatus.includes('失败') ? 'text-destructive' : ''"
              >{{ iconInfoText }}</span>
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
                placeholder="例如: mdi:home, fa:bell..."
                class="h-9"
                @keyup.enter="onSearch"
              />
              <Button size="sm" @click="onSearch" :disabled="searchLoading">
                <Search class="h-4 w-4" />
              </Button>
            </div>

            <p
              v-if="searchStatus && !currentIconName && !uploadedImageData"
              class="text-xs text-muted-foreground"
            >
              {{ searchStatus }}
            </p>

            <div
              v-if="searchResults.length > 0"
              class="grid grid-cols-8 gap-1 max-h-40 overflow-y-auto p-1.5 bg-muted/30 rounded-lg"
            >
              <button
                v-for="iconName in searchResults"
                :key="iconName"
                :class="cn(
                  'aspect-square flex items-center justify-center rounded-md border p-0.5 transition-all',
                  currentIconName === iconName && !isUsingUploadedImage
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

            <div class="border-t pt-4">
              <div
                v-if="!isUsingUploadedImage"
                class="border-2 border-dashed border-border rounded-lg p-3 text-center cursor-pointer transition-colors hover:border-primary hover:bg-accent/50"
                @click="($refs.fileInput as HTMLInputElement)?.click()"
                @dragover.prevent
                @drop="onFileDrop"
              >
                <Upload class="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                <p class="text-sm">点击或拖拽上传图片</p>
                <p class="text-xs text-muted-foreground mt-0.5">PNG / JPG / SVG (≤ 5MB)</p>
                <input
                  id="hiddenFileInput"
                  ref="fileInput"
                  type="file"
                  accept="image/*"
                  class="hidden"
                  @change="onFileSelect"
                />
              </div>
              <div
                v-else
                class="flex items-center justify-between bg-primary/10 rounded-lg px-3 py-2"
              >
                <span class="text-sm truncate">{{ uploadedFileName }}</span>
                <Button variant="ghost" size="icon" class="h-7 w-7 shrink-0" @click="clearUploadedImage">
                  <span class="text-destructive text-lg leading-none">&times;</span>
                </Button>
              </div>
            </div>
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
                <span class="text-sm tabular-nums text-muted-foreground">{{ iconSize }}px</span>
              </div>
              <input
                type="range"
                min="20"
                max="500"
                step="2"
                :value="iconSize"
                @input="iconSize = +($event.target as HTMLInputElement).value; nextTick(() => drawCanvas())"
                class="w-full h-1.5 bg-secondary rounded-full appearance-none cursor-pointer accent-primary"
              />
              <div class="flex justify-between text-xs text-muted-foreground">
                <span>20</span>
                <span>500</span>
              </div>
            </div>

            <div v-if="!isUsingUploadedImage" class="space-y-2">
              <div class="flex items-center justify-between">
                <span class="text-sm flex items-center gap-1.5">
                  <Palette class="h-3.5 w-3.5 text-muted-foreground" />
                  图标颜色
                </span>
                <input
                  type="color"
                  v-model="customColor"
                  :disabled="colorMode !== 'custom'"
                  class="w-7 h-7 rounded-full border border-input cursor-pointer p-0.5 disabled:opacity-30 disabled:cursor-not-allowed"
                  @input="colorMode === 'custom' && nextTick(() => drawCanvas())"
                />
              </div>
              <div class="flex gap-4">
                <label class="flex items-center gap-1.5 text-sm cursor-pointer">
                  <input
                    type="radio"
                    value="original"
                    v-model="colorMode"
                    class="accent-primary"
                    @change="nextTick(() => drawCanvas())"
                  />
                  默认
                </label>
                <label class="flex items-center gap-1.5 text-sm cursor-pointer">
                  <input
                    type="radio"
                    value="custom"
                    v-model="colorMode"
                    class="accent-primary"
                    @change="nextTick(() => drawCanvas())"
                  />
                  自定义
                </label>
              </div>
            </div>

            <div class="space-y-2">
              <span class="text-sm">导出文件名</span>
              <div class="flex items-center">
                <Input
                  v-model="filename"
                  placeholder="article-cover"
                  class="h-9 rounded-r-none"
                />
                <span class="inline-flex items-center h-9 px-2.5 rounded-r-md border border-l-0 border-input bg-muted/50 text-xs text-muted-foreground whitespace-nowrap">
                  .png/.webp
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>

    <!-- Click-outside to close format menu -->
    <div v-if="showFormatMenu" class="fixed inset-0 z-[5]" @click="closeFormatMenu" />
  </div>
</template>
