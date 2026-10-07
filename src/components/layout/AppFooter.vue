<script setup lang="ts">
import { onMounted, ref } from 'vue'
import SystemInfoPopover from './SystemInfoPopover.vue'
import BeianInfo from './BeianInfo.vue'
import ClientOnly from '@/components/common/ClientOnly.vue'
import { buildInfo } from '@/lib/build'
import { SITE_NAME } from '@/lib/site'

/**
 * The copyright year is the build year in the markup and the current year once
 * the client takes over.
 *
 * Rendering `new Date().getFullYear()` directly would produce a hydration
 * mismatch for every visitor in a year the site was not rebuilt in; rendering
 * only the build year would leave the notice permanently stale. Starting from
 * the inlined build year and refreshing after mount is correct in both cases
 * and cannot mismatch.
 */
const year = ref(__BUILD_YEAR__)

onMounted(() => {
  year.value = new Date().getFullYear()
})
</script>

<template>
  <footer class="mt-auto border-t border-border/60">
    <div
      class="mx-auto flex w-full max-w-5xl flex-col gap-2 px-4 py-6 text-xs text-muted-foreground sm:px-6"
    >
      <div class="flex flex-wrap items-center gap-x-3 gap-y-2">
        <p>
          &copy; {{ year }}
          <router-link to="/" class="font-medium transition-colors hover:text-foreground">
            {{ SITE_NAME }}
          </router-link>
        </p>

        <span class="text-border" aria-hidden="true">/</span>

        <ClientOnly>
          <SystemInfoPopover />
          <template #fallback>
            <span class="px-1.5 font-mono text-xs">{{ buildInfo.version.site ? `v${buildInfo.version.site}` : '系统信息' }}</span>
          </template>
        </ClientOnly>

        <div class="ml-auto hidden sm:block">
          <BeianInfo />
        </div>
      </div>

      <div class="sm:hidden">
        <BeianInfo />
      </div>
    </div>
  </footer>
</template>
