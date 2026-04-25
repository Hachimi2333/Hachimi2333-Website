<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Search, Calendar, FolderOpen, FileText, Archive, X, Tag } from 'lucide-vue-next'
import { getAllPosts, getAllCategories, searchPosts, getArchivesByYear } from '@/lib/blog'

const router = useRouter()
const tabsRef = ref<InstanceType<typeof Tabs> | null>(null)
const activeTab = ref('articles')
const searchQuery = ref('')
const archiveCategoryFilter = ref<string | null>(null)

const allPosts = getAllPosts()
const categories = getAllCategories()

const categoryCounts = computed(() => {
  const counts: Record<string, number> = {}
  for (const post of allPosts) {
    if (post.category) {
      counts[post.category] = (counts[post.category] || 0) + 1
    }
  }
  return counts
})

const filteredPosts = computed(() => {
  let result = allPosts

  if (searchQuery.value) {
    result = searchPosts(searchQuery.value)
  }

  if (archiveCategoryFilter.value) {
    result = result.filter((p) => p.category === archiveCategoryFilter.value)
  }

  return result
})

const yearArchives = computed(() => getArchivesByYear(archiveCategoryFilter.value))

watch(archiveCategoryFilter, () => {
  searchQuery.value = ''
})

function formatDate(date: string) {
  if (!date) return ''
  return new Date(date).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })
}

function formatMonthDay(date: string) {
  if (!date) return ''
  const d = new Date(date)
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${m}-${day}`
}

function extractDescription(post: { description: string; content: string }): string {
  if (post.description) return post.description
  const lines = post.content
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith('#') && !l.startsWith('!') && !l.startsWith('---'))
  const first = lines[0] || ''
  return first.replace(/\*\*|__|\*|_|\[.*?\]\(.*?\)|`{1,3}/g, '').slice(0, 120)
}

function selectCategory(cat: string) {
  archiveCategoryFilter.value = cat
  tabsRef.value?.activateTab('archives')
}

function clearCategoryFilter() {
  archiveCategoryFilter.value = null
}


</script>

<template>
  <div class="container mx-auto max-w-4xl px-4 py-8 relative">
    <!-- Header -->
    <div class="mb-6">
      <h1 class="text-3xl font-bold tracking-tight mb-2">博客</h1>
    </div>

    <!-- Tabs + Search -->
    <Tabs ref="tabsRef" v-model="activeTab" class="mb-6">
      <div class="flex items-center gap-4">
        <TabsList>
          <TabsTrigger value="articles">
            <FileText class="mr-1.5 h-3.5 w-3.5" />
            文章
          </TabsTrigger>
          <TabsTrigger value="categories">
            <FolderOpen class="mr-1.5 h-3.5 w-3.5" />
            分类
          </TabsTrigger>
          <TabsTrigger value="archives">
            <Archive class="mr-1.5 h-3.5 w-3.5" />
            归档
          </TabsTrigger>
        </TabsList>

        <div class="flex-1">
          <Transition name="search-fade">
            <div v-if="activeTab === 'articles'" class="relative max-w-xs ml-auto">
              <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                v-model="searchQuery"
                placeholder="搜索文章..."
                class="pl-9"
              />
            </div>
          </Transition>
        </div>
      </div>

      <!-- Articles Tab -->
      <TabsContent value="articles">
        <div class="space-y-5 mt-4">
          <Card
            v-for="post in filteredPosts"
            :key="post.slug"
            class="group cursor-pointer hover:shadow-md transition-all duration-200 overflow-hidden"
            @click="router.push(`/posts/${post.slug}`)"
          >
            <div class="md:flex">
              <div class="flex-1 flex flex-col p-6 min-w-0">
                <h2 class="text-xl font-semibold leading-snug group-hover:text-primary transition-colors line-clamp-2 mb-2">
                  {{ post.title }}
                </h2>

                <div class="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
                  <span class="inline-flex items-center gap-1">
                    <Calendar class="h-3.5 w-3.5 shrink-0" />
                    {{ formatDate(post.published) }}
                  </span>
                  <span v-if="post.category" class="inline-flex items-center gap-1">
                    <FolderOpen class="h-3.5 w-3.5 shrink-0" />
                    {{ post.category }}
                  </span>
                </div>

                <div v-if="post.tags.length" class="flex items-center gap-1.5 flex-wrap mt-2">
                  <Badge
                    v-for="tag in post.tags"
                    :key="tag"
                    variant="secondary"
                    class="text-xs px-1.5 py-0 h-5 gap-0.5"
                  >
                    <Tag class="h-3 w-3" />
                    {{ tag }}
                  </Badge>
                </div>

                <p class="text-sm text-muted-foreground mt-3 line-clamp-2 leading-relaxed">
                  {{ extractDescription(post) }}
                </p>
              </div>

              <div
                v-if="post.image"
                class="md:w-64 shrink-0 overflow-hidden"
              >
                <img
                  :src="post.image"
                  :alt="post.title"
                  class="w-full h-48 md:h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
              </div>
            </div>
          </Card>

          <div v-if="filteredPosts.length === 0" class="text-center py-16 text-muted-foreground">
            <FileText class="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p class="text-lg">没有找到相关文章</p>
            <p class="text-sm mt-1">试试其他关键词或筛选条件</p>
          </div>
        </div>
      </TabsContent>

      <!-- Categories Tab -->
      <TabsContent value="categories">
        <div class="mt-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card
              v-for="cat in categories"
              :key="cat"
              class="group cursor-pointer hover:shadow-md hover:border-primary/30 transition-all duration-200"
              @click="selectCategory(cat)"
            >
              <CardContent class="p-5">
                <div class="flex items-start justify-between mb-3">
                  <div class="flex items-center gap-3">
                    <div class="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-200">
                      <FolderOpen class="h-5 w-5" />
                    </div>
                    <div>
                      <h3 class="font-semibold text-foreground">{{ cat }}</h3>
                      <p class="text-xs text-muted-foreground mt-0.5">{{ categoryCounts[cat] || 0 }} 篇文章</p>
                    </div>
                  </div>
                  <Badge variant="secondary">{{ categoryCounts[cat] || 0 }}</Badge>
                </div>
                <div class="w-full h-1 rounded-full bg-muted overflow-hidden">
                  <div
                    class="h-full rounded-full bg-primary/60 group-hover:bg-primary transition-colors duration-200"
                    :style="{ width: `${Math.min(100, ((categoryCounts[cat] || 0) / allPosts.length) * 100 * 2)}%` }"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div v-if="categories.length === 0" class="text-center py-16 text-muted-foreground">
            <FolderOpen class="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p class="text-lg">暂无分类</p>
          </div>
        </div>
      </TabsContent>

      <!-- Archives Tab -->
      <TabsContent value="archives">
        <div class="mt-4 space-y-6">
          <!-- Category filter -->
          <div v-if="archiveCategoryFilter" class="flex items-center gap-2 text-sm">
            <span class="text-muted-foreground">筛选分类:</span>
            <Badge variant="secondary" class="gap-1">
              <FolderOpen class="h-3 w-3" />
              {{ archiveCategoryFilter }}
              <button
                class="ml-0.5 rounded-full hover:bg-foreground/10 transition-colors"
                @click="clearCategoryFilter"
              >
                <X class="h-3 w-3" />
              </button>
            </Badge>
          </div>

          <div v-for="group in yearArchives" :key="group.year">
            <!-- Year header -->
            <div class="flex items-center gap-3 mb-3">
              <div class="w-3 h-3 rounded-full bg-primary"></div>
              <h3 class="text-lg font-semibold text-foreground">{{ group.label }}年</h3>
              <Badge variant="outline" class="font-normal">{{ group.posts.length }} 篇</Badge>
            </div>

            <!-- Posts in this year -->
            <div class="space-y-1 ml-4 border-l-2 border-border pl-5 pb-2">
              <div
                v-for="post in group.posts"
                :key="post.slug"
                class="group relative flex items-center gap-3 py-2 cursor-pointer"
                @click="router.push(`/posts/${post.slug}`)"
              >
                <!-- Timeline dot -->
                <div class="absolute -left-[1.55rem] top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-border group-hover:bg-primary transition-colors ring-2 ring-background"></div>

                <span class="text-xs text-muted-foreground font-mono w-12 shrink-0">{{ formatMonthDay(post.published) }}</span>
                <span class="text-sm font-medium text-foreground group-hover:text-primary transition-colors min-w-0 truncate">
                  {{ post.title }}
                </span>
                <div class="flex items-center gap-1 shrink-0 ml-auto">
                  <Badge
                    v-for="tag in post.tags"
                    :key="tag"
                    variant="secondary"
                    class="text-xs px-1.5 py-0 h-5 gap-0.5"
                  >
                    <Tag class="h-3 w-3" />
                    {{ tag }}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          <div v-if="yearArchives.length === 0" class="text-center py-16 text-muted-foreground">
            <Archive class="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p class="text-lg">暂无归档文章</p>
          </div>
        </div>
      </TabsContent>
    </Tabs>


  </div>
</template>

<style scoped>
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.search-fade-enter-active,
.search-fade-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.search-fade-enter-from,
.search-fade-leave-to {
  opacity: 0;
  transform: translateX(8px);
}
</style>
