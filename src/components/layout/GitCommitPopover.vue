<script setup lang="ts">
import { ExternalLinkIcon, GitCommitIcon } from '@lucide/vue'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useGitInfo } from '@/composables/useGitInfo'

const { gitInfo, commitUrl, formattedBody } = useGitInfo()
</script>

<template>
  <Popover>
    <PopoverTrigger as-child>
      <Button
        variant="ghost"
        size="sm"
        class="gap-1.5 px-1.5 font-mono text-xs text-muted-foreground"
      >
        <GitCommitIcon data-icon="inline-start" />
        {{ gitInfo.hash }}
      </Button>
    </PopoverTrigger>

    <PopoverContent side="top" :side-offset="8" class="w-80">
      <div class="flex flex-col gap-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <GitCommitIcon class="size-4 text-muted-foreground" />
            <span class="font-mono text-sm font-medium">{{ gitInfo.hash }}</span>
          </div>
          <a
            v-if="commitUrl"
            :href="commitUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            GitHub
            <ExternalLinkIcon class="size-3" />
          </a>
        </div>

        <div class="rounded-md bg-muted/50 p-3">
          <p class="text-sm font-medium">{{ gitInfo.subject }}</p>
          <p
            v-if="formattedBody"
            class="mt-2 text-xs whitespace-pre-line text-muted-foreground"
          >
            {{ formattedBody }}
          </p>
        </div>

        <div class="flex items-center gap-3 text-xs">
          <span class="text-[#3fb950]">+{{ gitInfo.insertions }}</span>
          <span class="text-[#f85149]">-{{ gitInfo.deletions }}</span>
          <span class="text-muted-foreground">{{ gitInfo.filesChanged }} files</span>
        </div>
      </div>
    </PopoverContent>
  </Popover>
</template>
