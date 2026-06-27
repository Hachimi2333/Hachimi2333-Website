<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FieldGroup, Field, FieldLabel, FieldDescription } from '@/components/ui/field'
import { UserPlus } from 'lucide-vue-next'
import AgreementCheckbox from '@/components/auth/AgreementCheckbox.vue'

const router = useRouter()
const { register } = useAuth()

const name = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const error = ref('')
const loading = ref(false)
const agreed = ref(false)

async function handleRegister() {
  error.value = ''

  if (password.value !== confirmPassword.value) {
    error.value = '两次输入的密码不一致'
    return
  }

  if (password.value.length < 6) {
    error.value = '密码至少6个字符'
    return
  }

  if (!agreed.value) {
    error.value = '请阅读并同意用户协议和隐私政策'
    return
  }

  loading.value = true

  try {
    const result = await register(email.value, name.value, password.value)
    if (result.success) {
      router.push('/')
    } else {
      error.value = result.message || '注册失败'
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
        <CardTitle class="text-2xl">注册</CardTitle>
        <CardDescription>创建你的 Hachimi2333 账户</CardDescription>
      </CardHeader>
      <CardContent>
        <form @submit.prevent="handleRegister">
          <FieldGroup>
            <Field :data-invalid="!!error">
              <FieldLabel for="name">用户名</FieldLabel>
              <Input
                id="name"
                v-model="name"
                placeholder="输入用户名"
                required
              />
            </Field>
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
                placeholder="至少6位"
                required
              />
            </Field>
            <Field :data-invalid="!!error">
              <FieldLabel for="confirm-password">确认密码</FieldLabel>
              <Input
                id="confirm-password"
                v-model="confirmPassword"
                type="password"
                placeholder="再次输入密码"
                required
              />
              <FieldDescription v-if="error" class="text-destructive">
                {{ error }}
              </FieldDescription>
            </Field>
            <AgreementCheckbox v-model="agreed" />
            <Button type="submit" class="w-full" :disabled="loading || !agreed">
              <UserPlus data-icon="inline-start" />
              {{ loading ? '注册中...' : '注册' }}
            </Button>
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter class="justify-center">
        <p class="text-sm text-muted-foreground">
          已有账户？
          <router-link to="/auth/login" class="text-primary hover:underline">登录</router-link>
        </p>
      </CardFooter>
    </Card>
  </div>
</template>
