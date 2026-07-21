<script setup lang="ts">
import { useTheme } from '@/composables/useTheme'
import { Sun, Moon } from 'lucide-vue-next'

const { isDark, toggleTheme } = useTheme()
</script>

<template>
  <header class="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-sm">
    <div class="container mx-auto flex h-14 max-w-4xl items-center justify-between px-4">
      <!-- Logo -->
      <router-link to="/" class="flex items-center">
        <img
          src="/avatar.webp"
          alt="Hachimi2333"
          class="size-8 rounded-none object-cover"
        />
      </router-link>

      <!-- Right side: theme toggle only -->
      <div class="flex items-center gap-1">
        <!-- Theme toggle -->
        <button
          class="inline-flex items-center justify-center size-9 rounded-none text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
          @click="toggleTheme"
          title="切换主题"
        >
          <Sun v-if="isDark" class="size-4" />
          <Moon v-else class="size-4" />
        </button>
      </div>
    </div>
  </header>
</template>
