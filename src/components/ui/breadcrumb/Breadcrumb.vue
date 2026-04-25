<script setup lang="ts">
import { type HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'

const props = defineProps<{
  class?: HTMLAttributes['class']
  separator?: boolean
}>()
</script>

<template>
  <nav :class="cn('flex items-center space-x-1 text-sm text-muted-foreground', props.class)">
    <slot />
  </nav>
</template>
