<script setup lang="ts">
import { ref } from 'vue'
import { ExternalLinkIcon, PackageIcon, RefreshCwIcon } from '@lucide/vue'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useSystemInfo } from '@/composables/useSystemInfo'

/**
 * The footer's system information panel.
 *
 * Everything shown here is detected, never written down: the build inlined what
 * it could from git and from `process`, and the two network rows are filled in by
 * asking whoever answered the request (see src/lib/network.ts). Nothing takes a
 * value from this file's own source.
 *
 * Layout notes:
 * - Rows are rendered from data, so adding a fact means adding an entry to
 *   `useSystemInfo`, not another copy of this markup.
 * - The styling is deliberately quiet: a commit header, then each fact group is
 *   just a small labelled row block separated by whitespace -- no badges or boxes.
 *   That keeps the long commit subject from pushing the card's height around while
 *   staying out of the way of the rest of the page.
 * - The card has no `<Teleport>` of its own (reka's `PopoverContent` portals, and
 *   this subtree never renders on the server -- see the `<ClientOnly>` wrapper in
 *   AppFooter), so it cannot disturb a prerendered page.
 */
const open = ref(false)

const { buildInfo, commitUrl, sections, network, probing, probe, icons } = useSystemInfo()

/**
 * Probe on the first opening only.
 *
 * Doing this at mount would put an extra request on every page load; doing it
 * inside the render would make the render asynchronous. Opening the panel is the
 * moment the visitor asks for the information.
 */
function onOpenChange(value: boolean): void {
  open.value = value
  if (value) void probe()
}
</script>

<template>
  <Popover :open="open" @update:open="onOpenChange">
    <PopoverTrigger as-child>
      <Button
        variant="ghost"
        size="sm"
        class="gap-1.5 px-1.5 font-mono text-xs text-muted-foreground transition-colors hover:text-foreground"
        title="系统信息"
      >
        <PackageIcon data-icon="inline-start" />
        <span v-if="buildInfo.version.site">{{ `v${buildInfo.version.site}` }}</span>
        <span v-else>系统信息</span>
      </Button>
    </PopoverTrigger>

    <PopoverContent
      side="top"
      :side-offset="8"
      class="flex max-h-[75svh] w-80 flex-col gap-0 p-0 sm:w-96"
    >
      <!-- Header: the commit the page was built from -->
      <header class="flex shrink-0 items-center justify-between gap-2 border-b border-border px-4 py-3">
        <div class="flex min-w-0 items-center gap-2">
          <component :is="icons.commit" class="size-4 shrink-0 text-muted-foreground" />
          <span
            class="truncate font-mono text-sm font-medium"
            :title="buildInfo.commit.hashFull || buildInfo.commit.hash"
          >
            {{ buildInfo.commit.hash }}
          </span>
        </div>

        <a
          v-if="commitUrl"
          :href="commitUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex shrink-0 items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          GitHub
          <ExternalLinkIcon class="size-3" />
        </a>
      </header>

      <!-- Body: grouped facts, separated by whitespace only -->
      <div class="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4 py-4">
        <section v-for="section in sections" :key="section.title" class="flex flex-col gap-1.5">
          <div class="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <component :is="section.icon" class="size-3.5" />
            {{ section.title }}
          </div>

          <dl class="flex flex-col gap-1.5">
            <div
              v-for="row in section.rows"
              :key="row.label"
              class="flex items-baseline justify-between gap-4"
            >
              <dt class="shrink-0 text-xs text-muted-foreground">{{ row.label }}</dt>
              <dd
                class="min-w-0 max-w-[65%] text-right text-sm"
                :class="row.mono && 'font-mono'"
              >
                <span class="block truncate" :title="row.value">{{ row.value }}</span>
                <span v-if="row.hint" class="block text-xs text-muted-foreground">
                  {{ row.hint }}
                </span>
              </dd>
            </div>
          </dl>
        </section>
      </div>

      <!-- Footer: retry only when the probe failed -->
      <footer v-if="network?.error" class="shrink-0 border-t border-border px-4 py-3">
        <Button variant="outline" size="sm" class="w-full" @click="probe()">
          <RefreshCwIcon data-icon="inline-start" :class="probing && 'animate-spin'" />
          重新检测网络
        </Button>
      </footer>
    </PopoverContent>
  </Popover>
</template>
