<script setup lang="ts">
import { type HTMLAttributes, type Ref, computed, inject, ref } from 'vue'
import { cn } from '@/lib/utils'

const props = withDefaults(defineProps<{
  value: string
  class?: HTMLAttributes['class']
}>(), {
  class: '',
})

const activeTab = inject<Ref<string>>('activeTab', ref(''))

const isActive = computed(() => activeTab.value === props.value)

const delegatedProps = computed(() => {
  const { class: _, ...delegated } = props
  return delegated
})
</script>

<template>
  <div
    v-if="isActive"
    v-bind="delegatedProps"
    role="tabpanel"
    :class="cn(
      'ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
      props.class,
    )"
  >
    <slot />
  </div>
</template>
