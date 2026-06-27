<script setup lang="ts">
import {
  Dialog,
  DialogDescription,
  DialogHeader,
  DialogScrollContent,
  DialogTitle,
} from '@/components/ui/dialog'

defineProps<{
  title: string
  updatedAt?: string
}>()

const open = defineModel<boolean>('open')
</script>

<template>
  <Dialog v-model:open="open">
    <DialogScrollContent class="max-w-[calc(100%-2rem)] rounded-none sm:max-w-2xl sm:rounded-lg">
      <DialogHeader>
        <DialogTitle>
          {{ title }}
          <span v-if="updatedAt" class="ml-2 text-sm font-normal text-muted-foreground">
            最后更新：{{ updatedAt }}
          </span>
        </DialogTitle>
        <DialogDescription class="sr-only">{{ title }}的详细内容</DialogDescription>
      </DialogHeader>
      <slot />
    </DialogScrollContent>
  </Dialog>
</template>
