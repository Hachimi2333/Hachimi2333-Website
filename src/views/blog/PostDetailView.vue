<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useWindowScroll } from '@vueuse/core'
import { ArrowLeft, Calendar, Clock, FolderOpen, Tag } from '@lucide/vue'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import PageBreadcrumb from '@/components/layout/PageBreadcrumb.vue'
import ArticleToc from '@/components/blog/ArticleToc.vue'
import ImageLightbox from '@/components/common/ImageLightbox.vue'
import { getPostBySlug } from '@/lib/blog'
import { renderMarkdown, type TocHeading } from '@/lib/blog/markdown'
import { formatDate } from '@/lib/date'
import type { BlogPost } from '@/types/blog'

const route = useRoute()
const router = useRouter()
const { y: scrollY } = useWindowScroll()

const post = ref<BlogPost>()
const renderedContent = ref('')
const readingTime = ref('')
const tocHeadings = ref<TocHeading[]>([])
const loading = ref(true)

const scrolled = computed(() => scrollY.value > 300)
const hasToc = computed(() => tocHeadings.value.length > 0)
const backAtRight = computed(() => !hasToc.value && !scrolled.value)

/**
 * Guards against out-of-order renders.
 *
 * `renderMarkdown` is async, so navigating quickly between two posts can let an
 * older render resolve after a newer one and overwrite it with the wrong body.
 * Only the most recently started render is allowed to commit.
 */
let renderToken = 0

const lightboxVisible = ref(false)
const lightboxSrc = ref('')
const lightboxAlt = ref('')

function goBack() {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/posts')
  }
}

function openLightbox(src: string, alt?: string) {
  lightboxSrc.value = src
  lightboxAlt.value = alt ?? ''
  lightboxVisible.value = true
}

function closeLightbox() {
  lightboxVisible.value = false
}

/**
 * Read the plain text of a highlighted block.
 *
 * Shiki wraps every source line in a `.line` span; plain (unhighlighted) blocks
 * have none, so fall back to the code element's text content.
 */
function readCodeText(button: HTMLButtonElement): string {
  const code = button.closest('pre')?.querySelector('code')
  if (!code) return ''

  const lines = code.querySelectorAll('.line')
  if (lines.length === 0) return (code.textContent ?? '').trimEnd()

  return Array.from(lines)
    .map((line) => line.textContent ?? '')
    .join('\n')
    .replace(/\n$/, '')
}

async function copyCode(button: HTMLButtonElement) {
  const text = readCodeText(button)
  if (!text) return

  try {
    await navigator.clipboard.writeText(text)
  } catch {
    // Clipboard blocked (insecure context or denied permission): stay silent.
    return
  }

  button.textContent = '✓'
  button.classList.add('copied')
  window.setTimeout(() => {
    button.textContent = '⧉'
    button.classList.remove('copied')
  }, 1500)
}

/** Delegated click handler for everything inside the rendered article. */
function handleArticleClick(event: MouseEvent) {
  const target = event.target as HTMLElement

  const copyButton = target.closest<HTMLButtonElement>('[data-copy-code]')
  if (copyButton) {
    void copyCode(copyButton)
    return
  }

  const image = target.closest('img')
  if (image?.closest('.prose')) {
    openLightbox(image.src, image.alt || undefined)
  }
}

function updateReadingTime(content: string) {
  readingTime.value = `${Math.max(1, Math.ceil(content.length / 400))} 分钟`
}

async function loadPost() {
  const token = ++renderToken
  loading.value = true

  const slug = route.params.slug as string
  const found = getPostBySlug(slug)
  post.value = found
  tocHeadings.value = []

  if (!found) {
    document.title = '文章未找到 - Hachimi2333'
    loading.value = false
    return
  }

  document.title = `${found.title} - Hachimi2333`
  updateReadingTime(found.content)

  const rendered = await renderMarkdown(found.content)
  // A newer navigation started while this render was in flight: discard it.
  if (token !== renderToken) return

  renderedContent.value = rendered.html
  tocHeadings.value = rendered.headings.filter((heading) => heading.level >= 2)
  loading.value = false
}

onMounted(loadPost)

watch(() => route.params.slug, loadPost)
</script>

<template>
  <div class="container mx-auto max-w-4xl px-4 py-8">
    <!-- Loading skeleton -->
    <template v-if="loading">
      <PageBreadcrumb :items="[{ label: '首页', to: '/' }, { label: '博客', to: '/posts' }, { label: '加载中...' }]" />

      <header class="mb-6">
        <Skeleton class="mb-4 h-9 w-3/4" />
        <div class="flex flex-wrap items-center gap-4">
          <Skeleton class="h-4 w-24" />
          <Skeleton class="h-4 w-20" />
          <Skeleton class="h-4 w-16" />
        </div>
      </header>

      <div class="flex gap-6">
        <Card class="min-w-0 flex-1 py-0">
          <div class="flex flex-col gap-4 p-5">
            <Skeleton class="h-64 w-full" />
            <Skeleton class="h-4 w-full" />
            <Skeleton class="h-4 w-5/6" />
            <Skeleton class="h-4 w-4/6" />
            <Skeleton class="h-4 w-full" />
            <Skeleton class="h-4 w-3/4" />
          </div>
        </Card>

        <div class="hidden w-56 shrink-0 flex-col gap-4 self-start lg:flex">
          <Card>
            <Skeleton class="h-10 w-full" />
          </Card>
          <Card>
            <div class="flex flex-col gap-3 p-4">
              <Skeleton class="h-4 w-20" />
              <Skeleton class="h-3 w-full" />
              <Skeleton class="h-3 w-5/6" />
              <Skeleton class="h-3 w-4/6" />
              <Skeleton class="h-3 w-full" />
            </div>
          </Card>
        </div>
      </div>
    </template>

    <!-- Loaded: post found -->
    <template v-else-if="post">
      <PageBreadcrumb :items="[{ label: '首页', to: '/' }, { label: '博客', to: '/posts' }, { label: post.title }]" />

      <!-- Post header -->
      <header class="mb-6">
        <h1 class="mb-4 text-3xl font-bold tracking-tight md:text-4xl">{{ post.title }}</h1>
        <div class="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <div class="flex items-center gap-1.5">
            <Calendar class="size-4" />
            <span>{{ formatDate(post.published) }}</span>
          </div>
          <div class="flex items-center gap-1.5">
            <Clock class="size-4" />
            <span>{{ readingTime }}</span>
          </div>
          <div v-if="post.category" class="flex items-center gap-1.5">
            <FolderOpen class="size-4" />
            <span>{{ post.category }}</span>
          </div>
          <div v-if="post.tags.length" class="flex items-center gap-1.5">
            <Tag class="size-4" />
            <span>{{ post.tags.join(' / ') }}</span>
          </div>
        </div>
      </header>

      <!-- Post content -->
      <div class="flex gap-6">
        <Card class="min-w-0 flex-1 py-0">
          <div class="p-5">
            <div v-if="post.image" class="mb-8 overflow-hidden rounded-md">
              <img
                :src="post.image"
                :alt="post.title"
                class="max-h-96 w-full object-cover"
                loading="lazy"
                decoding="async"
              />
            </div>

            <!-- eslint-disable-next-line vue/no-v-html -- trusted local Markdown -->
            <article class="prose max-w-none scroll-mt-20" v-html="renderedContent" @click="handleArticleClick" />
          </div>
        </Card>

        <!-- Desktop sidebar: back button + TOC -->
        <div class="hidden w-56 shrink-0 flex-col gap-4 self-start lg:sticky lg:top-20 lg:flex">
          <Card>
            <Button variant="ghost" class="w-full justify-start" @click="goBack">
              <ArrowLeft data-icon="inline-start" />
              返回文章列表
            </Button>
          </Card>
          <ArticleToc :headings="tocHeadings" />
        </div>
      </div>

      <!-- Mobile floating back button -->
      <button
        class="fixed bottom-8 z-100 flex size-10 items-center justify-center rounded-md border border-border bg-background shadow-sm transition-all duration-200 hover:bg-accent lg:hidden"
        :class="backAtRight ? 'right-4 sm:right-8' : 'right-16 sm:right-20'"
        aria-label="返回文章列表"
        @click="goBack"
      >
        <ArrowLeft class="size-5 text-foreground" />
      </button>
    </template>

    <!-- Not found -->
    <template v-else>
      <div class="py-24 text-center">
        <h1 class="mb-2 text-2xl font-bold">文章未找到</h1>
        <p class="mb-6 text-muted-foreground">你访问的文章不存在</p>
        <Button @click="goBack">
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
