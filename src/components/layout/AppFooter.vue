<script setup lang="ts">
import GitCommitPopover from './GitCommitPopover.vue'
import BeianInfo from './BeianInfo.vue'
import AgreementLinks from './AgreementLinks.vue'
</script>

<template>
  <footer class="border-t py-4 sm:py-6 mt-auto">
    <div class="container mx-auto max-w-4xl px-4">
      <div class="flex flex-wrap items-center gap-x-2 gap-y-1 sm:gap-x-4 text-xs sm:text-sm text-muted-foreground">
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
        <span class="text-muted-foreground/50">|</span>
        <GitCommitPopover />
        <span class="text-muted-foreground/50">|</span>
        <AgreementLinks />
        <div class="hidden sm:block ml-auto">
          <BeianInfo />
        </div>
        <div class="basis-full sm:hidden">
          <BeianInfo />
        </div>
      </div>
    </div>
  </footer>
</template>
