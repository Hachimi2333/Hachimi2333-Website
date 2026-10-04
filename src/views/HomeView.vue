<script setup lang="ts">
import { useRouter } from 'vue-router'
import { BookOpen, Wrench, ArrowRight } from '@lucide/vue'
import { Button } from '@/components/ui/button'
import GithubMark from '@/components/icons/GithubMark.vue'

const router = useRouter()
</script>

<template>
  <div class="flex h-full items-center justify-center">
    <div class="flex flex-col items-center gap-8 text-center">
      <!-- Avatar -->
      <div class="relative">
        <img
          src="/avatar.webp"
          alt="Hachimi2333"
          class="size-32 rounded-2xl object-cover shadow-lg"
        />
        <div class="absolute -right-1 -bottom-1 size-8 rounded-full border-4 border-background bg-green-500" />
      </div>

      <!-- One-liner -->
      <div class="flex flex-col gap-2">
        <h1 class="text-3xl font-bold tracking-tight md:text-4xl">
          Hachimi2333
        </h1>
        <p class="max-w-md text-lg text-muted-foreground">
          青空一直線、目指せ一着！
        </p>
      </div>

      <!-- Buttons -->
      <div class="flex flex-wrap justify-center gap-3">
        <Button class="group" @click="router.push('/posts')">
          <BookOpen data-icon="inline-start" />
          博客
          <ArrowRight
            data-icon="inline-end"
            class="transition-transform group-hover:translate-x-1"
          />
        </Button>
        <Button variant="outline" @click="router.push('/tools')">
          <Wrench data-icon="inline-start" />
          工具
        </Button>
        <Button variant="outline" as-child>
          <a href="https://github.com/hachimi2333" target="_blank" rel="noopener noreferrer">
            <GithubMark data-icon="inline-start" />
            GitHub
          </a>
        </Button>
      </div>
    </div>
  </div>
</template>
