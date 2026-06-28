<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useAuth } from '@/composables/useAuth'
import { adminGetUsers, adminUpdateUser, adminDeleteUser } from '@/lib/admin'
import type { User } from '@/types/user'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import PageBreadcrumb from '@/components/layout/PageBreadcrumb.vue'
import { Users, Shield, MoreHorizontal, Pencil, Trash2, Loader2, User as UserIcon } from 'lucide-vue-next'
import { formatDate } from '@/lib/date'

const { verified } = useAuth()

const users = ref<User[]>([])
const loading = ref(true)

// Edit state
const editOpen = ref(false)
const editUser = ref<User | null>(null)
const editForm = ref({ name: '', isAdmin: false })
const editSaving = ref(false)
const editError = ref('')

// Delete state
const deleteOpen = ref(false)
const deleteUser = ref<User | null>(null)
const deleteSaving = ref(false)

const totalUsers = computed(() => users.value.length)
const adminCount = computed(() => users.value.filter((u) => u.isAdmin).length)

async function loadUsers() {
  loading.value = true
  users.value = await adminGetUsers()
  loading.value = false
}

function openEdit(user: User) {
  editUser.value = user
  editForm.value = { name: user.name, isAdmin: user.isAdmin }
  editError.value = ''
  editOpen.value = true
}

async function saveEdit() {
  if (!editUser.value) return
  editSaving.value = true
  editError.value = ''

  const ok = await adminUpdateUser(editUser.value.id, editForm.value)
  if (ok) {
    editOpen.value = false
    await loadUsers()
  } else {
    editError.value = '保存失败'
  }
  editSaving.value = false
}

function openDelete(user: User) {
  deleteUser.value = user
  deleteOpen.value = true
}

async function confirmDelete() {
  if (!deleteUser.value) return
  deleteSaving.value = true

  const ok = await adminDeleteUser(deleteUser.value.id)
  if (ok) {
    deleteOpen.value = false
    await loadUsers()
  }
  deleteSaving.value = false
}

watch(verified, (ready) => {
  if (ready) loadUsers()
}, { immediate: true })
</script>

<template>
  <div class="container mx-auto max-w-4xl px-4 py-8">
    <PageBreadcrumb :items="[{ label: '首页', to: '/' }, { label: '后台管理' }]" />

    <!-- Header -->
    <header class="mb-6">
      <h1 class="text-3xl font-bold tracking-tight">后台管理</h1>
      <p class="text-muted-foreground mt-1">管理网站用户和设置</p>
    </header>

    <!-- Stats -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
      <Card>
        <CardHeader class="flex flex-row items-center justify-between pb-2">
          <CardTitle class="text-sm font-medium text-muted-foreground">总用户数</CardTitle>
          <Users class="text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <template v-if="loading">
            <Skeleton class="h-8 w-16" />
          </template>
          <template v-else>
            <p class="text-3xl font-bold">{{ totalUsers }}</p>
          </template>
        </CardContent>
      </Card>
      <Card>
        <CardHeader class="flex flex-row items-center justify-between pb-2">
          <CardTitle class="text-sm font-medium text-muted-foreground">管理员</CardTitle>
          <Shield class="text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <template v-if="loading">
            <Skeleton class="h-8 w-16" />
          </template>
          <template v-else>
            <p class="text-3xl font-bold">{{ adminCount }}</p>
          </template>
        </CardContent>
      </Card>
    </div>

    <!-- Users Table -->
    <Card>
      <CardHeader>
        <CardTitle>用户列表</CardTitle>
        <CardDescription>所有注册用户的管理</CardDescription>
      </CardHeader>
      <CardContent>
        <!-- Loading skeletons -->
        <template v-if="loading">
          <div class="flex flex-col gap-3">
            <Skeleton v-for="i in 5" :key="i" class="h-12 w-full" />
          </div>
        </template>

        <!-- Empty state -->
        <template v-else-if="users.length === 0">
          <div class="flex flex-col items-center justify-center py-12 gap-3">
            <Users class="text-muted-foreground" />
            <p class="text-muted-foreground">暂无用户</p>
          </div>
        </template>

        <!-- Table -->
        <template v-else>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>用户</TableHead>
                <TableHead>邮箱</TableHead>
                <TableHead>角色</TableHead>
                <TableHead>注册时间</TableHead>
                <TableHead class="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="u in users" :key="u.id">
                <TableCell>
                  <div class="flex items-center gap-3">
                    <Avatar class="size-8">
                      <AvatarImage :src="u.avatar || ''" :alt="u.name" />
                      <AvatarFallback>
                        <UserIcon />
                      </AvatarFallback>
                    </Avatar>
                    <span class="font-medium">{{ u.name }}</span>
                  </div>
                </TableCell>
                <TableCell class="text-muted-foreground">{{ u.email }}</TableCell>
                <TableCell>
                  <Badge v-if="u.isAdmin" variant="default">管理员</Badge>
                  <Badge v-else variant="secondary">用户</Badge>
                </TableCell>
                <TableCell class="text-muted-foreground">{{ formatDate(u.createdAt) }}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger as-child>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuGroup>
                        <DropdownMenuItem @click="openEdit(u)">
                          <Pencil />
                          编辑
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          class="text-destructive"
                          @click="openDelete(u)"
                        >
                          <Trash2 />
                          删除
                        </DropdownMenuItem>
                      </DropdownMenuGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </template>
      </CardContent>
    </Card>

    <!-- Edit Dialog -->
    <Dialog v-model:open="editOpen">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>编辑用户</DialogTitle>
        </DialogHeader>
        <FieldGroup>
          <Field>
            <FieldLabel for="edit-name">用户名</FieldLabel>
            <Input id="edit-name" v-model="editForm.name" />
          </Field>
          <Field orientation="horizontal">
            <Checkbox id="edit-admin" v-model="editForm.isAdmin" />
            <Label for="edit-admin" class="font-normal">管理员权限</Label>
          </Field>
        </FieldGroup>
        <p v-if="editError" class="text-sm text-destructive">{{ editError }}</p>
        <DialogFooter>
          <Button variant="outline" :disabled="editSaving" @click="editOpen = false">取消</Button>
          <Button :disabled="editSaving" @click="saveEdit">
            <Loader2 v-if="editSaving" data-icon="inline-start" class="animate-spin" />
            保存
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- Delete AlertDialog -->
    <AlertDialog v-model:open="deleteOpen">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>确认删除</AlertDialogTitle>
          <AlertDialogDescription>
            确定要删除用户「{{ deleteUser?.name }}」吗？此操作不可撤销。
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel :disabled="deleteSaving">取消</AlertDialogCancel>
          <AlertDialogAction
            class="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            :disabled="deleteSaving"
            @click.prevent="confirmDelete"
          >
            <Loader2 v-if="deleteSaving" data-icon="inline-start" class="animate-spin" />
            删除
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>
</template>
