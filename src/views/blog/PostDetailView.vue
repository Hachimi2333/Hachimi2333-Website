<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from '@/components/ui/breadcrumb'
import { Calendar, Tag, FolderOpen, ArrowLeft, Clock } from 'lucide-vue-next'
import { getPostBySlug } from '@/lib/blog'
import { renderMarkdown } from '@/lib/markdown'
import { formatDate } from '@/lib/date'
import ImageLightbox from '@/components/ui/ImageLightbox.vue'
import type { BlogPost } from '@/types/blog'

const route = useRoute()
const router = useRouter()
const post = ref<BlogPost | undefined>()
const renderedContent = ref('')
const readingTime = ref('')

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

function loadPost() {
  const slug = route.params.slug as string
  post.value = getPostBySlug(slug)
  if (post.value) {
    document.title = `${post.value.title} - Hachimi2333`
    renderedContent.value = renderMarkdown(post.value.content)
    updateReadingTime(post.value.content)
  } else {
    document.title = '文章未找到 - Hachimi2333'
  }
}

async function highlightCode() {
  try {
    const { codeToHtml } = await import('shiki')
    await new Promise(resolve => setTimeout(resolve, 50))
    const codeBlocks = document.querySelectorAll('pre code.shiki-code')
    for (const block of codeBlocks) {
      const lang = Array.from(block.classList)
        .find((c) => c.startsWith('language-'))
        ?.replace('language-', '') || 'text'
      const text = block.textContent || ''
      try {
        const isDark = document.documentElement.classList.contains('dark')
        const html = await codeToHtml(text, {
          lang,
          theme: isDark ? 'github-dark' : 'github-light',
        })
        const pre = block.parentElement
        if (pre) {
          pre.outerHTML = html
        }
      } catch {
        // Fallback: keep the unhighlighted code block
      }
    }
  } catch {
    // Shiki not available, keep plain code blocks
  }
}

onMounted(async () => {
  loadPost()
  await highlightCode()
})

watch(() => route.params.slug, async () => {
  loadPost()
  await highlightCode()
})
</script>

<template>
  <div class="container mx-auto max-w-4xl px-4 py-8">
    <template v-if="post">
      <!-- Breadcrumb -->
      <Breadcrumb class="mb-6">
        <BreadcrumbItem>
          <BreadcrumbLink @click="router.push('/')" class="cursor-pointer">首页</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink @click="router.push('/posts')" class="cursor-pointer">博客</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>{{ post.title }}</BreadcrumbPage>
        </BreadcrumbItem>
      </Breadcrumb>

      <!-- Post Header -->
      <header class="mb-6 pb-6 border-b">
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
      <Card>
        <CardContent class="pt-6">
          <!-- Cover Image -->
          <div v-if="post.image" class="mb-8 rounded-lg overflow-hidden">
            <img
              :src="post.image"
              :alt="post.title"
              class="w-full max-h-96 object-cover cursor-zoom-in"
              loading="lazy"
            />
          </div>

          <article class="prose max-w-none" v-html="renderedContent" @click="handleArticleClick" />
        </CardContent>
      </Card>

      <!-- Back to list -->
      <div class="mt-6 pt-6 border-t">
        <Button variant="ghost" @click="router.push('/posts')">
          <ArrowLeft class="mr-2 h-4 w-4" />
          返回文章列表
        </Button>
      </div>
    </template>

    <!-- Not found -->
    <template v-else>
      <div class="text-center py-24">
        <h1 class="text-2xl font-bold mb-2">文章未找到</h1>
        <p class="text-muted-foreground mb-6">你访问的文章不存在</p>
        <Button @click="router.push('/posts')">
          <ArrowLeft class="mr-2 h-4 w-4" />
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
