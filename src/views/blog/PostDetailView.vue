<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CalendarIcon,
  ClockIcon,
  FolderOpenIcon,
} from '@lucide/vue'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import ArticleToc from '@/components/blog/ArticleToc.vue'
import ImageLightbox from '@/components/common/ImageLightbox.vue'
import PageContainer from '@/components/layout/PageContainer.vue'
import { getAllPosts, getPostBySlug } from '@/lib/blog'
import { getRenderedPost } from '@/lib/blog/content'
import { postUrl } from '@/lib/blog/paths'
import { formatDate } from '@/lib/date'

const route = useRoute()

const post = computed(() => getPostBySlug(route.params.slug as string))

/**
 * The body arrives pre-rendered from `scripts/blog-plugin.ts`, so this is a
 * synchronous lookup rather than an `await renderMarkdown()` in `onMounted`.
 * That is what makes the prerendered HTML and the first client render agree --
 * with the old async version every article page hydrated into a loading skeleton.
 */
const rendered = computed(() => (post.value ? getRenderedPost(post.value.slug) : undefined))
const tocHeadings = computed(() => rendered.value?.headings.filter((h) => h.level >= 2) ?? [])

/**
 * Neighbours in list order, which is newest first: the left card leads to the
 * more recent post and the right card to the older one. They are labelled with
 * dates rather than 上一篇/下一篇, which Chinese blogs use in both directions.
 */
const neighbours = computed(() => {
  const posts = getAllPosts()
  const index = posts.findIndex((entry) => entry.slug === post.value?.slug)
  if (index < 0) return { newer: undefined, older: undefined }
  return { newer: posts[index - 1], older: posts[index + 1] }
})

const lightboxVisible = ref(false)
const lightboxSrc = ref('')
const lightboxAlt = ref('')

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
</script>

<template>
  <PageContainer>
    <template v-if="post && rendered">
      <router-link
        to="/posts"
        class="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeftIcon class="size-4" />
        返回博客
      </router-link>

      <header class="mt-6 flex flex-col gap-4">
        <h1 class="text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
          {{ post.title }}
        </h1>

        <p v-if="post.description" class="max-w-3xl text-base text-muted-foreground">
          {{ post.description }}
        </p>

        <div class="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-muted-foreground">
          <span class="flex items-center gap-1.5">
            <CalendarIcon class="size-3.5" />
            <time :datetime="post.published">{{ formatDate(post.published) }}</time>
          </span>
          <span class="flex items-center gap-1.5">
            <ClockIcon class="size-3.5" />
            {{ post.readingTime }} 分钟
          </span>
          <span class="flex items-center gap-1.5">
            <FolderOpenIcon class="size-3.5" />
            {{ post.category }}
          </span>
          <Badge v-for="tag in post.tags" :key="tag" variant="secondary">{{ tag }}</Badge>
        </div>
      </header>

      <figure v-if="post.image" class="mt-8 overflow-hidden rounded-xl border border-border/60">
        <img
          :src="post.image"
          :alt="post.title"
          class="aspect-2/1 w-full object-cover"
          loading="eager"
          decoding="async"
        />
      </figure>

      <div v-if="tocHeadings.length" class="mt-8 lg:hidden">
        <ArticleToc :headings="tocHeadings" variant="inline" />
      </div>

      <div
        class="mt-8 grid gap-10"
        :class="tocHeadings.length ? 'lg:grid-cols-[minmax(0,1fr)_13rem] lg:gap-12' : ''"
      >
        <!-- eslint-disable-next-line vue/no-v-html -- trusted local Markdown -->
        <article
          class="prose min-w-0 max-w-none"
          v-html="rendered.html"
          @click="handleArticleClick"
        />

        <div v-if="tocHeadings.length" class="hidden lg:block">
          <ArticleToc :headings="tocHeadings" variant="rail" />
        </div>
      </div>

      <nav
        v-if="neighbours.newer || neighbours.older"
        class="mt-12 grid gap-3 border-t border-border/60 pt-6 sm:grid-cols-2"
        aria-label="相邻文章"
      >
        <router-link
          v-if="neighbours.newer"
          :to="postUrl(neighbours.newer.slug)"
          class="group flex flex-col gap-1 rounded-xl border border-border/60 p-4 transition-colors hover:bg-muted/50"
        >
          <span class="flex items-center gap-1.5 text-xs text-muted-foreground">
            <ArrowLeftIcon class="size-3.5" />
            {{ formatDate(neighbours.newer.published) }}
          </span>
          <span
            class="text-sm font-medium text-foreground transition-colors group-hover:text-primary"
          >
            {{ neighbours.newer.title }}
          </span>
        </router-link>

        <router-link
          v-if="neighbours.older"
          :to="postUrl(neighbours.older.slug)"
          class="group flex flex-col gap-1 rounded-xl border border-border/60 p-4 transition-colors hover:bg-muted/50 sm:items-end"
        >
          <span class="flex items-center gap-1.5 text-xs text-muted-foreground">
            {{ formatDate(neighbours.older.published) }}
            <ArrowRightIcon class="size-3.5" />
          </span>
          <span
            class="text-sm font-medium text-foreground transition-colors group-hover:text-primary sm:text-right"
          >
            {{ neighbours.older.title }}
          </span>
        </router-link>
      </nav>
    </template>

    <div v-else class="flex flex-col items-center gap-4 py-20 text-center">
      <h1 class="text-xl font-semibold">文章未找到</h1>
      <p class="text-sm text-muted-foreground">这篇文章不存在，或者已经被移除了</p>
      <Button as-child class="mt-1">
        <router-link to="/posts">
          <ArrowLeftIcon data-icon="inline-start" />
          返回博客
        </router-link>
      </Button>
    </div>

    <ImageLightbox
      :visible="lightboxVisible"
      :src="lightboxSrc"
      :alt="lightboxAlt"
      @close="closeLightbox"
    />
  </PageContainer>
</template>
