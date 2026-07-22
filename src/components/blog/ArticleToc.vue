<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useWindowScroll } from '@vueuse/core'
import { List, X } from 'lucide-vue-next'
import { Card, CardContent } from '@/components/ui/card'

interface TocHeading {
  level: number
  id: string
  text: string
}

const props = defineProps<{
  headings: TocHeading[]
}>()

const activeId = ref('')
const panelOpen = ref(false)
const { y } = useWindowScroll()
const scrolled = computed(() => y.value > 300)

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '')
}

const tocItems = computed(() =>
  props.headings.map((h) => ({
    ...h,
    display: stripHtml(h.text),
    indent: h.level - 2,
  }))
)

let observer: IntersectionObserver | null = null

function setupObserver() {
  if (observer) observer.disconnect()
  const ids = props.headings.map((h) => h.id)
  const elements = ids
    .map((id) => document.getElementById(id))
    .filter(Boolean) as HTMLElement[]
  if (!elements.length) return

  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          activeId.value = entry.target.id
        }
      }
    },
    { rootMargin: '-80px 0px -70% 0px', threshold: 0 }
  )
  elements.forEach((el) => observer!.observe(el))
}

function scrollToHeading(id: string) {
  const el = document.getElementById(id)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    panelOpen.value = false
  }
}

watch(() => props.headings, async () => {
  await nextTick()
  setupObserver()
})

onMounted(() => {
  nextTick(() => setupObserver())
})

onUnmounted(() => {
  if (observer) observer.disconnect()
})
</script>

<template>
  <!-- Desktop: sticky Card in the right column -->
  <aside
    v-if="headings.length > 0"
    class="hidden lg:block w-56 shrink-0"
  >
    <Card class="sticky top-20">
      <CardContent class="py-4 max-h-[calc(100vh-6rem)] overflow-y-auto">
        <p class="text-sm font-medium text-foreground mb-3">目录</p>
        <ul class="space-y-1 border-l border-border">
          <li v-for="item in tocItems" :key="item.id">
            <button
              class="block w-full text-left text-sm py-1 border-l -ml-px transition-colors cursor-pointer"
              :class="[
                activeId === item.id
                  ? 'border-primary text-foreground font-medium'
                  : 'border-transparent text-muted-foreground hover:text-foreground',
              ]"
              :style="{ paddingLeft: `${(item.indent * 12) + 12}px` }"
              @click="scrollToHeading(item.id)"
            >
              {{ item.display }}
            </button>
          </li>
        </ul>
      </CardContent>
    </Card>
  </aside>

  <!-- Mobile floating button -->
  <Transition name="toc-btn">
    <button
      v-if="headings.length > 0"
      class="fixed z-[100] right-4 sm:right-8 flex items-center justify-center w-10 h-10 rounded-none bg-background border border-border shadow-sm hover:bg-accent transition-all duration-200 lg:hidden"
      :class="scrolled ? 'bottom-20' : 'bottom-8'"
      @click="panelOpen = true"
      aria-label="文章目录"
    >
      <List class="w-5 h-5 text-foreground" />
    </button>
  </Transition>

  <!-- Mobile slide-in panel -->
  <Teleport to="body">
    <Transition name="toc-panel">
      <div
        v-if="panelOpen"
        class="fixed inset-0 z-[60] lg:hidden"
        @click.self="panelOpen = false"
      >
        <div class="absolute inset-0 bg-black/40" @click="panelOpen = false" />

        <div class="absolute top-0 right-0 h-full w-72 max-w-[80vw] bg-background border-l border-border shadow-2xl flex flex-col">
          <div class="flex items-center justify-between px-5 py-4 border-b border-border">
            <p class="text-sm font-semibold text-foreground">目录</p>
            <button
              class="flex items-center justify-center w-8 h-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              @click="panelOpen = false"
              aria-label="关闭"
            >
              <X class="w-4 h-4" />
            </button>
          </div>
          <ul class="flex-1 overflow-y-auto py-2">
            <li v-for="item in tocItems" :key="item.id">
              <button
                class="w-full text-left text-sm px-5 py-2 transition-colors cursor-pointer border-l-2"
                :class="[
                  activeId === item.id
                    ? 'text-foreground font-medium border-primary bg-accent/60'
                    : 'text-muted-foreground border-transparent hover:text-foreground hover:bg-accent/40',
                ]"
                :style="{ paddingLeft: `${(item.indent * 12) + 20}px` }"
                @click="scrollToHeading(item.id)"
              >
                {{ item.display }}
              </button>
            </li>
          </ul>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.toc-btn-enter-active,
.toc-btn-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.toc-btn-enter-from,
.toc-btn-leave-to {
  opacity: 0;
  transform: translateY(8px);
}

.toc-panel-enter-active,
.toc-panel-leave-active {
  transition: opacity 0.2s ease;
}
.toc-panel-enter-active > div:last-child,
.toc-panel-leave-active > div:last-child {
  transition: transform 0.2s ease;
}
.toc-panel-enter-from,
.toc-panel-leave-to {
  opacity: 0;
}
.toc-panel-enter-from > div:last-child {
  transform: translateX(100%);
}
.toc-panel-leave-to > div:last-child {
  transform: translateX(100%);
}
</style>
