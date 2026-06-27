<script setup lang="ts">
import { computed, ref } from 'vue'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import AgreementDialog from './AgreementDialog.vue'
import UserAgreementContent from './UserAgreementContent.vue'
import PrivacyPolicyContent from './PrivacyPolicyContent.vue'

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const checked = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const showUserAgreement = ref(false)
const showPrivacyPolicy = ref(false)
</script>

<template>
  <div class="flex items-start gap-2">
    <Checkbox id="agree" v-model="checked" class="mt-0.5" />
    <Label for="agree" class="text-sm font-normal leading-snug text-muted-foreground cursor-pointer">
      我已阅读并同意
      <button
        type="button"
        class="text-primary hover:underline"
        @click.stop="showUserAgreement = true"
      >
        用户协议
      </button>
      和
      <button
        type="button"
        class="text-primary hover:underline"
        @click.stop="showPrivacyPolicy = true"
      >
        隐私政策
      </button>
    </Label>
  </div>

  <AgreementDialog v-model:open="showUserAgreement" title="用户协议" updated-at="2026年6月27日">
    <UserAgreementContent />
  </AgreementDialog>

  <AgreementDialog v-model:open="showPrivacyPolicy" title="隐私政策" updated-at="2026年6月27日">
    <PrivacyPolicyContent />
  </AgreementDialog>
</template>
