<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { ChevronDownIcon, ListIcon } from '@lucide/vue'
import type { TocHeading } from '@/lib/blog/renderer'

const props = withDefaults(
  defineProps<{
    headings: TocHeading[]
    /** `rail` is the sticky desktop sidebar; `inline` is the mobile disclosure. */
    variant?: 'rail' | 'inline'
  }>(),
  { variant: 'rail' },
)

const activeId = ref('')
const expanded = ref(false)

const items = computed(() =>
  props.headings.map((heading) => ({ ...heading, indent: Math.max(0, heading.level - 2) })),
)

let observer: IntersectionObserver | null = null

function setupObserver() {
  observer?.disconnect()
  if (typeof document === 'undefined' || props.headings.length === 0) return

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
    // Discount the sticky header, otherwise the "active" heading is always the
    // one that just scrolled underneath it.
    { rootMargin: '-88px 0px -70% 0px', threshold: 0 },
  )

  for (const element of elements) observer.observe(element)
}

function goTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  expanded.value = false
}

onMounted(() => {
  void nextTick(setupObserver)
})

watch(
  () => props.headings,
  async () => {
    await nextTick()
    setupObserver()
  },
)

onBeforeUnmount(() => {
  observer?.disconnect()
})
</script>

<template>
  <div>
    <!-- Desktop: sticky rail in the article grid's second column. -->
    <nav v-if="variant === 'rail'" class="sticky top-20" aria-label="文章目录">
      <p class="mb-3 text-xs font-medium tracking-wide text-muted-foreground">目录</p>
      <ul class="flex flex-col border-l border-border">
        <li v-for="item in items" :key="item.id">
          <button
            type="button"
            class="-ml-px block w-full cursor-pointer border-l py-1 pr-2 text-left text-xs leading-relaxed transition-colors"
            :class="
              activeId === item.id
                ? 'border-primary font-medium text-foreground'
                : 'border-transparent text-muted-foreground hover:border-border hover:text-foreground'
            "
            :style="{ paddingLeft: `${item.indent * 10 + 12}px` }"
            @click="goTo(item.id)"
          >
            {{ item.text }}
          </button>
        </li>
      </ul>
    </nav>

    <!-- Mobile: a disclosure above the body. The old floating button used a
         `<Teleport to="body">`, which SSR cannot render into the target and the
         client then has to re-create during hydration. -->
    <div v-else class="flex flex-col">
      <button
        type="button"
        class="flex w-full cursor-pointer items-center justify-between rounded-lg border border-border/60 px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
        :aria-expanded="expanded"
        @click="expanded = !expanded"
      >
        <span class="flex items-center gap-2">
          <ListIcon class="size-4" />
          目录
          <span class="text-xs">({{ items.length }})</span>
        </span>
        <ChevronDownIcon
          class="size-4 transition-transform"
          :class="expanded ? 'rotate-180' : ''"
        />
      </button>

      <ul v-show="expanded" class="mt-2 flex flex-col border-l border-border">
        <li v-for="item in items" :key="item.id">
          <button
            type="button"
            class="-ml-px block w-full cursor-pointer border-l py-1.5 pr-2 text-left text-sm leading-relaxed transition-colors"
            :class="
              activeId === item.id
                ? 'border-primary font-medium text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            "
            :style="{ paddingLeft: `${item.indent * 10 + 12}px` }"
            @click="goTo(item.id)"
          >
            {{ item.text }}
          </button>
        </li>
      </ul>
    </div>
  </div>
</template>
