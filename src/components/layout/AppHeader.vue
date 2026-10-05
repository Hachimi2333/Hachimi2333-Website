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
 * on a 320px screen, and avoiding a drawer keeps `reka-ui`'s Dialog primitives --
 * roughly 10 kB gzipped -- out of the entry chunk that every page has to download
 * before it paints.
 *
 * The bar is a three-column grid rather than a flex row with `ml-auto`, because
 * the navigation has to sit in the middle of the *header*, not merely after the
 * avatar. The `minmax(0, 1fr)` outer columns are forced equal regardless of how
 * wide the avatar or the trailing buttons grow, so the middle column cannot
 * drift off centre the way it would with a plain `auto` track.
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
    <div
      class="mx-auto grid h-14 w-full max-w-5xl grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center px-3 sm:px-6"
    >
      <router-link
        to="/"
        class="flex shrink-0 items-center justify-self-start rounded-md p-1 outline-none focus-visible:ring-2 focus-visible:ring-ring"
        :aria-label="`${SITE_NAME} 首页`"
      >
        <img src="/avatar.webp" alt="" class="size-7 rounded-md object-cover" />
      </router-link>

      <nav class="flex items-center gap-0.5" aria-label="主导航">
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

      <div class="flex shrink-0 items-center gap-0.5 justify-self-end">
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
