<script setup lang="ts">
import { type HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'

const props = defineProps<{
  class?: HTMLAttributes['class']
}>()
</script>

<template>
  <a :class="cn('transition-colors hover:text-foreground', props.class)">
    <slot />
  </a>
</template>
