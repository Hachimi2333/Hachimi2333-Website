<script setup lang="ts">
import { MoonIcon, SunIcon } from '@lucide/vue'
import { Button } from '@/components/ui/button'
import GithubMark from '@/components/icons/GithubMark.vue'
import { useTheme } from '@/composables/useTheme'
import { useRoute } from 'vue-router'
import { GITHUB_URL, SITE_NAME } from '@/lib/site'

const route = useRoute()
const { isDark, toggleTheme } = useTheme()

const NAV_ITEMS = [
  { label: '首页', to: '/' },
  { label: '博客', to: '/posts' },
  { label: '工具', to: '/tools' },
]

/**
 * The previous header was an avatar and a theme toggle, so every page except the
 * home screen was a dead end: there was no way to reach the blog or the tools
 * without editing the URL.
 *
 * The three links are rendered inline at every breakpoint on purpose. They fit
 * on a 320px screen (the wordmark is what gets dropped, not the navigation), and
 * avoiding a drawer keeps `reka-ui`'s Dialog primitives -- roughly 10 kB gzipped
 * -- out of the entry chunk that every page has to download before it paints.
 */
function isActive(to: string): boolean {
  if (to === '/') return route.path === '/'
  return route.path === to || route.path.startsWith(`${to}/`)
}

function themeLabel(): string {
  return isDark.value ? '切换到浅色主题' : '切换到深色主题'
}
</script>

<template>
  <header class="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md">
    <div class="mx-auto flex h-14 w-full max-w-5xl items-center gap-1 px-3 sm:px-6">
      <router-link
        to="/"
        class="flex shrink-0 items-center gap-2 rounded-md p-1 outline-none focus-visible:ring-2 focus-visible:ring-ring"
        :aria-label="`${SITE_NAME} 首页`"
      >
        <img src="/avatar.webp" alt="" class="size-7 rounded-md object-cover" />
        <span class="hidden text-sm font-semibold tracking-tight sm:inline">{{ SITE_NAME }}</span>
      </router-link>

      <nav class="ml-1 flex items-center gap-0.5 sm:ml-3" aria-label="主导航">
        <router-link
          v-for="item in NAV_ITEMS"
          :key="item.to"
          :to="item.to"
          class="rounded-md px-2 py-1.5 text-sm transition-colors sm:px-3"
          :class="
            isActive(item.to)
              ? 'bg-accent font-medium text-foreground'
              : 'text-muted-foreground hover:bg-accent/60 hover:text-foreground'
          "
        >
          {{ item.label }}
        </router-link>
      </nav>

      <div class="ml-auto flex shrink-0 items-center gap-0.5">
        <Button variant="ghost" size="icon" as-child>
          <a :href="GITHUB_URL" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
            <GithubMark />
          </a>
        </Button>

        <Button
          variant="ghost"
          size="icon"
          :aria-label="themeLabel()"
          :title="themeLabel()"
          @click="toggleTheme"
        >
          <SunIcon v-if="isDark" />
          <MoonIcon v-else />
        </Button>
      </div>
    </div>
  </header>
</template>
