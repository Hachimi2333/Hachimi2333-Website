<script setup lang="ts">
import { ref, inject } from 'vue'
import { useRoute } from 'vue-router'
import { BookOpen, Wrench, Github, Sun, Moon, Menu, X } from 'lucide-vue-next'

const route = useRoute()
const mobileMenuOpen = ref(false)

const theme = inject<{ isDark: { value: boolean }; toggleTheme: () => void }>('theme')

const navLinks = [
  { to: '/posts', label: '博客', icon: BookOpen },
  { to: '/tools', label: '工具', icon: Wrench },
]

function isActive(path: string): boolean {
  return route.path.startsWith(path)
}
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

      <!-- Desktop nav -->
      <nav class="hidden sm:flex items-center gap-1">
        <router-link
          v-for="link in navLinks"
          :key="link.to"
          :to="link.to"
          :class="[
            'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
            isActive(link.to)
              ? 'bg-accent text-accent-foreground'
              : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
          ]"
        >
          <component :is="link.icon" class="h-4 w-4" />
          {{ link.label }}
        </router-link>

        <a
          href="https://github.com/hachimi2333"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center justify-center w-9 h-9 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
        >
          <Github class="h-4 w-4" />
        </a>

        <button
          v-if="theme"
          class="inline-flex items-center justify-center w-9 h-9 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
          @click="theme.toggleTheme"
          title="切换主题"
        >
          <Sun v-if="theme.isDark.value" class="h-4 w-4" />
          <Moon v-else class="h-4 w-4" />
        </button>
      </nav>

      <!-- Mobile menu button -->
      <div class="flex items-center gap-1 sm:hidden">
        <button
          v-if="theme"
          class="inline-flex items-center justify-center w-9 h-9 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
          @click="theme.toggleTheme"
          title="切换主题"
        >
          <Sun v-if="theme.isDark.value" class="h-4 w-4" />
          <Moon v-else class="h-4 w-4" />
        </button>
        <button
          class="inline-flex items-center justify-center w-9 h-9 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
          @click="mobileMenuOpen = !mobileMenuOpen"
        >
          <X v-if="mobileMenuOpen" class="h-5 w-5" />
          <Menu v-else class="h-5 w-5" />
        </button>
      </div>
    </div>

    <!-- Mobile nav -->
    <div
      v-if="mobileMenuOpen"
      class="sm:hidden border-t bg-background px-4 py-3 space-y-1"
    >
      <router-link
        v-for="link in navLinks"
        :key="link.to"
        :to="link.to"
        :class="[
          'flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors',
          isActive(link.to)
            ? 'bg-accent text-accent-foreground'
            : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
        ]"
        @click="mobileMenuOpen = false"
      >
        <component :is="link.icon" class="h-4 w-4" />
        {{ link.label }}
      </router-link>
      <a
        href="https://github.com/hachimi2333"
        target="_blank"
        rel="noopener noreferrer"
        class="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
      >
        <Github class="h-4 w-4" />
        GitHub
      </a>
    </div>
  </header>
</template>
