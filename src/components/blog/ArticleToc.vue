<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useWindowScroll } from '@vueuse/core'
import { ListIcon, XIcon } from '@lucide/vue'
import { Card, CardContent } from '@/components/ui/card'
import type { TocHeading } from '@/lib/renderer'

const props = defineProps<{
  headings: TocHeading[]
}>()

const activeId = ref('')
const panelOpen = ref(false)
const { y } = useWindowScroll()
const scrolled = computed(() => y.value > 300)

const tocItems = computed(() =>
  props.headings.map((heading) => ({
    ...heading,
    indent: Math.max(0, heading.level - 2),
  })),
)

let observer: IntersectionObserver | null = null

function setupObserver() {
  observer?.disconnect()

  const elements = props.headings
    .map((heading) => document.getElementById(heading.id))
    .filter((element): element is HTMLElement => element !== null)

  if (elements.length === 0) return

  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) activeId.value = entry.target.id
      }
    },
    { rootMargin: '-80px 0px -70% 0px', threshold: 0 },
  )

  for (const element of elements) observer.observe(element)
}

function scrollToHeading(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  panelOpen.value = false
}

watch(
  () => props.headings,
  async () => {
    await nextTick()
    setupObserver()
  },
)

onMounted(() => {
  void nextTick(setupObserver)
})

onUnmounted(() => {
  observer?.disconnect()
})
</script>

<template>
  <!-- Desktop: sticky card in the right column -->
  <aside v-if="headings.length > 0" class="hidden w-56 shrink-0 lg:block">
    <Card class="sticky top-20">
      <CardContent class="max-h-[calc(100vh-6rem)] overflow-y-auto py-4">
        <p class="mb-3 text-sm font-medium text-foreground">目录</p>
        <ul class="flex flex-col border-l border-border">
          <li v-for="item in tocItems" :key="item.id">
            <button
              type="button"
              class="-ml-px block w-full cursor-pointer border-l py-1 text-left text-sm transition-colors"
              :class="
                activeId === item.id
                  ? 'border-primary font-medium text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              "
              :style="{ paddingLeft: `${item.indent * 12 + 12}px` }"
              @click="scrollToHeading(item.id)"
            >
              {{ item.text }}
            </button>
          </li>
        </ul>
      </CardContent>
    </Card>
  </aside>

  <!-- Mobile floating trigger -->
  <Teleport to="body">
    <button
      v-if="headings.length > 0"
      type="button"
      class="fixed right-4 z-100 flex size-10 items-center justify-center rounded-md border border-border bg-background shadow-sm transition-all duration-200 hover:bg-accent sm:right-8 lg:hidden"
      :class="scrolled ? 'bottom-20' : 'bottom-8'"
      aria-label="文章目录"
      @click="panelOpen = true"
    >
      <ListIcon class="size-5 text-foreground" />
    </button>
  </Teleport>

  <!-- Mobile slide-in panel -->
  <Teleport to="body">
    <Transition name="toc-panel">
      <div v-if="panelOpen" class="fixed inset-0 z-60 lg:hidden" @click.self="panelOpen = false">
        <div class="absolute inset-0 bg-black/40" @click="panelOpen = false" />

        <div class="absolute top-0 right-0 flex h-full w-72 max-w-[80vw] flex-col border-l border-border bg-background shadow-2xl">
          <div class="flex items-center justify-between border-b border-border px-5 py-4">
            <p class="text-sm font-semibold text-foreground">目录</p>
            <button
              type="button"
              class="flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              aria-label="关闭"
              @click="panelOpen = false"
            >
              <XIcon class="size-4" />
            </button>
          </div>
          <ul class="flex-1 overflow-y-auto py-2">
            <li v-for="item in tocItems" :key="item.id">
              <button
                type="button"
                class="w-full cursor-pointer border-l-2 px-5 py-2 text-left text-sm transition-colors"
                :class="
                  activeId === item.id
                    ? 'border-primary bg-accent/60 font-medium text-foreground'
                    : 'border-transparent text-muted-foreground hover:bg-accent/40 hover:text-foreground'
                "
                :style="{ paddingLeft: `${item.indent * 12 + 20}px` }"
                @click="scrollToHeading(item.id)"
              >
                {{ item.text }}
              </button>
            </li>
          </ul>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
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
