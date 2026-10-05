<script setup lang="ts">
import { onMounted, ref } from 'vue'

/**
 * Render the default slot only once the client has mounted.
 *
 * Written for reka-ui's `Popover`, which does not produce hydratable markup in
 * its closed state: the server emits a `v-if` placeholder where the client
 * renders a different fragment structure, so every page logged "Hydration
 * completed but contains mismatches" from the footer's commit popover.
 *
 * Rendering the `fallback` slot on both the server and the client's first pass
 * keeps the two identical, and the interactive version replaces it after mount.
 * Always provide a fallback that occupies the same space, or the swap will shift
 * the layout.
 */
const mounted = ref(false)

onMounted(() => {
  mounted.value = true
})
</script>

<template>
  <slot v-if="mounted" />
  <slot v-else name="fallback" />
</template>
