<script setup lang="ts">
/**
 * Decorative square-rain backdrop.
 *
 * Extracted from `AppLayout` and made much cheaper: the previous version
 * rendered 30 x 20 = 600 tiles, each running its own infinite CSS animation, on
 * every page. A 12 x 8 grid (96 tiles) is visually equivalent at this opacity
 * while cutting the node count by ~84%.
 *
 * Delays come from a deterministic formula rather than `Math.random()` so the
 * backdrop does not re-shuffle on every render, and the whole effect is
 * disabled for visitors who ask for reduced motion.
 */
const COLS = 12
const ROWS = 8

const gridStyle = {
  gridTemplateColumns: `repeat(${COLS}, 1fr)`,
  gridTemplateRows: `repeat(${ROWS}, 1fr)`,
}

const tiles = Array.from({ length: COLS * ROWS }, (_, index) => {
  const col = index % COLS
  const row = Math.floor(index / COLS)
  // Cheap deterministic hash so neighbouring tiles do not pulse together.
  const delay = ((col * 7 + row * 5) % 13) / 13 * 3
  return { index, delay }
})
</script>

<template>
  <div class="square-rain" :style="gridStyle" aria-hidden="true">
    <div
      v-for="tile in tiles"
      :key="tile.index"
      class="square-rain__tile"
      :style="{ animationDelay: `${tile.delay}s` }"
    />
  </div>
</template>

<style scoped>
.square-rain {
  position: fixed;
  inset: 0;
  z-index: 0;
  display: grid;
  gap: 4px;
  padding: 4px;
  overflow: hidden;
  pointer-events: none;
}

.square-rain__tile {
  background: var(--foreground);
  opacity: 0;
  animation: square-rain 3s linear infinite;
}

@keyframes square-rain {
  0%,
  100% {
    opacity: 0;
  }
  5% {
    opacity: 0.04;
  }
  15% {
    opacity: 0.02;
  }
  25% {
    opacity: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .square-rain {
    display: none;
  }
}
</style>
