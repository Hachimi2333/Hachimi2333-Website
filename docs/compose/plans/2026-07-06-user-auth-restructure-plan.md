# 用户认证系统重组实现计划

> [!NOTE]
> This document may not reflect the current implementation.
> See the final report for up-to-date state:
> [Final Report](../reports/user-auth-restructure.md)

> **For agentic workers:** REQUIRED SUB-SKILL: Use compose:subagent (recommended) or compose:execute to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将用户系统独立到 `/auth` 路由下，简化导航栏，提升用户体验

**Architecture:** 创建 `/auth` 首页显示用户资料，简化导航栏只保留主题切换，删除原 profile 页面

**Tech Stack:** Vue 3, TypeScript, Tailwind CSS, shadcn-vue, vue-router

## Global Constraints

- 使用 `<script setup lang="ts">` 语法
- 使用 shadcn-vue 组件库
- 使用 Tailwind CSS utility classes
- 保持现有代码风格和命名约定

---

### Task 1: 创建 AuthHomeView 组件

**Covers:** [S3]

**Files:**
- Create: `src/views/auth/AuthHomeView.vue`

**Interfaces:**
- Consumes: `useAuth()` composable
- Produces: 用户资料概览页面组件

- [ ] **Step 1: 创建 AuthHomeView 组件基础结构**

```vue
<script setup lang="ts">
import { useAuth } from '@/composables/useAuth'
import { useRouter } from 'vue-router'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { User, LogOut, Settings } from 'lucide-vue-next'

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
```

- [ ] **Step 2: 验证组件创建成功**

Run: `npm run build`
Expected: 构建成功，无 TypeScript 错误

- [ ] **Step 3: 提交更改**

```bash
git add src/views/auth/AuthHomeView.vue
git commit -m "feat: add AuthHomeView component for /auth page"
```

### Task 2: 更新路由配置

**Covers:** [S3]

**Files:**
- Modify: `src/router/index.ts:45-60`

**Interfaces:**
- Consumes: `AuthHomeView.vue` 组件
- Produces: 更新后的路由配置

- [ ] **Step 1: 修改路由配置**

```typescript
// 替换原来的 /auth/profile 路由
{
  path: '/auth',
  name: 'auth-home',
  component: () => import('@/views/auth/AuthHomeView.vue'),
  meta: { title: `用户中心 - ${BASE_TITLE}` },
},
```

- [ ] **Step 2: 删除原 profile 路由**

删除以下路由配置：
```typescript
{
  path: '/auth/profile',
  name: 'profile',
  component: () => import('@/views/auth/ProfileView.vue'),
  meta: { title: `个人资料 - ${BASE_TITLE}` },
},
```

- [ ] **Step 3: 更新路由守卫**

```typescript
// 修改路由守卫中的 guest 重定向
} else if (to.meta.guest && isAuthenticated.value) {
  next('/auth')  // 改为重定向到 /auth 首页
} else {
  next()
}
```

- [ ] **Step 4: 验证路由配置**

Run: `npm run build`
Expected: 构建成功，路由配置正确

- [ ] **Step 5: 提交更改**

```bash
git add src/router/index.ts
git commit -m "refactor: update auth routes to use AuthHomeView"
```

### Task 3: 简化导航栏

**Covers:** [S3]

**Files:**
- Modify: `src/components/layout/AppHeader.vue:1-121`

**Interfaces:**
- Consumes: `useTheme()` composable
- Produces: 简化后的导航栏组件

- [ ] **Step 1: 简化 AppHeader 组件**

```vue
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
          class="size-8 rounded-full object-cover"
        />
      </router-link>

      <!-- Right side: theme toggle only -->
      <div class="flex items-center gap-1">
        <!-- Theme toggle -->
        <button
          class="inline-flex items-center justify-center size-9 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
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
```

- [ ] **Step 2: 验证导航栏简化**

Run: `npm run build`
Expected: 构建成功，导航栏只显示主题切换

- [ ] **Step 3: 提交更改**

```bash
git add src/components/layout/AppHeader.vue
git commit -m "refactor: simplify AppHeader to only show theme toggle"
```

### Task 4: 删除原 ProfileView 组件

**Covers:** [S3]

**Files:**
- Delete: `src/views/auth/ProfileView.vue`

**Interfaces:**
- Consumes: 无
- Produces: 删除原 profile 页面

- [ ] **Step 1: 删除 ProfileView.vue 文件**

```bash
rm src/views/auth/ProfileView.vue
```

- [ ] **Step 2: 验证删除后构建成功**

Run: `npm run build`
Expected: 构建成功，无引用错误

- [ ] **Step 3: 提交更改**

```bash
git add -A
git commit -m "chore: remove ProfileView.vue component"
```

### Task 5: 更新导航栏中的用户链接

**Covers:** [S3]

**Files:**
- Modify: `src/components/layout/AppHeader.vue`

**Interfaces:**
- Consumes: 无
- Produces: 移除所有用户相关链接

- [ ] **Step 1: 移除导入的组件和函数**

删除以下导入：
```typescript
import { useAuth } from '@/composables/useAuth'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Skeleton } from '@/components/ui/skeleton'
import { User, LogOut, UserCircle, Shield } from 'lucide-vue-next'
```

删除以下变量和函数：
```typescript
const { user, isAuthenticated, isAdmin, verified, logout } = useAuth()
const popoverOpen = ref(false)

async function handleLogout() {
  await logout()
  router.push('/')
}
```

- [ ] **Step 2: 移除导航栏中的用户相关 HTML**

删除以下模板部分：
```html
<!-- Loading skeleton -->
<div v-if="!verified" class="inline-flex items-center gap-2 px-2 py-1">
  <Skeleton class="size-7 rounded-full" />
  <Skeleton class="h-4 w-12 hidden md:block" />
</div>

<!-- User menu (logged in) -->
<Popover v-else-if="isAuthenticated" v-model:open="popoverOpen">
  <!-- ... 整个 Popover 内容 -->
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
```

- [ ] **Step 3: 验证移除成功**

Run: `npm run build`
Expected: 构建成功，导航栏只显示 Logo 和主题切换

- [ ] **Step 4: 提交更改**

```bash
git add src/components/layout/AppHeader.vue
git commit -m "refactor: remove all user-related elements from AppHeader"
```

### Task 6: 更新其他组件中的链接

**Covers:** [S3]

**Files:**
- Modify: `src/views/auth/LoginView.vue`
- Modify: `src/views/auth/RegisterView.vue`

**Interfaces:**
- Consumes: 无
- Produces: 更新登录/注册后的重定向

- [ ] **Step 1: 更新 LoginView 中的重定向**

查找并修改登录成功后的重定向逻辑：
```typescript
// 将 /auth/profile 改为 /auth
router.push('/auth')
```

- [ ] **Step 2: 更新 RegisterView 中的重定向**

查找并修改注册成功后的重定向逻辑：
```typescript
// 将 /auth/profile 改为 /auth
router.push('/auth')
```

- [ ] **Step 3: 验证更新成功**

Run: `npm run build`
Expected: 构建成功，重定向逻辑正确

- [ ] **Step 4: 提交更改**

```bash
git add src/views/auth/LoginView.vue src/views/auth/RegisterView.vue
git commit -m "fix: update auth redirects to use /auth instead of /auth/profile"
```

### Task 7: 最终验证和测试

**Covers:** [S5]

**Files:**
- 无新增文件

**Interfaces:**
- Consumes: 所有之前的任务
- Produces: 完整的功能验证

- [ ] **Step 1: 运行完整构建**

Run: `npm run build`
Expected: 构建成功，无错误

- [ ] **Step 2: 启动开发服务器测试**

Run: `npm run dev`
Expected: 开发服务器正常启动

- [ ] **Step 3: 测试未登录状态**

1. 访问 `/auth` 页面
2. 验证显示登录/注册提示信息
3. 验证导航栏只显示主题切换

- [ ] **Step 4: 测试登录状态**

1. 登录用户
2. 访问 `/auth` 页面
3. 验证显示用户资料概览
4. 验证导航栏只显示主题切换

- [ ] **Step 5: 测试路由跳转**

1. 验证 `/auth/profile` 路由已删除
2. 验证登录后跳转到 `/auth` 首页
3. 验证注册后跳转到 `/auth` 首页

- [ ] **Step 6: 提交最终更改**

```bash
git add -A
git commit -m "feat: complete user auth system restructure"
```
