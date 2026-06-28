<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { useProfile } from '@/composables/useProfile'
import type { PublicProfile } from '@/types/user'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { User, Pencil, MapPin, CalendarDays } from 'lucide-vue-next'
import { Skeleton } from '@/components/ui/skeleton'
import PageBreadcrumb from '@/components/layout/PageBreadcrumb.vue'
import EditProfileDialog from '@/components/auth/EditProfileDialog.vue'
import EditBioDialog from '@/components/auth/EditBioDialog.vue'
import { formatDate } from '@/lib/date'

const route = useRoute()
const router = useRouter()
const { user, isAuthenticated, verified } = useAuth()
const { fetchProfile } = useProfile()

const otherProfile = ref<PublicProfile | null>(null)
const loading = ref(false)

const showProfileDialog = ref(false)
const showBioDialog = ref(false)

const viewingSelf = computed(() => {
  const idParam = route.query.id
  if (!idParam) return true
  return user.value && String(user.value.id) === String(idParam)
})

const profile = computed(() => {
  if (viewingSelf.value) return user.value
  return otherProfile.value
})

const canEdit = computed(() => viewingSelf.value && isAuthenticated.value)

async function loadProfile() {
  if (viewingSelf.value) {
    otherProfile.value = null
    return
  }
  loading.value = true
  const id = Number(route.query.id)
  if (id) {
    otherProfile.value = await fetchProfile(id)
  }
  loading.value = false
}

onMounted(loadProfile)
watch(() => route.query.id, loadProfile)
</script>

<template>
  <div class="container mx-auto max-w-4xl px-4 py-8">
    <PageBreadcrumb :items="[{ label: '首页', to: '/' }, { label: '个人资料' }]" />

    <!-- 认证验证中 或 资料加载中 -->
    <div v-if="!verified || loading" class="flex flex-col md:flex-row gap-6">
      <!-- 左栏骨架 -->
      <div class="flex flex-col gap-4 md:w-64 shrink-0">
        <Card>
          <CardContent class="flex flex-col items-center md:items-start gap-4">
            <Skeleton class="size-28 rounded-full" />
            <div class="w-full space-y-2">
              <Skeleton class="h-5 w-24 mx-auto md:mx-0" />
              <Skeleton class="h-4 w-32 mx-auto md:mx-0" />
            </div>
            <Separator class="w-full" />
            <div class="flex flex-col gap-2 w-full">
              <Skeleton class="h-4 w-36" />
              <Skeleton class="h-4 w-28" />
            </div>
            <Skeleton class="h-9 w-full" />
          </CardContent>
        </Card>
      </div>
      <!-- 右栏骨架 -->
      <div class="flex-1 min-w-0 space-y-3">
        <Skeleton class="h-9 w-24" />
        <Card>
          <CardContent>
            <div class="space-y-2">
              <Skeleton class="h-4 w-full" />
              <Skeleton class="h-4 w-3/4" />
              <Skeleton class="h-4 w-1/2" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>

    <!-- 未登录且查看自己 -->
    <div v-else-if="verified && !route.query.id && !isAuthenticated" class="text-center py-20">
      <p class="text-muted-foreground mb-2">请先登录后查看个人资料</p>
      <Button size="sm" @click="router.push({ path: '/auth/login', query: { redirect: '/auth/profile' } })">去登录</Button>
    </div>

    <!-- 用户不存在 -->
    <div v-else-if="route.query.id && !profile" class="text-center py-20">
      <p class="text-muted-foreground mb-2">用户不存在</p>
      <Button variant="link" size="sm" @click="router.push('/auth/profile')">返回我的资料</Button>
    </div>

    <!-- 两栏布局 -->
    <div v-else class="flex flex-col md:flex-row gap-6">
      <!-- 左栏：个人信息 -->
      <div class="flex flex-col gap-4 md:w-64 shrink-0">
        <Card>
          <CardContent class="flex flex-col items-center md:items-start gap-4">
            <Avatar class="size-28">
              <AvatarImage :src="profile?.avatar || ''" :alt="profile?.name" />
              <AvatarFallback class="text-2xl bg-muted">
                <User class="size-10 text-muted-foreground" />
              </AvatarFallback>
            </Avatar>

            <div class="text-center md:text-left">
              <h1 class="text-xl font-bold">{{ profile?.name }}</h1>
              <p v-if="profile?.signature" class="text-sm text-muted-foreground mt-1">{{ profile.signature }}</p>
            </div>

            <Separator class="w-full" />

            <div class="flex flex-col gap-2 text-sm text-muted-foreground w-full">
              <div v-if="profile?.createdAt" class="flex items-center gap-2">
                <CalendarDays class="size-4 shrink-0" />
                <span>加入于 {{ formatDate(profile.createdAt) }}</span>
              </div>
              <div v-if="profile?.region" class="flex items-center gap-2">
                <MapPin class="size-4 shrink-0" />
                <span>{{ profile.region }}</span>
              </div>
              <div v-else class="flex items-center gap-2 text-muted-foreground/50">
                <MapPin class="size-4 shrink-0" />
                <span>未设置地区</span>
              </div>
            </div>

            <Button v-if="canEdit" variant="outline" size="sm" class="w-full" @click="showProfileDialog = true">
              <Pencil class="size-3.5" data-icon />
              编辑个人资料
            </Button>
          </CardContent>
        </Card>
      </div>

      <!-- 右栏：Tabs -->
      <div class="flex-1 min-w-0">
        <Tabs default-value="bio" class="w-full">
          <div class="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="bio">个人简介</TabsTrigger>
            </TabsList>
            <Button v-if="canEdit" variant="ghost" size="sm" @click="showBioDialog = true">
              <Pencil class="size-3.5" data-icon />
              编辑简介
            </Button>
          </div>

          <TabsContent value="bio" class="mt-3">
            <Card>
              <CardContent>
                <div v-if="profile?.bio" class="prose text-sm leading-relaxed whitespace-pre-wrap">{{ profile.bio }}</div>
                <div v-else class="text-sm text-muted-foreground italic">这个人很懒，什么都没有写。</div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>

    <!-- 编辑弹窗 -->
    <EditProfileDialog v-model:open="showProfileDialog" :user="user" />
    <EditBioDialog v-model:open="showBioDialog" :bio="profile?.bio || ''" />
  </div>
</template>
