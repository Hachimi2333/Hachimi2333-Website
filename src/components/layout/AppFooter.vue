<script setup lang="ts">
import { Github, Mail } from 'lucide-vue-next'
</script>

<template>
  <footer class="border-t py-8 mt-auto">
    <div class="container mx-auto max-w-4xl px-4 text-center text-sm text-muted-foreground">

      <p>&copy; 2021 - {{ new Date().getFullYear() }} <a href="https://www.hachimi2333.top/" target="_blank" rel="noopener noreferrer" class="hover:text-foreground transition-colors">Hachimi2333</a></p>
      <div class="flex flex-col items-center gap-1 mt-2">
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
  </footer>
</template>
