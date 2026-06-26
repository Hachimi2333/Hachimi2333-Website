<script setup lang="ts">
import GitCommitPopover from './GitCommitPopover.vue'
import BeianPopover from './BeianPopover.vue'
</script>

<template>
  <footer class="border-t py-4 sm:py-6 mt-auto">
    <div class="container mx-auto max-w-4xl px-4">
      <div class="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
        <div class="flex items-center gap-1.5 sm:gap-2">
          <p>
            &copy; {{ new Date().getFullYear() }}
            <a
              href="https://www.hachimi2333.top/"
              target="_blank"
              rel="noopener noreferrer"
              class="hover:text-foreground transition-colors font-medium"
            >
              Hachimi2333
            </a>
          </p>
          <GitCommitPopover />
        </div>
        <div class="ml-auto">
          <BeianPopover />
        </div>
      </div>
    </div>
  </footer>
</template>
