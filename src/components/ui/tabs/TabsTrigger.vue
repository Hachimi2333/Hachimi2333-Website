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
const activateTab = inject<((value: string) => void)>('activateTab', () => {})

function onClick() {
  activateTab(props.value)
}

const isActive = computed(() => activeTab.value === props.value)

const delegatedProps = computed(() => {
  const { class: _, ...delegated } = props
  return delegated
})
</script>

<template>
  <button
    v-bind="delegatedProps"
    :class="cn(
      'inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
      isActive
        ? 'bg-background text-foreground shadow-sm'
        : 'hover:bg-background/50 hover:text-foreground',
      props.class,
    )"
    @click="onClick"
  >
    <slot />
  </button>
</template>
