<script setup lang="ts">
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { GitCommit, ExternalLink } from 'lucide-vue-next'
import { useGitInfo } from '@/composables/useGitInfo'

const { gitInfo, commitUrl, formattedBody } = useGitInfo()
</script>

<template>
  <Popover>
    <PopoverTrigger as-child>
      <button class="inline-flex items-center gap-1.5 hover:text-foreground transition-colors cursor-pointer font-mono text-xs">
        <GitCommit class="size-3.5" />
        {{ gitInfo.hash }}
      </button>
    </PopoverTrigger>
    <PopoverContent side="top" :side-offset="8" class="w-80">
      <div class="space-y-3">
        <!-- Commit Hash -->
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <GitCommit class="w-4 h-4 text-muted-foreground" />
            <span class="font-mono text-sm font-medium">{{ gitInfo.hash }}</span>
          </div>
          <a
            :href="commitUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            GitHub
            <ExternalLink class="w-3 h-3" />
          </a>
        </div>

        <!-- Commit Message -->
        <div class="rounded-none bg-muted/50 p-3">
          <p class="text-sm font-medium">{{ gitInfo.subject }}</p>
          <p v-if="formattedBody" class="mt-2 text-xs text-muted-foreground whitespace-pre-line">{{ formattedBody }}</p>
        </div>

        <!-- Stats & Diffstat -->
        <div class="flex items-center justify-between text-xs">
          <div class="flex items-center gap-3">
            <span class="text-[#3fb950]">+{{ gitInfo.insertions }}</span>
            <span class="text-[#f85149]">-{{ gitInfo.deletions }}</span>
          </div>
          <span class="text-muted-foreground">{{ gitInfo.filesChanged }} files</span>
          <!-- Diffstat Blocks - 暂时注释掉
          <span class="diffstat flex items-center gap-[1px]">
            <template v-for="(type, index) in diffstatBlocks" :key="index">
              <span
                class="inline-block w-[8px] h-[8px] rounded-none"
                :class="{
                  'bg-[#3fb950]': type === 'green',
                  'bg-[#f85149]': type === 'red',
                  'bg-[#6e7681]': type === 'neutral',
                }"
              />
            </template>
          </span>
          -->
        </div>
      </div>
    </PopoverContent>
  </Popover>
</template>
