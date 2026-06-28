<script setup lang="ts">
import { ref, watch } from 'vue'
import { useProfile } from '@/composables/useProfile'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Loader2 } from 'lucide-vue-next'

const props = defineProps<{ bio: string }>()

const open = defineModel<boolean>('open', { default: false })

const { updateProfile } = useProfile()

const saving = ref(false)
const error = ref('')
const bioForm = ref('')

watch(open, (val) => {
  if (val) {
    bioForm.value = props.bio
    error.value = ''
  }
})

async function save() {
  saving.value = true
  error.value = ''

  const res = await updateProfile({ bio: bioForm.value })
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
    <DialogContent class="max-w-lg">
      <DialogHeader>
        <DialogTitle>编辑个人简介</DialogTitle>
      </DialogHeader>
      <Textarea v-model="bioForm" rows="12" placeholder="支持 Markdown..." class="font-mono text-sm" />
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
