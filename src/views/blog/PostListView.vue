<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { SearchIcon, XIcon, FileTextIcon } from '@lucide/vue'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@/components/ui/input-group'
import PageContainer from '@/components/layout/PageContainer.vue'
import PageHeader from '@/components/layout/PageHeader.vue'
import { filterPosts, getAllCategories, getAllPosts, groupPostsByYear } from '@/lib/blog'
import { postUrl } from '@/lib/blog/paths'
import { formatDate } from '@/lib/date'

const route = useRoute()
const router = useRouter()

const allPosts = getAllPosts()
const categories = getAllCategories()

function readQuery() {
  const q = route.query.q
  const category = route.query.category
  return {
    search: typeof q === 'string' ? q : '',
    category: typeof category === 'string' && category ? category : null,
  }
}

const initial = readQuery()
const search = ref(initial.search)
const category = ref<string | null>(initial.category)

/**
 * The URL is the source of truth for the filter state.
 *
 * The previous list page derived pagination from `?page=` for exactly this
 * reason -- back/forward has to restore what the visitor was looking at -- and
 * a filtered list is worth sharing as a link.
 */
watch(
  () => [route.query.q, route.query.category],
  () => {
    const next = readQuery()
    if (next.search !== search.value) search.value = next.search
    if (next.category !== category.value) category.value = next.category
  },
)

watch([search, category], () => {
  const query: Record<string, string> = {}
  if (search.value) query.q = search.value
  if (category.value) query.category = category.value
  void router.replace({ query })
})

const matched = computed(() => filterPosts({ search: search.value, category: category.value }))
const groups = computed(() => groupPostsByYear(matched.value))

const filtersActive = computed(() => search.value !== '' || category.value !== null)

const summary = computed(() => {
  const total = `共 ${allPosts.length} 篇文章`
  const newest = allPosts[0]
  return newest ? `${total}，最近更新于 ${formatDate(newest.published)}` : total
})

function clearFilters() {
  search.value = ''
  category.value = null
}
</script>

<template>
  <PageContainer>
    <PageHeader title="博客" :description="summary" />

    <div class="mt-6 flex flex-col gap-3">
      <InputGroup class="h-9 w-full sm:max-w-xs">
        <InputGroupAddon>
          <SearchIcon />
        </InputGroupAddon>
        <InputGroupInput v-model="search" type="search" placeholder="搜索标题、分类或标签" />
        <InputGroupAddon v-if="search" align="inline-end">
          <InputGroupButton size="icon-xs" aria-label="清空搜索" @click="search = ''">
            <XIcon />
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>

      <div class="flex flex-wrap gap-1.5">
        <Button
          size="sm"
          :variant="category === null ? 'default' : 'outline'"
          @click="category = null"
        >
          全部
        </Button>
        <Button
          v-for="name in categories"
          :key="name"
          size="sm"
          :variant="category === name ? 'default' : 'outline'"
          @click="category = name"
        >
          {{ name }}
        </Button>
      </div>
    </div>

    <div v-if="groups.length" class="mt-8 flex flex-col gap-6">
      <section v-for="group in groups" :key="group.year">
        <h2
          class="sticky top-14 z-10 flex items-baseline gap-2 bg-background py-2 text-base font-semibold tracking-tight"
        >
          {{ group.year }}
          <span class="text-sm font-normal text-muted-foreground">
            {{ group.posts.length }} 篇
          </span>
        </h2>

        <ul class="flex flex-col divide-y divide-border/60 border-t border-border/60">
          <li v-for="post in group.posts" :key="post.slug">
            <router-link :to="postUrl(post.slug)" class="group flex gap-4 py-4">
              <img
                v-if="post.image"
                :src="post.image"
                alt=""
                loading="lazy"
                decoding="async"
                class="hidden size-20 shrink-0 rounded-lg object-cover sm:block"
              />

              <div class="flex min-w-0 flex-1 flex-col gap-1.5">
                <h3
                  class="text-lg font-semibold tracking-tight text-foreground transition-colors group-hover:text-primary"
                >
                  {{ post.title }}
                </h3>

                <p class="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                  {{ post.excerpt }}
                </p>

                <div
                  class="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground"
                >
                  <time :datetime="post.published">{{ formatDate(post.published) }}</time>
                  <span aria-hidden="true">·</span>
                  <span>{{ post.category }}</span>
                  <span aria-hidden="true">·</span>
                  <span>{{ post.readingTime }} 分钟</span>
                  <Badge v-for="tag in post.tags" :key="tag" variant="secondary">
                    {{ tag }}
                  </Badge>
                </div>
              </div>
            </router-link>
          </li>
        </ul>
      </section>
    </div>

    <div
      v-else
      class="mt-16 flex flex-col items-center gap-3 text-center text-muted-foreground"
    >
      <FileTextIcon class="size-10 opacity-30" />
      <div class="flex flex-col gap-1">
        <p class="text-base font-medium text-foreground">没有匹配的文章</p>
        <p class="text-sm">换一个关键词，或者清除筛选条件</p>
      </div>
      <Button v-if="filtersActive" variant="outline" size="sm" class="mt-1" @click="clearFilters">
        清除筛选
      </Button>
    </div>
  </PageContainer>
</template>
