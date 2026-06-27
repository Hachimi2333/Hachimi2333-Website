<script setup lang="ts">
import { inject } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Home, Sun, Moon, User, LogOut, UserCircle } from 'lucide-vue-next'

const router = useRouter()

const theme = inject<{ isDark: { value: boolean }; toggleTheme: () => void }>('theme')
const { user, isAuthenticated, logout } = useAuth()

async function handleLogout() {
  await logout()
  router.push('/')
}
</script>

<template>
  <header class="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-sm">
    <div class="container mx-auto flex h-14 max-w-4xl items-center justify-between px-4">
      <!-- Logo only -->
      <router-link to="/" class="flex items-center">
        <img
          src="/avatar.webp"
          alt="Hachimi2333"
          class="size-8 rounded-full object-cover"
        />
      </router-link>

      <!-- Right side: home + theme + user -->
      <div class="flex items-center gap-1">
        <!-- Home -->
        <router-link
          to="/"
          class="inline-flex items-center justify-center size-9 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
          title="首页"
        >
          <Home class="size-4" />
        </router-link>

        <!-- Theme toggle -->
        <button
          v-if="theme"
          class="inline-flex items-center justify-center size-9 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
          @click="theme.toggleTheme"
          title="切换主题"
        >
          <Sun v-if="theme.isDark.value" class="size-4" />
          <Moon v-else class="size-4" />
        </button>

        <!-- User menu (logged in) -->
        <Popover v-if="isAuthenticated">
          <PopoverTrigger as-child>
            <button class="inline-flex items-center gap-2 px-2 py-1 rounded-md hover:bg-accent/50 transition-colors">
              <Avatar class="size-7">
                <AvatarImage :src="user?.avatar || ''" :alt="user?.name" />
                <AvatarFallback>
                  <User class="size-4" />
                </AvatarFallback>
              </Avatar>
              <span class="text-sm font-medium hidden md:inline">{{ user?.name }}</span>
            </button>
          </PopoverTrigger>
          <PopoverContent class="w-48" align="end">
            <div class="flex flex-col gap-1">
              <div class="px-2 py-1.5">
                <p class="text-sm font-medium">{{ user?.name }}</p>
                <p class="text-xs text-muted-foreground truncate">{{ user?.email }}</p>
              </div>
              <router-link
                to="/auth/profile"
                class="flex items-center gap-2 px-2 py-1.5 text-sm rounded-md hover:bg-accent transition-colors"
              >
                <UserCircle class="size-4" />
                个人资料
              </router-link>
              <button
                class="flex items-center gap-2 px-2 py-1.5 text-sm rounded-md hover:bg-accent transition-colors text-destructive"
                @click="handleLogout"
              >
                <LogOut class="size-4" />
                退出登录
              </button>
            </div>
          </PopoverContent>
        </Popover>

        <!-- Login icon (not logged in) -->
        <router-link
          v-else
          to="/auth/login"
          class="inline-flex items-center justify-center size-9 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
          title="登录"
        >
          <User class="size-4" />
        </router-link>
      </div>
    </div>
  </header>
</template>
