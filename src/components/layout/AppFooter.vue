<script setup lang="ts">
import GitCommitPopover from './GitCommitPopover.vue'
</script>

<template>
  <footer class="border-t py-8 mt-auto">
    <div class="container mx-auto max-w-4xl px-4">
      <div class="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
        <div class="flex items-center gap-4">
          <p>
            &copy; 2021 - {{ new Date().getFullYear() }}
            <a
              href="https://www.hachimi2333.top/"
              target="_blank"
              rel="noopener noreferrer"
              class="hover:text-foreground transition-colors font-medium"
            >
              Hachimi2333
            </a>
          </p>
          <span class="text-muted-foreground/50">·</span>
          <GitCommitPopover />
        </div>
        <div class="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
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
      </div>
    </div>
  </footer>
</template>
