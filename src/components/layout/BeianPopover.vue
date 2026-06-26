<script setup lang="ts">
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
</script>

<template>
  <Popover>
    <PopoverTrigger as-child>
      <button class="hover:text-foreground transition-colors cursor-pointer font-medium">
        备案信息
      </button>
    </PopoverTrigger>
    <PopoverContent side="top" :side-offset="8" class="w-auto">
      <div class="flex flex-col gap-1 text-sm text-muted-foreground">
        <a
          href="https://beian.miit.gov.cn/"
          target="_blank"
          rel="noopener noreferrer"
          class="hover:text-foreground transition-colors"
        >
          粤ICP备2026003234号-1
        </a>
        <a
          href="https://beian.mps.gov.cn/#/query/webSearch?code=44030002010010"
          target="_blank"
          rel="noopener noreferrer"
          class="hover:text-foreground transition-colors"
        >
          粤公网安备44030002010010号
        </a>
      </div>
    </PopoverContent>
  </Popover>
</template>
