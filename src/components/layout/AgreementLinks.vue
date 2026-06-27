<script setup lang="ts">
import { ref } from 'vue'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import AgreementDialog from '@/components/auth/AgreementDialog.vue'
import UserAgreementContent from '@/components/auth/UserAgreementContent.vue'
import PrivacyPolicyContent from '@/components/auth/PrivacyPolicyContent.vue'

const showUserAgreement = ref(false)
const showPrivacyPolicy = ref(false)
</script>

<template>
  <Popover>
    <PopoverTrigger as-child>
      <button class="hover:text-foreground transition-colors cursor-pointer font-medium">
        协议
      </button>
    </PopoverTrigger>
    <PopoverContent side="top" :side-offset="8" class="w-auto">
      <div class="flex flex-col gap-1 text-sm text-muted-foreground">
        <button
          class="hover:text-foreground transition-colors cursor-pointer text-left"
          @click="showUserAgreement = true"
        >
          用户协议
        </button>
        <button
          class="hover:text-foreground transition-colors cursor-pointer text-left"
          @click="showPrivacyPolicy = true"
        >
          隐私政策
        </button>
      </div>
    </PopoverContent>
  </Popover>

  <AgreementDialog v-model:open="showUserAgreement" title="用户协议" updated-at="2026年6月27日">
    <UserAgreementContent />
  </AgreementDialog>

  <AgreementDialog v-model:open="showPrivacyPolicy" title="隐私政策" updated-at="2026年6月27日">
    <PrivacyPolicyContent />
  </AgreementDialog>
</template>
