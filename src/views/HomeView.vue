<script setup lang="ts">
import { ArrowRightIcon, BookOpenIcon, WrenchIcon } from '@lucide/vue'
import { Button } from '@/components/ui/button'
import GithubMark from '@/components/icons/GithubMark.vue'
import PageContainer from '@/components/layout/PageContainer.vue'
import { getAllPosts } from '@/lib/blog'
import { postUrl } from '@/lib/blog/paths'
import { formatDate } from '@/lib/date'
import { GITHUB_URL, SITE_NAME } from '@/lib/site'
import { tools } from '@/lib/tools'

const LATEST_COUNT = 4

/**
 * The home screen used to be a full-viewport hero with the header and the footer
 * suppressed, so the only thing a visitor could do was click a button. It is now
 * an ordinary page that still leads with the identity block but also shows what
 * is actually on the site.
 */
const latestPosts = getAllPosts().slice(0, LATEST_COUNT)
</script>

<template>
  <PageContainer>
    <section class="flex flex-col gap-6 py-2 sm:py-6">
      <div class="flex items-center gap-5">
        <img
          src="/avatar.webp"
          alt=""
          class="size-16 rounded-2xl object-cover sm:size-20"
        />
        <div class="flex flex-col gap-1">
          <h1 class="text-2xl font-bold tracking-tight sm:text-3xl">{{ SITE_NAME }}</h1>
          <p class="text-muted-foreground">青空一直線、目指せ一着！</p>
        </div>
      </div>

      <div class="flex flex-wrap gap-2">
        <Button as-child>
          <router-link to="/posts">
            <BookOpenIcon data-icon="inline-start" />
            博客
          </router-link>
        </Button>
        <Button variant="outline" as-child>
          <router-link to="/tools">
            <WrenchIcon data-icon="inline-start" />
            工具
          </router-link>
        </Button>
        <Button variant="outline" as-child>
          <a :href="GITHUB_URL" target="_blank" rel="noopener noreferrer">
            <GithubMark data-icon="inline-start" />
            GitHub
          </a>
        </Button>
      </div>
    </section>

    <section class="mt-10 sm:mt-14">
      <div class="flex items-baseline justify-between gap-4">
        <h2 class="text-base font-semibold">最新文章</h2>
        <router-link
          to="/posts"
          class="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          全部文章
          <ArrowRightIcon class="size-3.5" />
        </router-link>
      </div>

      <ul class="mt-3 flex flex-col divide-y divide-border/60 border-y border-border/60">
        <li v-for="post in latestPosts" :key="post.slug">
          <router-link :to="postUrl(post.slug)" class="group flex flex-col gap-1.5 py-4">
            <span class="text-sm font-medium transition-colors group-hover:text-primary">
              {{ post.title }}
            </span>
            <span class="line-clamp-1 text-xs text-muted-foreground">{{ post.excerpt }}</span>
            <span class="flex items-center gap-2 text-xs text-muted-foreground">
              <time :datetime="post.published">{{ formatDate(post.published) }}</time>
              <span aria-hidden="true">·</span>
              <span>{{ post.category }}</span>
              <span aria-hidden="true">·</span>
              <span>{{ post.readingTime }} 分钟</span>
            </span>
          </router-link>
        </li>
      </ul>
    </section>

    <section class="mt-10 sm:mt-14">
      <h2 class="text-base font-semibold">工具</h2>

      <div class="mt-3 grid gap-3 sm:grid-cols-2">
        <router-link
          v-for="tool in tools"
          :key="tool.id"
          :to="tool.route"
          class="group flex items-start gap-3 rounded-xl border border-border/60 p-4 transition-colors hover:bg-muted/50"
        >
          <span class="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
            <component :is="tool.icon" class="size-4 text-muted-foreground" />
          </span>
          <span class="flex min-w-0 flex-col gap-0.5">
            <span class="text-sm font-medium transition-colors group-hover:text-primary">
              {{ tool.name }}
            </span>
            <span class="text-xs text-muted-foreground">{{ tool.description }}</span>
          </span>
        </router-link>
      </div>
    </section>
  </PageContainer>
</template>
