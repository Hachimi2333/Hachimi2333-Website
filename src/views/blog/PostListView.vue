<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Search, Calendar, FolderOpen, FileText, Archive, Tag } from 'lucide-vue-next'
import { getAllPosts, searchPosts, getArchivesByYear } from '@/lib/blog'
import { formatDate, formatMonthDay } from '@/lib/date'

const router = useRouter()
const activeTab = ref('articles')
const searchQuery = ref('')

const allPosts = getAllPosts()

const filteredPosts = computed(() => {
  if (searchQuery.value) {
    return searchPosts(searchQuery.value)
  }
  return allPosts
})

const yearArchives = computed(() => getArchivesByYear())

function extractDescription(post: { description: string; content: string }): string {
  if (post.description) return post.description
  const lines = post.content
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith('#') && !l.startsWith('!') && !l.startsWith('---'))
  const first = lines[0] || ''
  return first.replace(/\*\*|__|\*|_|\[.*?\]\(.*?\)|`{1,3}/g, '').slice(0, 120)
}
</script>

<template>
  <div class="container mx-auto max-w-4xl px-4 py-8 relative">
    <!-- Header -->
    <div class="mb-6">
      <h1 class="text-3xl font-bold tracking-tight mb-2">博客</h1>
    </div>

    <!-- Tabs + Search -->
    <Tabs v-model="activeTab" class="mb-6">
      <div class="flex flex-col sm:flex-row sm:items-center gap-3">
        <TabsList class="w-full sm:w-auto [&>button]:flex-1">
          <TabsTrigger value="articles">
            <FileText class="mr-1.5 h-3.5 w-3.5" />
            文章
          </TabsTrigger>
          <TabsTrigger value="archives">
            <Archive class="mr-1.5 h-3.5 w-3.5" />
            归档
          </TabsTrigger>
        </TabsList>

        <Transition name="search-fade">
          <div v-if="activeTab === 'articles'" class="relative w-full sm:flex-1 sm:max-w-xs sm:ml-auto">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              v-model="searchQuery"
              placeholder="搜索文章..."
              class="pl-9"
            />
          </div>
        </Transition>
      </div>

      <!-- Articles Tab -->
      <TabsContent value="articles">
        <div class="space-y-4 mt-4">
          <Card
            v-for="post in filteredPosts"
            :key="post.slug"
            class="group cursor-pointer overflow-hidden"
            @click="router.push(`/posts/${post.slug}`)"
          >
            <div class="md:flex">
              <div class="flex-1 flex flex-col p-5 min-w-0">
                <h2 class="text-lg font-semibold leading-snug line-clamp-2 mb-2">
                  {{ post.title }}
                </h2>

                <div class="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
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

                <p class="text-sm text-muted-foreground mt-2 line-clamp-2 leading-relaxed">
                  {{ extractDescription(post) }}
                </p>
              </div>

              <div
                v-if="post.image"
                class="md:w-56 shrink-0 overflow-hidden"
              >
                <img
                  :src="post.image"
                  :alt="post.title"
                  class="w-full h-48 md:h-full object-cover"
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

      <!-- Archives Tab -->
      <TabsContent value="archives">
        <div class="mt-4 space-y-6">
          <div v-for="group in yearArchives" :key="group.year">
            <!-- Year header -->
            <div class="flex items-center gap-3 mb-3">
              <div class="w-2.5 h-2.5 rounded-full bg-primary"></div>
              <h3 class="text-lg font-semibold text-foreground">{{ group.label }}年</h3>
              <Badge variant="outline" class="font-normal">{{ group.posts.length }} 篇</Badge>
            </div>

            <!-- Posts in this year -->
            <div class="space-y-1 ml-3.5 border-l-2 border-border pl-5 pb-2">
              <div
                v-for="post in group.posts"
                :key="post.slug"
                class="group relative flex items-center gap-3 py-2 cursor-pointer"
                @click="router.push(`/posts/${post.slug}`)"
              >
                <!-- Timeline dot -->
                <div class="absolute -left-[1.45rem] top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-border group-hover:bg-primary transition-colors ring-2 ring-background"></div>

                <span class="text-xs text-muted-foreground font-mono w-12 shrink-0">{{ formatMonthDay(post.published) }}</span>
                <span class="text-sm font-medium text-foreground min-w-0 truncate">
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
