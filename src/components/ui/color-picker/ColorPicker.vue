<script setup lang="ts">
import { ref, watch } from 'vue'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const props = defineProps<{
  modelValue: string
  disabled?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const internalValue = ref(props.modelValue)

watch(() => props.modelValue, (v) => {
  internalValue.value = v
})

function onInput(e: Event) {
  const val = (e.target as HTMLInputElement).value
  internalValue.value = val
  emit('update:modelValue', val)
}

function onPickerInput(e: Event) {
  const val = (e.target as HTMLInputElement).value
  internalValue.value = val
  emit('update:modelValue', val)
}

function selectPreset(color: string) {
  internalValue.value = color
  emit('update:modelValue', color)
}

const presets = [
  '#000000', '#ffffff', '#ef4444', '#f97316', '#eab308',
  '#22c55e', '#14b8a6', '#3b82f6', '#6366f1', '#a855f7',
  '#ec4899', '#78716c', '#fca5a5', '#fdba74', '#fde047',
  '#86efac', '#5eead4', '#93c5fd', '#a5b4fc', '#c4b5fd',
  '#f9a8d4', '#a8a29e', '#dc2626', '#ea580c', '#ca8a04',
  '#16a34a', '#0d9488', '#2563eb', '#4f46e5', '#9333ea',
  '#db2777', '#57534e',
]
</script>

<template>
  <Popover>
    <PopoverTrigger as-child>
      <Button
        variant="outline"
        :disabled="disabled"
        class="h-8 w-8 p-0 border-input"
        :class="disabled ? 'opacity-40 cursor-not-allowed' : ''"
      >
        <span class="h-5 w-5 rounded-sm border border-input" :style="{ background: modelValue }" />
      </Button>
    </PopoverTrigger>
    <PopoverContent class="w-auto p-3" align="end">
      <div class="space-y-3">
        <div class="grid grid-cols-8 gap-1">
          <button
            v-for="color in presets"
            :key="color"
            class="h-6 w-6 rounded-sm border border-input transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
            :class="modelValue === color ? 'ring-2 ring-ring ring-offset-1' : ''"
            :style="{ background: color }"
            @click="selectPreset(color)"
          />
        </div>
        <div class="flex items-center gap-2">
          <div class="relative h-8 w-8 shrink-0 rounded-md border border-input overflow-hidden cursor-pointer">
            <div class="absolute inset-0" style="background: conic-gradient(red, yellow, lime, cyan, blue, magenta, red);" />
            <input
              type="color"
              :value="internalValue"
              class="absolute inset-0 opacity-0 cursor-pointer"
              @input="onPickerInput"
            />
          </div>
          <Input
            :model-value="internalValue"
            class="h-8 text-xs font-mono"
            maxlength="7"
            placeholder="#000000"
            @input="onInput"
            @change="onInput"
          />
        </div>
      </div>
    </PopoverContent>
  </Popover>
</template>
