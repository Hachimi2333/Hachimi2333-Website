<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  ArchiveIcon,
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  FileTextIcon,
  FolderOpenIcon,
  SearchIcon,
  TagIcon,
} from '@lucide/vue'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import PageBreadcrumb from '@/components/layout/PageBreadcrumb.vue'
import { getAllPosts, getArchivesByYear, searchPosts } from '@/lib/blog'
import { POSTS_ROUTE } from '@/lib/blog-paths'
import { formatDate, formatMonthDay } from '@/lib/date'

const route = useRoute()
const router = useRouter()

const PAGE_SIZE = 5

const activeTab = ref('articles')
const searchQuery = ref('')

const allPosts = getAllPosts()
const filteredPosts = computed(() =>
  searchQuery.value ? searchPosts(searchQuery.value) : allPosts,
)

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredPosts.value.length / PAGE_SIZE)),
)

/**
 * Current page, derived from the URL.
 *
 * Reading from the route (instead of a local ref seeded once) is what makes the
 * browser back/forward buttons move between pages correctly, and clamping to
 * `totalPages` stops a hand-edited `?page=99` from rendering an empty list.
 */
const currentPage = computed({
  get() {
    const requested = Number(route.query.page)
    const page = Number.isInteger(requested) && requested > 0 ? requested : 1
    return Math.min(page, totalPages.value)
  },
  set(page: number) {
    void router.push({
      query: { ...route.query, page: page > 1 ? String(page) : undefined },
    })
  },
})

const paginatedPosts = computed(() => {
  const start = (currentPage.value - 1) * PAGE_SIZE
  return filteredPosts.value.slice(start, start + PAGE_SIZE)
})

const yearArchives = computed(() => getArchivesByYear())

// A new search must start from page 1, otherwise the query string would keep a
// stale page number that no longer exists in the result set.
watch(searchQuery, () => {
  if (route.query.page) {
    void router.replace({ query: { ...route.query, page: undefined } })
  }
})

function openPost(slug: string) {
  void router.push(`${POSTS_ROUTE}/${slug}`)
}

function extractDescription(post: { description: string; content: string }): string {
  if (post.description) return post.description
  const first = post.content
    .split('\n')
    .map((line) => line.trim())
    .find((line) => line && !line.startsWith('#') && !line.startsWith('!') && !line.startsWith('---'))
  return (first ?? '').replace(/\*\*|__|\*|_|\[.*?\]\(.*?\)|`{1,3}/g, '').slice(0, 120)
}
</script>

<template>
  <div class="container mx-auto max-w-4xl px-4 py-8">
    <PageBreadcrumb :items="[{ label: '首页', to: '/' }, { label: '博客' }]" />

    <div class="mb-6">
      <h1 class="text-3xl font-bold tracking-tight">博客</h1>
    </div>

    <Tabs v-model="activeTab" class="mb-6">
      <div class="flex items-center gap-2">
        <TabsList>
          <TabsTrigger value="articles">
            <FileTextIcon data-icon="inline-start" />
            文章
          </TabsTrigger>
          <TabsTrigger value="archives">
            <ArchiveIcon data-icon="inline-start" />
            归档
          </TabsTrigger>
        </TabsList>

        <Transition name="search-fade">
          <div v-if="activeTab === 'articles'" class="min-w-0 flex-1">
            <InputGroup class="h-8">
              <InputGroupInput v-model="searchQuery" placeholder="搜索文章..." />
              <InputGroupAddon>
                <SearchIcon />
              </InputGroupAddon>
            </InputGroup>
          </div>
        </Transition>
      </div>
    </Tabs>

    <Transition name="tab-fade" mode="out-in">
      <!-- Articles -->
      <div v-if="activeTab === 'articles'" key="articles" class="flex flex-col gap-4">
        <Card
          v-for="post in paginatedPosts"
          :key="post.slug"
          class="cursor-pointer overflow-hidden py-0 transition-colors hover:bg-accent/40"
          @click="openPost(post.slug)"
        >
          <div class="md:flex">
            <div class="flex min-w-0 flex-1 flex-col gap-2 p-5">
              <h2 class="line-clamp-2 text-lg font-semibold leading-snug">
                {{ post.title }}
              </h2>

              <div class="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                <span class="inline-flex items-center gap-1">
                  <CalendarIcon class="size-3.5 shrink-0" />
                  {{ formatDate(post.published) }}
                </span>
                <span v-if="post.category" class="inline-flex items-center gap-1">
                  <FolderOpenIcon class="size-3.5 shrink-0" />
                  {{ post.category }}
                </span>
              </div>

              <div v-if="post.tags.length" class="flex flex-wrap items-center gap-1.5">
                <Badge v-for="tag in post.tags" :key="tag" variant="secondary">
                  <TagIcon class="size-3" />
                  {{ tag }}
                </Badge>
              </div>

              <p class="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                {{ extractDescription(post) }}
              </p>
            </div>

            <div v-if="post.image" class="shrink-0 overflow-hidden md:w-56">
              <img
                :src="post.image"
                :alt="post.title"
                class="h-48 w-full object-cover md:h-full"
                loading="lazy"
                decoding="async"
              />
            </div>
          </div>
        </Card>

        <div
          v-if="filteredPosts.length === 0"
          class="flex flex-col items-center gap-2 py-16 text-center text-muted-foreground"
        >
          <FileTextIcon class="size-12 opacity-20" />
          <p class="text-lg">没有找到相关文章</p>
          <p class="text-sm">试试其他关键词</p>
        </div>

        <Pagination
          v-if="filteredPosts.length > PAGE_SIZE"
          v-model:page="currentPage"
          :total="filteredPosts.length"
          :items-per-page="PAGE_SIZE"
          :sibling-count="1"
          class="mt-2"
        >
          <PaginationContent v-slot="{ items }">
            <PaginationPrevious>
              <ChevronLeftIcon data-icon="inline-start" />
              <span class="hidden sm:inline">上一页</span>
            </PaginationPrevious>

            <template v-for="(item, index) in items" :key="index">
              <PaginationItem
                v-if="item.type === 'page'"
                :value="item.value"
                :is-active="item.value === currentPage"
              >
                {{ item.value }}
              </PaginationItem>
              <PaginationEllipsis v-else />
            </template>

            <PaginationNext>
              <span class="hidden sm:inline">下一页</span>
              <ChevronRightIcon data-icon="inline-end" />
            </PaginationNext>
          </PaginationContent>
        </Pagination>
      </div>

      <!-- Archives -->
      <div v-else key="archives" class="flex flex-col gap-6">
        <div v-for="group in yearArchives" :key="group.year" class="flex flex-col gap-3">
          <div class="ml-[0.6875rem] flex items-center gap-3">
            <div class="size-2.5 shrink-0 rounded-full bg-primary" />
            <h3 class="text-lg font-semibold text-foreground">{{ group.label }}年</h3>
            <Badge variant="outline">{{ group.posts.length }} 篇</Badge>
          </div>

          <div class="ml-3.5 flex flex-col gap-1 border-l-2 border-border pb-2 pl-5">
            <div
              v-for="post in group.posts"
              :key="post.slug"
              class="group relative flex cursor-pointer items-center gap-3 py-2"
              @click="openPost(post.slug)"
            >
              <div
                class="absolute top-1/2 -left-[1.45rem] size-1.5 -translate-y-1/2 rounded-full bg-border ring-2 ring-background group-hover:bg-primary"
              />

              <span class="w-12 shrink-0 font-mono text-xs text-muted-foreground">
                {{ formatMonthDay(post.published) }}
              </span>
              <span class="min-w-0 truncate text-sm font-medium text-foreground">
                {{ post.title }}
              </span>
              <div class="ml-auto flex shrink-0 items-center gap-1">
                <Badge v-for="tag in post.tags" :key="tag" variant="secondary">
                  <TagIcon class="size-3" />
                  {{ tag }}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        <div
          v-if="yearArchives.length === 0"
          class="flex flex-col items-center gap-2 py-16 text-center text-muted-foreground"
        >
          <ArchiveIcon class="size-12 opacity-20" />
          <p class="text-lg">暂无归档文章</p>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.tab-fade-enter-active,
.tab-fade-leave-active {
  transition: opacity 0.2s ease;
}
.tab-fade-enter-from,
.tab-fade-leave-to {
  opacity: 0;
}

.search-fade-enter-active,
.search-fade-leave-active {
  transition: opacity 0.2s ease;
}
.search-fade-enter-from,
.search-fade-leave-to {
  opacity: 0;
}
</style>
