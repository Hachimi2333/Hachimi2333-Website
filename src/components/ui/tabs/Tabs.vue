<script setup lang="ts">
import { type HTMLAttributes, computed, provide, ref, watch } from 'vue'
import { cn } from '@/lib/utils'

const props = withDefaults(defineProps<{
  defaultValue?: string
  modelValue?: string
  class?: HTMLAttributes['class']
}>(), {
  defaultValue: '',
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const activeTab = ref(props.modelValue || props.defaultValue)

watch(() => props.modelValue, (val) => {
  if (val !== undefined && val !== activeTab.value) {
    activeTab.value = val
  }
})

watch(activeTab, (val) => {
  emit('update:modelValue', val)
})

function activateTab(value: string) {
  activeTab.value = value
}

provide('activeTab', activeTab)
provide('activateTab', activateTab)

defineExpose({ activateTab })

const delegatedProps = computed(() => {
  const { class: _, ...delegated } = props
  return delegated
})
</script>

<template>
  <div v-bind="delegatedProps" :class="cn('w-full', props.class)">
    <slot />
  </div>
</template>
