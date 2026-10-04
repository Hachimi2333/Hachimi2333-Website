<script setup lang="ts">
import { MoonIcon, SunIcon } from '@lucide/vue'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/composables/useTheme'

const { isDark, toggleTheme } = useTheme()
</script>

<template>
  <header class="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-sm">
    <div class="container mx-auto flex h-14 max-w-4xl items-center justify-between px-4">
      <router-link to="/" aria-label="返回首页">
        <img src="/avatar.webp" alt="Hachimi2333" class="size-8 rounded-md object-cover" />
      </router-link>

      <Button
        variant="ghost"
        size="icon"
        :aria-label="isDark ? '切换到浅色主题' : '切换到深色主题'"
        :title="isDark ? '切换到浅色主题' : '切换到深色主题'"
        @click="toggleTheme"
      >
        <SunIcon v-if="isDark" />
        <MoonIcon v-else />
      </Button>
    </div>
  </header>
</template>
