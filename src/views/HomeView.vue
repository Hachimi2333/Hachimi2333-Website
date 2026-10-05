<script setup lang="ts">
import { BookOpenIcon, WrenchIcon } from '@lucide/vue'
import { Button } from '@/components/ui/button'
import GithubMark from '@/components/icons/GithubMark.vue'
import PageContainer from '@/components/layout/PageContainer.vue'
import { GITHUB_URL, SITE_NAME } from '@/lib/site'

/**
 * The home screen is one centred identity block and nothing else.
 *
 * An earlier revision added "latest posts" and "tools" sections underneath it.
 * They restated the navigation that the header already provides and pushed the
 * landing page into a scroll, so they were removed.
 *
 * `main` in `AppLayout` is a flex column, so `flex-1` here fills exactly the gap
 * between the header and the footer and `justify-center` centres the block in
 * it. That avoids viewport-unit arithmetic and stays correct when the footer
 * wraps to two lines on a narrow screen, which a `min-h-[calc(100svh-...)]`
 * would not.
 *
 * The buttons are real links rather than `@click` handlers so that the URLs are
 * crawlable and middle-clickable, and so nothing here needs the router.
 */
</script>

<template>
  <PageContainer class="flex flex-1 flex-col items-center justify-center gap-8 text-center">
    <div class="relative">
      <img
        src="/avatar.webp"
        alt=""
        class="size-28 rounded-3xl object-cover shadow-lg sm:size-32"
      />
      <span
        class="absolute -right-1 -bottom-1 size-6 rounded-full border-4 border-background bg-green-500"
        aria-hidden="true"
      />
    </div>

    <div class="flex flex-col gap-2">
      <h1 class="text-3xl font-bold tracking-tight sm:text-4xl">{{ SITE_NAME }}</h1>
      <p class="text-lg text-muted-foreground">青空一直線、目指せ一着！</p>
    </div>

    <div class="flex flex-wrap justify-center gap-3">
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
  </PageContainer>
</template>
