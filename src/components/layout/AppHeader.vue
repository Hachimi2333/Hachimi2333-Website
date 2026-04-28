<script setup lang="ts">
import { useRoute } from 'vue-router'
import { BookOpen, Wrench, Github } from 'lucide-vue-next'

const route = useRoute()

const navLinks = [
  { to: '/posts', label: '博客', icon: BookOpen },
  { to: '/tools', label: '工具', icon: Wrench },
]
</script>

<template>
  <header class="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-sm">
    <div class="container mx-auto flex h-14 max-w-4xl items-center justify-between px-4">
      <router-link to="/" class="flex items-center gap-2.5">
        <img
          src="/avatar.webp"
          alt="Hachimi2333"
          class="w-8 h-8 rounded-full object-cover"
        />
        <span class="text-lg font-semibold">Hachimi2333</span>
      </router-link>

      <nav class="flex items-center gap-1">
        <router-link
          v-for="link in navLinks"
          :key="link.to"
          :to="link.to"
          :class="[
            'inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
            route.path.startsWith(link.to)
              ? 'bg-accent text-accent-foreground'
              : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
          ]"
        >
          <component :is="link.icon" class="h-4 w-4" />
          <span class="hidden sm:inline">{{ link.label }}</span>
        </router-link>

        <a
          href="https://github.com/hachimi2333"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center justify-center w-9 h-9 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
        >
          <Github class="h-4 w-4" />
        </a>
      </nav>
    </div>
  </header>
</template>
