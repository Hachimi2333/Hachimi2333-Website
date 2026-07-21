<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import PageBreadcrumb from '@/components/layout/PageBreadcrumb.vue'
import { Calendar, Tag, FolderOpen, ArrowLeft, Clock } from 'lucide-vue-next'
import { getPostBySlug } from '@/lib/blog'
import { renderMarkdown } from '@/lib/markdown'
import { formatDate } from '@/lib/date'
import ImageLightbox from '@/components/ui/ImageLightbox.vue'
import ArticleToc from '@/components/blog/ArticleToc.vue'
import { getHeadingList, resetHeadings } from 'marked-gfm-heading-id'
import type { BlogPost } from '@/types/blog'

const route = useRoute()
const router = useRouter()
const post = ref<BlogPost | undefined>()
const renderedContent = ref('')
const readingTime = ref('')
const tocHeadings = ref<{ level: number; id: string; text: string }[]>([])

const lightboxVisible = ref(false)
const lightboxSrc = ref('')
const lightboxAlt = ref('')

function openLightbox(src: string, alt?: string) {
  lightboxSrc.value = src
  lightboxAlt.value = alt || ''
  lightboxVisible.value = true
}

function closeLightbox() {
  lightboxVisible.value = false
}

function handleArticleClick(e: MouseEvent) {
  const target = e.target as HTMLElement
  const img = target.closest('img')
  if (img && img.closest('.prose')) {
    openLightbox(img.src, img.alt || undefined)
  }
}

function updateReadingTime(content: string) {
  const charCount = content.length
  const minutes = Math.max(1, Math.ceil(charCount / 400))
  readingTime.value = `${minutes} 分钟`
}

async function loadPost() {
  const slug = route.params.slug as string
  post.value = getPostBySlug(slug)
  if (post.value) {
    document.title = `${post.value.title} - Hachimi2333`
    resetHeadings()
    const isDark = document.documentElement.classList.contains('dark')
    renderedContent.value = await renderMarkdown(post.value.content, isDark)
    tocHeadings.value = getHeadingList().filter((h) => h.level >= 2)
    updateReadingTime(post.value.content)
  } else {
    document.title = '文章未找到 - Hachimi2333'
    tocHeadings.value = []
  }
}

onMounted(() => {
  loadPost()
})

watch(() => route.params.slug, () => {
  loadPost()
})
</script>

<template>
  <div class="container mx-auto max-w-4xl px-4 py-8">
    <template v-if="post">
      <!-- Breadcrumb -->
      <PageBreadcrumb :items="[{ label: '首页', to: '/' }, { label: '博客', to: '/posts' }, { label: post.title }]" />

      <!-- Post Header -->
      <header class="mb-6">
        <h1 class="text-3xl md:text-4xl font-bold tracking-tight mb-4">{{ post.title }}</h1>
        <div class="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <div class="flex items-center gap-1.5">
            <Calendar class="h-4 w-4" />
            <span>{{ formatDate(post.published) }}</span>
          </div>
          <div class="flex items-center gap-1.5">
            <Clock class="h-4 w-4" />
            <span>{{ readingTime }}</span>
          </div>
          <div v-if="post.category" class="flex items-center gap-1.5">
            <FolderOpen class="h-4 w-4" />
            <span>{{ post.category }}</span>
          </div>
          <div v-if="post.tags.length" class="flex items-center gap-1.5">
            <Tag class="h-4 w-4" />
            <span>{{ post.tags.join(' / ') }}</span>
          </div>
        </div>
      </header>

      <!-- Post Content -->
      <div class="flex gap-6">
        <Card class="flex-1 min-w-0 max-w-xl py-0">
          <div class="p-5">
            <!-- Cover Image -->
            <div v-if="post.image" class="mb-8 overflow-hidden">
              <img
                :src="post.image"
                :alt="post.title"
                class="w-full max-h-96 object-cover"
                loading="lazy"
              />
            </div>

            <article class="prose max-w-none" v-html="renderedContent" @click="handleArticleClick" />

            <!-- Back to list -->
            <div class="mt-6">
              <Button variant="ghost" @click="router.push('/posts')">
                <ArrowLeft data-icon="inline-start" />
                返回文章列表
              </Button>
            </div>
          </div>
        </Card>

        <!-- TOC -->
        <ArticleToc :headings="tocHeadings" />
      </div>
    </template>

    <!-- Not found -->
    <template v-else>
      <div class="text-center py-24">
        <h1 class="text-2xl font-bold mb-2">文章未找到</h1>
        <p class="text-muted-foreground mb-6">你访问的文章不存在</p>
        <Button @click="router.push('/posts')">
          <ArrowLeft data-icon="inline-start" />
          返回博客
        </Button>
      </div>
    </template>

    <ImageLightbox
      :visible="lightboxVisible"
      :src="lightboxSrc"
      :alt="lightboxAlt"
      @close="closeLightbox"
    />
  </div>
</template>
