<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FieldGroup, Field, FieldLabel, FieldDescription } from '@/components/ui/field'
import { LogIn } from 'lucide-vue-next'

const router = useRouter()
const route = useRoute()
const { login } = useAuth()

const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function handleLogin() {
  error.value = ''
  loading.value = true

  try {
    const result = await login(email.value, password.value)
    if (result.success) {
      const redirect = (route.query.redirect as string) || '/'
      router.push(redirect)
    } else {
      error.value = result.message || '登录失败'
    }
  } catch {
    error.value = '网络错误，请稍后重试'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="container mx-auto max-w-md px-4 py-16">
    <Card>
      <CardHeader class="text-center">
        <CardTitle class="text-2xl">登录</CardTitle>
        <CardDescription>登录你的 Hachimi2333 账户</CardDescription>
      </CardHeader>
      <CardContent>
        <form @submit.prevent="handleLogin">
          <FieldGroup>
            <Field :data-invalid="!!error">
              <FieldLabel for="email">邮箱</FieldLabel>
              <Input
                id="email"
                v-model="email"
                type="email"
                placeholder="your@email.com"
                required
              />
            </Field>
            <Field :data-invalid="!!error">
              <FieldLabel for="password">密码</FieldLabel>
              <Input
                id="password"
                v-model="password"
                type="password"
                placeholder="输入密码"
                required
              />
              <FieldDescription v-if="error" class="text-destructive">
                {{ error }}
              </FieldDescription>
            </Field>
            <Button type="submit" class="w-full" :disabled="loading">
              <LogIn data-icon="inline-start" />
              {{ loading ? '登录中...' : '登录' }}
            </Button>
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter class="justify-center">
        <p class="text-sm text-muted-foreground">
          还没有账户？
          <router-link to="/auth/register" class="text-primary hover:underline">注册</router-link>
        </p>
      </CardFooter>
    </Card>
  </div>
</template>
