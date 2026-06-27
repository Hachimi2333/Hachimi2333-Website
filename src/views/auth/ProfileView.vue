<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth, type PublicProfile } from '@/composables/useAuth'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { User, Pencil, MapPin, CalendarDays, Loader2 } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const { user, isAuthenticated, fetchUserProfile, updateProfile } = useAuth()

const otherProfile = ref<PublicProfile | null>(null)
const loading = ref(false)
const saving = ref(false)
const error = ref('')

const showProfileDialog = ref(false)
const showBioDialog = ref(false)
const form = ref({ name: '', avatar: '', signature: '', region: '' })
const bioForm = ref('')

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

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })
}

async function loadProfile() {
  loading.value = true
  const id = viewingSelf.value ? user.value?.id : Number(route.query.id)
  if (id) {
    otherProfile.value = await fetchUserProfile(id)
  }
  loading.value = false
}

function openProfileDialog() {
  if (!user.value) return
  form.value = {
    name: user.value.name,
    avatar: user.value.avatar || '',
    signature: user.value.signature || '',
    region: user.value.region || ''
  }
  error.value = ''
  showProfileDialog.value = true
}

function openBioDialog() {
  bioForm.value = otherProfile.value?.bio || ''
  showBioDialog.value = true
}

async function saveProfile() {
  saving.value = true
  error.value = ''

  const res = await updateProfile(form.value)
  if (res.success) {
    showProfileDialog.value = false
  } else {
    error.value = res.message || '保存失败'
  }
  saving.value = false
}

async function saveBio() {
  saving.value = true
  error.value = ''

  const res = await updateProfile({ bio: bioForm.value })
  if (res.success) {
    showBioDialog.value = false
  } else {
    error.value = res.message || '保存失败'
  }
  saving.value = false
}

onMounted(loadProfile)
watch(() => route.query.id, loadProfile)
</script>

<template>
  <div class="container mx-auto max-w-4xl px-4 py-8">
    <!-- 加载中 -->
    <div v-if="loading" class="flex items-center justify-center py-20">
      <Loader2 class="size-6 animate-spin text-muted-foreground" />
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
              <div v-if="otherProfile?.createdAt" class="flex items-center gap-2">
                <CalendarDays class="size-4 shrink-0" />
                <span>加入于 {{ formatDate(otherProfile.createdAt) }}</span>
              </div>
              <div v-if="otherProfile?.region" class="flex items-center gap-2">
                <MapPin class="size-4 shrink-0" />
                <span>{{ otherProfile.region }}</span>
              </div>
              <div v-else class="flex items-center gap-2 text-muted-foreground/50">
                <MapPin class="size-4 shrink-0" />
                <span>未设置地区</span>
              </div>
            </div>

            <Button v-if="canEdit" variant="outline" size="sm" class="w-full" @click="openProfileDialog">
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
            <Button v-if="canEdit" variant="ghost" size="sm" @click="openBioDialog">
              <Pencil class="size-3.5" data-icon />
              编辑简介
            </Button>
          </div>

          <TabsContent value="bio" class="mt-3">
            <Card>
              <CardContent>
                <div v-if="otherProfile?.bio" class="prose text-sm leading-relaxed whitespace-pre-wrap">{{ otherProfile.bio }}</div>
                <div v-else class="text-sm text-muted-foreground italic">这个人很懒，什么都没有写。</div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>

    <!-- 编辑个人资料弹窗 -->
    <Dialog v-model:open="showProfileDialog">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>编辑个人资料</DialogTitle>
        </DialogHeader>
        <FieldGroup>
          <Field>
            <FieldLabel for="edit-name">用户名</FieldLabel>
            <Input id="edit-name" v-model="form.name" />
          </Field>
          <Field>
            <FieldLabel for="edit-avatar">头像 URL</FieldLabel>
            <Input id="edit-avatar" v-model="form.avatar" placeholder="https://..." />
          </Field>
          <Field>
            <FieldLabel for="edit-signature">签名</FieldLabel>
            <Input id="edit-signature" v-model="form.signature" placeholder="写点什么..." />
          </Field>
          <Field>
            <FieldLabel for="edit-region">地区</FieldLabel>
            <Input id="edit-region" v-model="form.region" placeholder="中国·北京" />
          </Field>
        </FieldGroup>
        <p v-if="error" class="text-sm text-destructive">{{ error }}</p>
        <DialogFooter>
          <Button variant="outline" :disabled="saving" @click="showProfileDialog = false">取消</Button>
          <Button :disabled="saving" @click="saveProfile">
            <Loader2 v-if="saving" class="size-3.5 animate-spin" data-icon />
            保存
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- 编辑简介弹窗 -->
    <Dialog v-model:open="showBioDialog">
      <DialogContent class="max-w-lg">
        <DialogHeader>
          <DialogTitle>编辑个人简介</DialogTitle>
        </DialogHeader>
        <Textarea v-model="bioForm" rows="12" placeholder="支持 Markdown..." class="font-mono text-sm" />
        <p v-if="error" class="text-sm text-destructive">{{ error }}</p>
        <DialogFooter>
          <Button variant="outline" :disabled="saving" @click="showBioDialog = false">取消</Button>
          <Button :disabled="saving" @click="saveBio">
            <Loader2 v-if="saving" class="size-3.5 animate-spin" data-icon />
            保存
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
