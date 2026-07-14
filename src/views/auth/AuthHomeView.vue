<script setup lang="ts">
import { useAuth } from '@/composables/useAuth'
import { useRouter } from 'vue-router'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { User, LogOut } from 'lucide-vue-next'

const router = useRouter()
const { user, isAuthenticated, logout } = useAuth()

async function handleLogout() {
  await logout()
  router.push('/')
}
</script>

<template>
  <div class="container mx-auto max-w-2xl py-8 px-4">
    <!-- 已登录状态 -->
    <Card v-if="isAuthenticated && user">
      <CardHeader>
        <CardTitle>个人资料</CardTitle>
        <CardDescription>管理你的账户信息</CardDescription>
      </CardHeader>
      <CardContent class="space-y-6">
        <div class="flex items-center space-x-4">
          <Avatar class="h-16 w-16">
            <AvatarImage :src="user.avatar || ''" :alt="user.name" />
            <AvatarFallback>
              <User class="h-8 w-8" />
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 class="text-2xl font-bold">{{ user.name }}</h2>
            <p class="text-muted-foreground">{{ user.email }}</p>
          </div>
        </div>
        
        <div class="flex space-x-4">
          <Button @click="handleLogout" variant="outline">
            <LogOut class="mr-2 h-4 w-4" />
            退出登录
          </Button>
        </div>
      </CardContent>
    </Card>

    <!-- 未登录状态 -->
    <Card v-else>
      <CardHeader>
        <CardTitle>欢迎</CardTitle>
        <CardDescription>请登录或注册以继续</CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <p class="text-muted-foreground">
          你需要登录才能访问个人资料和更多功能。
        </p>
        <div class="flex space-x-4">
          <Button @click="router.push('/auth/login')">
            登录
          </Button>
          <Button @click="router.push('/auth/register')" variant="outline">
            注册
          </Button>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
