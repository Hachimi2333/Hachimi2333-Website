<script setup lang="ts">
import { ref, watch } from 'vue'
import { useProfile } from '@/composables/useProfile'
import type { User } from '@/types/user'
import { Button } from '@/components/ui/button'
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Loader2 } from 'lucide-vue-next'

const props = defineProps<{ user: User | null }>()

const open = defineModel<boolean>('open', { default: false })

const { updateProfile } = useProfile()

const saving = ref(false)
const error = ref('')
const form = ref({ name: '', avatar: '', signature: '', region: '' })

watch(open, (val) => {
  if (val && props.user) {
    form.value = {
      name: props.user.name,
      avatar: props.user.avatar || '',
      signature: props.user.signature || '',
      region: props.user.region || '',
    }
    error.value = ''
  }
})

async function save() {
  saving.value = true
  error.value = ''

  const res = await updateProfile(form.value)
  if (res.success) {
    open.value = false
  } else {
    error.value = res.message || '保存失败'
  }
  saving.value = false
}
</script>

<template>
  <Dialog v-model:open="open">
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
        <Button variant="outline" :disabled="saving" @click="open = false">取消</Button>
        <Button :disabled="saving" @click="save">
          <Loader2 v-if="saving" class="size-3.5 animate-spin" data-icon />
          保存
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
